const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { execSync } = require('child_process');
const Groq = require('groq-sdk');
const Insight = require('../models/Insight');
const Schedule = require('../models/Schedule');
const Analytics = require('../models/Analytics');

const processAudio = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = req.body.date || new Date().toISOString().split('T')[0];
        
        if (!req.files || (!req.files.audio && !req.files.voice)) {
            return res.status(400).json({ success: false, message: "Audio file is required" });
        }
        
        const audioFile = req.files.audio || req.files.voice;
        
        // 0. Normalize WebM stream offsets locally completely rebuilding strict EBML Cues
        // Forces DOM absolute timestamps (e.g. tracking index 60s) directly back to 0.0s baseline smoothly securely bypassing Pydub slicing mismatch blocks
        const normalizedWavPath = path.join(__dirname, `../temp_normalized_${Date.now()}.wav`);
        let activeProcessPath = audioFile.tempFilePath;
        let activeMimeType = (audioFile.name && audioFile.name.endsWith('.webm')) ? 'audio/ogg' : (audioFile.mimetype || 'audio/mpeg');
        let activeFilename = (audioFile.name || 'audio.mp3').replace('.webm', '.ogg');

        try {
            console.log("0. Normalizing stream payload...");
            execSync(`ffmpeg -y -i "${audioFile.tempFilePath}" -ar 16000 -ac 1 "${normalizedWavPath}"`, { stdio: 'ignore' });
            activeProcessPath = normalizedWavPath;
            activeFilename = 'audio.wav';
            activeMimeType = 'audio/wav';
        } catch (normErr) {
            console.warn("FFmpeg normalization bypassed natively (using raw container limits).", normErr.message);
        }

        // 1. Diarize via HF
        console.log("1. Sending audio to Diarization API...");
        const diarizeForm = new FormData();
        diarizeForm.append('file', fs.createReadStream(activeProcessPath), {
            filename: activeFilename,
            contentType: activeMimeType
        });
        
        let mergedSegments = [];
        try {
            const diarizeRes = await axios.post('https://gdas123-secondbrain-diarization.hf.space/diarize', diarizeForm, {
                headers: diarizeForm.getHeaders(),
                maxBodyLength: Infinity
            });
            
            if (diarizeRes.data.success && diarizeRes.data.segments) {
                const rawSegments = diarizeRes.data.segments;
                let currentSeg = null;
                let segCounter = 1;

                for (const seg of rawSegments) {
                    if (!currentSeg) {
                        currentSeg = { ...seg, segmentNumber: segCounter };
                    } else if (currentSeg.SpeakerID === seg.SpeakerID) {
                        currentSeg.endTimestamp = seg.endTimestamp;
                        currentSeg.duration = currentSeg.endTimestamp - currentSeg.startTimestamp;
                    } else {
                        mergedSegments.push(currentSeg);
                        segCounter++;
                        currentSeg = { ...seg, segmentNumber: segCounter };
                    }
                }
                if (currentSeg) mergedSegments.push(currentSeg);
            }
        } catch (hfErr) {
            console.error("HF Diarization API failed (Likely due to silence or HF overload):", hfErr.message);
        }

        let transcript = "";
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        if (mergedSegments.length > 0) {
            // 2. Assemble Audio
            console.log("2. Sending to Audio Assembler...");
            const assemblerUrl = process.env.AUDIO_ASSEMBLER_URL || "http://127.0.0.1:6000";
            const assembleForm = new FormData();
            assembleForm.append('raw_audio', fs.createReadStream(activeProcessPath), {
                filename: activeFilename,
                contentType: activeMimeType
            });
            assembleForm.append('segments', JSON.stringify({ segments: mergedSegments }));
            
            const assembleRes = await axios.post(`${assemblerUrl}/assemble`, assembleForm, {
                headers: assembleForm.getHeaders(),
                responseType: 'arraybuffer',
                maxBodyLength: Infinity
            });
            
            const assembledPath = path.join(__dirname, `../temp_assembled_${Date.now()}.mp3`);
            fs.writeFileSync(assembledPath, assembleRes.data);
            
            // 3. Transcribe with Groq
            console.log("3. Transcribing with Groq (Assembled)...");
            try {
                const transcriptRes = await groq.audio.transcriptions.create({
                    file: fs.createReadStream(assembledPath),
                    model: "whisper-large-v3-turbo",
                    response_format: "json"
                });
                transcript = transcriptRes.text;
            } catch (tErr) {
                console.error("Groq Transcription Exception (Assembled - Likely Silent):", tErr.message);
                transcript = "";
            }
            
            try { fs.unlinkSync(assembledPath); } catch (e) { console.error("Could not delete temp assembled file", e); }
        } else {
            console.log("2/3. Fallback: Transcribing raw continuous block audio via Groq directly...");
            
            // Groq SDK strict inference fails natively on extension-less temp files
            // Dynamically clone temporary payload locally strictly bound to container suffix
            const fileExt = (activeFilename && activeFilename.match(/\.(webm|mp4|mp3|wav|ogg|m4a|flac)$/)) 
                ? activeFilename.substring(activeFilename.lastIndexOf('.')) 
                : '.webm';
            const fallbackPath = path.join(__dirname, `../temp_fallback_${Date.now()}${fileExt}`);
            fs.copyFileSync(activeProcessPath, fallbackPath);

            try {
                const transcriptRes = await groq.audio.transcriptions.create({
                    file: fs.createReadStream(fallbackPath),
                    model: "whisper-large-v3-turbo",
                    response_format: "json"
                });
                transcript = transcriptRes.text;
            } catch (tErr) {
                console.error("Groq Fallback Exception (Raw - Likely pure silence):", tErr.message);
                transcript = "";
            }
            try { fs.unlinkSync(fallbackPath); } catch(e) {}
        }

        try { fs.unlinkSync(audioFile.tempFilePath); } catch (e) { } // clear original temp upload
        if (activeProcessPath === normalizedWavPath) {
            try { fs.unlinkSync(normalizedWavPath); } catch (e) { } // clear FFmpeg layer
        }
        
        // 4. Extract Insights & Schedules
        console.log("4. Extracting insights and schedules...");
        const prompt = `
You are a highly capable AI assistant that analyzes transcribed conversations between multiple speakers.
The current reference date during this speech is: ${date}. Use this to resolve any relative dates (e.g., today, tomorrow, next week).

Transcription:
"${transcript}"

Output ONLY a raw JSON object containing the fields below. Do not wrap in markdown \`\`\`json.
{
  "insights": [
    { "no": 1, "title": "A short 4-word crisp subject summary", "text": "Detailed explanation of the key facts, insights, context, or decisions discussed." }
  ],
  "schedules": [
    {
      "topic": "Meeting about X",
      "date": "YYYY-MM-DD", 
      "time": "HH:MM" 
    }
  ]
}
If there are no insights or schedules, return empty arrays. If the time is not mentioned, use null.
`;
        
        const chatRes = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", 
            response_format: { type: "json_object" },
            temperature: 0.2
        });
        
        const parsedJson = JSON.parse(chatRes.choices[0].message.content);
        console.log("Extracted Data:", parsedJson);
        
        const createdInsights = [];
        if (parsedJson.insights && parsedJson.insights.length > 0) {
            for (const ins of parsedJson.insights) {
                const doc = await Insight.create({
                    userId,
                    date,
                    title: ins.title || 'Captured Context',
                    text: ins.text,
                    number: ins.no || 1
                });
                createdInsights.push(doc._id);
            }
        }
        
        const createdSchedules = [];
        if (parsedJson.schedules && parsedJson.schedules.length > 0) {
            for (const sch of parsedJson.schedules) {
                const doc = await Schedule.create({
                    userId,
                    date: sch.date || date,
                    time: sch.time || null,
                    topic: sch.topic || "Event"
                });
                createdSchedules.push(doc._id);
            }
        }
        
        // 5. Link in Analytics 
        console.log("5. Updating Analytics records for date:", date);
        let analyticsDoc = await Analytics.findOne({ userId, date });
        
        if (!analyticsDoc) {
            console.log("— Creating new Analytics record...");
            analyticsDoc = await Analytics.create({
                userId,
                date,
                insights: createdInsights,
                schedules: createdSchedules,
                transcriptions: transcript ? [transcript] : []
            });
            console.log("— Analytics created successfully.");
        } else {
            console.log("— Updating existing Analytics record...");
            analyticsDoc.insights.push(...createdInsights);
            analyticsDoc.schedules.push(...createdSchedules);
            if (transcript) {
                if (!analyticsDoc.transcriptions) analyticsDoc.transcriptions = [];
                analyticsDoc.transcriptions.push(transcript);
            }
            await analyticsDoc.save();
            console.log("— Analytics updated successfully.");
        }
        
        return res.status(200).json({
            success: true,
            message: "Audio processed successfully.",
            transcript: transcript,
            data: parsedJson
        });
        
    } catch (error) {
        console.error("Audio Processing Error:", error);
        
        // Attempt cleanup memory
        if (req.files && (req.files.audio || req.files.voice)) {
            try { fs.unlinkSync((req.files.audio || req.files.voice).tempFilePath); } catch (e) { }
        }
        
        return res.status(500).json({
            success: false,
            message: "Audio processing failed",
            error: error.message
        });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = req.query.date;
        let query = { userId };
        if (date) query.date = date;
        
        const analyticsList = await Analytics.find(query)
            .populate('insights')
            .populate('schedules')
            .sort({ date: -1 });
            
        return res.status(200).json({
            success: true,
            analytics: analyticsList
        });
    } catch (error) {
        console.error("Get Analytics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load analytics",
            error: error.message
        });
    }
};

const getSchedules = async (req, res) => {
    try {
        const userId = req.user._id;
        const schedules = await Schedule.find({ userId }).sort({ date: 1 });
            
        return res.status(200).json({
            success: true,
            schedules
        });
    } catch (error) {
        console.error("Get Schedules Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load schedules",
            error: error.message
        });
    }
};

module.exports = { processAudio, getAnalytics, getSchedules };
