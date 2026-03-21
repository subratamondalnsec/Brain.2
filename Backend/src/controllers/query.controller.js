// QUERY MODE — No DB storage. Logs query to console. RAG system coming soon.

const sendQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Query text is required" });
    }

    // Intentional console log — RAG integration placeholder
    console.log("─────────────────────────────────");
    console.log("🔍 QUERY RECEIVED");
    console.log(`👤 User     : ${req.user.email}`);
    console.log(`📅 Time     : ${new Date().toISOString()}`);
    console.log(`💬 Query    : ${query.trim()}`);
    console.log("─────────────────────────────────");

    return res.status(200).json({
      success: true,
      message: "Query received. RAG system coming soon.",
      query: query.trim(),
      response:
        "This feature is under construction. Your query has been logged.",
      timestamp: new Date().toISOString(),
    });
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
