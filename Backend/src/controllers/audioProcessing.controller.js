const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
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
        
        // 1. Diarize via HF
        console.log("1. Sending audio to Diarization API...");
        const diarizeForm = new FormData();
        diarizeForm.append('file', fs.createReadStream(audioFile.tempFilePath), {
            filename: audioFile.name || 'audio.mp3',
            contentType: audioFile.mimetype || 'audio/mpeg'
        });
        
        const diarizeRes = await axios.post('https://gdas123-secondbrain-diarization.hf.space/diarize', diarizeForm, {
            headers: diarizeForm.getHeaders(),
            maxBodyLength: Infinity
        });
        
        if (!diarizeRes.data.success || !diarizeRes.data.segments) {
            throw new Error("Diarization failed to return valid segments");
        }
        const segments = diarizeRes.data.segments;
        
        // 2. Assemble Audio
        console.log("2. Sending to Audio Assembler...");
        const assemblerUrl = process.env.AUDIO_ASSEMBLER_URL || "http://127.0.0.1:6000";
        const assembleForm = new FormData();
        assembleForm.append('raw_audio', fs.createReadStream(audioFile.tempFilePath), {
            filename: audioFile.name || 'audio.mp3',
            contentType: audioFile.mimetype || 'audio/mpeg'
        });
        assembleForm.append('segments', JSON.stringify({ segments }));
        
        const assembleRes = await axios.post(`${assemblerUrl}/assemble`, assembleForm, {
            headers: assembleForm.getHeaders(),
            responseType: 'arraybuffer',
            maxBodyLength: Infinity
        });
        
        const assembledPath = path.join(__dirname, `../temp_assembled_${Date.now()}.mp3`);
        fs.writeFileSync(assembledPath, assembleRes.data);
        
        // 3. Transcribe with Groq
        console.log("3. Transcribing with Groq...");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const transcriptRes = await groq.audio.transcriptions.create({
            file: fs.createReadStream(assembledPath),
            model: "whisper-large-v3-turbo",
            response_format: "json"
        });
        
        const transcript = transcriptRes.text;
        
        // Cleanup assembled file
        try { fs.unlinkSync(assembledPath); } catch (e) { console.error("Could not delete temp assembled file", e); }
        try { fs.unlinkSync(audioFile.tempFilePath); } catch (e) { } // clear original temp upload
        
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
    { "no": 1, "text": "Extracted key insight or summary point here." }
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
        console.log("5. Updating Analytics records...");
        let analyticsDoc = await Analytics.findOne({ userId, date });
        if (!analyticsDoc) {
            analyticsDoc = await Analytics.create({
                userId,
                date,
                insights: createdInsights,
                schedules: createdSchedules
            });
        } else {
            analyticsDoc.insights.push(...createdInsights);
            analyticsDoc.schedules.push(...createdSchedules);
            await analyticsDoc.save();
        }
        
        return res.status(200).json({
            success: true,
            message: "Audio processed successfully.",
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
