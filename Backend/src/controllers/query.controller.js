const axios = require("axios");

// QUERY MODE — No DB storage. Forward query to RAG system.

const sendQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Query text is required" });
    }
    try {
      const ragUrl = process.env.RAG_URL;
      
      const response = await axios.post(`${ragUrl}/query`, {
        user_id: req.user._id,
        query: query.trim()
      });

      return res.status(200).json({
        success: true,
        message: "Query processed successfully",
        query: query.trim(),
        response: response.data.answer,
        matchedDocumentsCount: response.data.matchedDocumentsCount,
        timestamp: new Date().toISOString()
      });
    } catch (ragError) {
      console.error("Error connecting to RAG server:", ragError.message);
      return res.status(502).json({
        success: false,
        message: "Failed to connect to RAG server to process query",
        error: ragError.response?.data?.error || ragError.message
      });
    }
  } catch (error) {
    console.error("sendQuery error:", error);
    return res.status(500).json({
      success: false,
      message: "Query processing failed",
      error: error.message,
    });
  }
};

module.exports = { sendQuery };
