require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Pinecone } = require('@pinecone-database/pinecone');
const Groq = require('groq-sdk');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(express.json());

// Initialize multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Environment Variables
const {
  PORT,
  PINECONE_API_KEY,
  PINECONE_TEXT_INDEX,
  PINECONE_VOICE_INDEX,
  HF_EMBEDDING_URL,
  GROQ_API_KEY,
  TEXT_NAMESPACE,
  VOICE_NAMESPACE,
  VOICE_MATCH_THRESHOLD,
  QUERY_SEARCH_LIMIT
} = process.env;

// Initialize Pinecone
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const textIndex = pc.index(PINECONE_TEXT_INDEX);
const voiceIndex = pc.index(PINECONE_VOICE_INDEX);

// Initialize Groq
const groq = new Groq({ apiKey: GROQ_API_KEY });

// --- Helper Functions ---

// Helper to get text embedding from HF Space
async function getTextEmbedding(text) {
    try {
        const response = await axios.post(`${HF_EMBEDDING_URL}/embed`, { text }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data; // adjust based on actual return schema
    } catch (error) {
        console.error("Error getting text embedding:", error.response?.data || error.message);
        throw new Error("Failed to get text embedding from Hugging Face Space.");
    }
}

// Helper to get voice embedding from HF Space
async function getVoiceEmbedding(filePath) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        const response = await axios.post(`${HF_EMBEDDING_URL}/voice-embed`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data; // adjust based on actual return schema
    } catch (error) {
        console.error("Error getting voice embedding:", error.response?.data || error.message);
        throw new Error("Failed to get voice embedding from Hugging Face Space.");
    }
}

// --- Endpoints ---

/**
 * 1. Upload Text
 * Body: { user_id, content, date (optional) }
 */
app.post('/upload-text', async (req, res) => {
    try {
        const { user_id, content, date } = req.body;
        
        if (!user_id || !content) {
            return res.status(400).json({ error: "user_id and content are required." });
        }

        const embedding = await getTextEmbedding(content);
        
        // Ensure values is an array of 768 floats based on your embeddings size
        const values = Array.isArray(embedding) ? embedding : (embedding.embedding || embedding.data);
        
        if (!values || !Array.isArray(values)) {
             throw new Error("Invalid embedding format returned from HF Space.");
        }

        const recordId = uuidv4();
        const metadata = { user_id, content };
        if (date) metadata.date = date; 

        await textIndex.namespace(TEXT_NAMESPACE || 'text_embeddings').upsert([{
            id: recordId,
            values: values,
            metadata: metadata
        }]);

        res.json({ success: true, message: "Text uploaded and embedded successfully.", recordId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 2. Voice Match
 * Form-data: user_id (optional), voice (file), date (optional)
 */
app.post('/voice-match', upload.single('voice'), async (req, res) => {
    let filePath = req.file?.path;
    try {
        const { user_id, date } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: "voice file is required in form-data key 'voice'." });
        }

        // Get Voice embedding (512 dimensions)
        const embeddingData = await getVoiceEmbedding(filePath);
        const values = Array.isArray(embeddingData) ? embeddingData : (embeddingData.embedding || embeddingData.data);
        
        if (!values || !Array.isArray(values)) {
             throw new Error("Invalid embedding format returned from HF Space.");
        }

        let matchResult = { match: false, user_id: null };
        let finalUserId = user_id;

        // If user_id is NOT given, we search for finding the user
        if (!user_id) {
            const queryResponse = await voiceIndex.namespace(VOICE_NAMESPACE || 'voice_embeddings').query({
                vector: values,
                topK: 1,
                includeMetadata: true
            });

            if (queryResponse.matches && queryResponse.matches.length > 0) {
                const bestMatch = queryResponse.matches[0];
                const threshold = parseFloat(VOICE_MATCH_THRESHOLD || "0.88");
                
                if (bestMatch.score >= threshold) {
                    matchResult.match = true;
                    // found the user id mapped to the similar voice
                    matchResult.user_id = bestMatch.metadata.user_id;
                    finalUserId = bestMatch.metadata.user_id;
                    matchResult.score = bestMatch.score;
                }
            }
        } else {
            // user_id provided.
            matchResult.user_id = user_id;
            matchResult.match = true; // explicitly provided
        }

        // Store the voice embedding if we have a valid finalUserId (found or given)
        if (finalUserId) {
            const recordId = uuidv4();
            const metadata = { user_id: finalUserId };
            if (date) metadata.date = date;

            await voiceIndex.namespace(VOICE_NAMESPACE || 'voice_embeddings').upsert([{
                id: recordId,
                values: values,
                metadata: metadata
            }]);
            
            matchResult.stored = true;
            matchResult.message = "Voice matched and stored successfully.";
        } else {
            matchResult.stored = false;
            matchResult.message = "Voice not matched; could not find user_id and none was provided. Not stored.";
        }

        // Clean up uploaded file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json(matchResult);
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * 3. Query
 * Body: { user_id, query, date (optional) }
 */
app.post('/query', async (req, res) => {
    try {
        const { user_id, query, date } = req.body;

        if (!user_id || !query) {
            return res.status(400).json({ error: "user_id and query are required." });
        }

        const embeddingData = await getTextEmbedding(query);
        const values = Array.isArray(embeddingData) ? embeddingData : (embeddingData.embedding || embeddingData.data);

        // Vector Search Filter
        let filter = { user_id: { "$eq": user_id } };
        // Vector search only from bindings of that date of that user, IF date is given
        if (date) {
            filter.date = { "$eq": date };
        }

        const limit = parseInt(QUERY_SEARCH_LIMIT || "5");

        const queryResponse = await textIndex.namespace(TEXT_NAMESPACE || 'text_embeddings').query({
            vector: values,
            topK: limit,
            filter: filter,
            includeMetadata: true
        });

        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            return res.json({ answer: "No relevant data found for this query.", contextsUsed: 0 });
        }

        // Extract text contexts
        const contexts = queryResponse.matches.map((match, i) => `[context ${i+1}]: ${match.metadata.content}`).join("\n\n");

        // Format Answer Using Groq API
        const prompt = `You are a helpful AI assistant in a RAG system.\nUse the following extracted context to answer the user's query clearly and concisely.\n\nContext:\n${contexts}\n\nQuery:\n${query}\n\nAnswer:`;

        const groqResponse = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-safeguard-20b", // Using Llama3 8B model available on Groq
            temperature: 0.3,
            max_tokens: 1024
        });

        const answer = groqResponse.choices[0].message.content;

        res.json({ 
            answer, 
            matchedDocumentsCount: queryResponse.matches.length 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
