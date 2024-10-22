import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies["jwt-linkedin"];

		if (!token) {
			return res.status(401).json({ message: "Unauthorized - No Token Provided" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			if (err.name === 'JsonWebTokenError') {
				return res.status(401).json({ message: "Unauthorized - Invalid Token" });
			} else if (err.name === 'TokenExpiredError') {
				return res.status(401).json({ message: "Unauthorized - Token Expired" });
			}
			return res.status(500).json({ message: "Internal server error" });
		}

		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		req.user = user; // Attach the user to the request object

		next(); // Call the next middleware or route handler
	} catch (error) {
		console.log("Error in protectRoute middleware:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
