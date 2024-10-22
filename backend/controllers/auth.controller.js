// backend/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendOtpEmail, verifyOtp } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
        const otpExpires = Date.now() + 10 * 60 * 1000; // Set expiration to 10 minutes

        const user = new User({
            name,
            email,
            password: hashedPassword,
            username,
            otp, // Save OTP in the user model
            otpExpires, // Save OTP expiration time
        });

        await user.save();

        // Send OTP for email verification
        try {
            await sendOtpEmail(user.email, otp); // Pass the generated OTP
            return res.status(201).json({ message: "User registered successfully. Check your email for the OTP." });
        } catch (emailError) {
            console.error("Error sending OTP Email", emailError);
            return res.status(500).json({ message: "Error sending OTP. Please try again." });
        }

    } catch (error) {
        console.log("Error in signup: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// New OTP verification endpoint
// OTP verification endpoint
export const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body; // Destructure both email and otp

        // Validate inputs
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Check if OTP is correct and not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        // Check if the OTP has expired
        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Proceed with login after OTP verification
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        res.cookie("jwt-linkedin", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", // Secure only in production
        });

        return res.status(200).json({ message: "OTP verified successfully! Logged in." });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};



export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create and send token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        await res.cookie("jwt-linkedin", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.json({ message: "Logged in successfully" });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("jwt-linkedin");
    res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error("Error in getCurrentUser controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};
