const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
			select: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		chatRecord: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ChatRecord",
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

module.exports = User;
