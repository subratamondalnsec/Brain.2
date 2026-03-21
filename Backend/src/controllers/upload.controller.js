const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const imageFile = req.files.image;

    if (!imageFile.mimetype || !imageFile.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload an image.",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: "second-brain-ai",
      resource_type: "image",
    });

    // Auto-delete temp file after upload — no need to store on server
    try { fs.unlinkSync(imageFile.tempFilePath); } catch (_) {}

    return res.status(200).json({
      success: true,
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cloudinary upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadImage };
