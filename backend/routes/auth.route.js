import express from "express";
import { login, logout, signup, verifySignupOtp  } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getCurrentUser } from '../controllers/auth.controller.js';

const router = express.Router();

// User signup route
router.post("/signup", signup);

// User login route
router.post("/login", login);

// User logout route
router.post("/logout", logout);

// Verify OTP route
router.post("/verify-otp", verifySignupOtp ); // New route for OTP verification

// Get current user's details route
router.get("/me", protectRoute, getCurrentUser);

export default router;
