const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signup = async (req, res) => {
	try {
		const { fullName, email, password } = req.body;

		if (!fullName || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide fullName, email and password",
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: "Email is already registered",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({
			fullName,
			email,
			password: hashedPassword,
		});

		const userObject = user.toObject();
		delete userObject.password;

		const token = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);

		return res.status(201).json({
			success: true,
			message: "Account created successfully",
			token,
			user: userObject,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide email and password",
			});
		}

		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const token = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);

		const userObject = user.toObject();
		delete userObject.password;

		return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			token,
			user: userObject,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

const getMe = async (req, res) => {
	return res.status(200).json({
		success: true,
		user: req.user,
	});
};

module.exports = { signup, login, getMe };
