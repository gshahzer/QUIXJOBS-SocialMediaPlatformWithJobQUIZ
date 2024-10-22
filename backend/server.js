import express from "express";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";  // Import http module
import { Server } from "socket.io"; // Import socket.io server

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import jobsRoutes from "./routes/jobs.routes.js";
import applicantRoutes from './routes/applicants.route.js';
import messageRoute from './routes/routes.messages.js'
import jobstatus from './routes/jobstatus.route.js';
import ratingRoutes from './routes/ratingRoutes.js';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';  // Importing fileURLToPath
import { dirname } from 'path';        // Importing dirname
import path from 'path';               // Importing path

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Create __dirname variable
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to the database
connectDB();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Updated with __dirname
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/applicants", applicantRoutes);
app.use("/api/v1/jobstatus", jobstatus);
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/ratings", ratingRoutes);

// Create HTTP server and Socket.IO instance
const serverInstance = http.createServer(app);
const io = new Server(serverInstance, {
    cors: {
        origin: "http://localhost:5173", // Ensure this matches your client URL
        credentials: true,
    },
});

// Maintain a mapping of user IDs to socket IDs
const userSocketMap = new Map();

// Function to get the socket ID by user ID
const getSocketIdByUserId = (userId) => {
    return userSocketMap.get(userId);
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Register user and map user ID to socket ID
    socket.on('register_user', (userId) => {
        userSocketMap.set(userId, socket.id); // Store the user's socket ID
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    // Handle incoming messages
    socket.on('send_message', (data) => {
        console.log('Data received from client:', data);
    
        // Check if the message is valid
        if (typeof data.message !== 'string' || !data.message.trim()) {
            console.error('Invalid message received:', data.message);
            return; // Exit early for invalid messages
        }
    
        // Emit to the intended recipient if they are connected
        const recipientSocketId = getSocketIdByUserId(data.recipient);
        
        if (recipientSocketId) {
            // Use 'to' method for sending to the specific socket ID
            socket.to(recipientSocketId).emit('receive_message', {
                message: data.message,
                sender: data.sender,
                recipient: data.recipient,
            });
            console.log(`Message from ${data.sender} to ${data.recipient}: ${data.message}`);
        } else {
            console.log(`User ${data.recipient} is not connected.`);
        }
    });
    

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove the user from the map on disconnect
        for (let [userId, id] of userSocketMap) {
            if (id === socket.id) {
                userSocketMap.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Start the server
serverInstance.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
