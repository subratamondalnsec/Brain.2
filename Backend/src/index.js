require("dotenv").config();

const express = require("express");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const chatRoutes = require("./routes/chat.routes");
const queryRoutes = require("./routes/query.routes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/query", queryRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Second Brain API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
