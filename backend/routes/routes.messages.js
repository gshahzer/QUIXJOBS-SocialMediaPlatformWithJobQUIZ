// routes/messages.js
import express from "express";
import Message from '../models/Message.js'
const router = express.Router();

// Endpoint to save a message
router.post('/save-message', async (req, res) => {
    try {
        const { sender, recipient, message } = req.body;

        // Create a new message
        const newMessage = new Message({ sender, recipient, message });
        await newMessage.save();

        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving message', error });
    }
});

// routes/messages.js
// Fetch chat history between two users
router.get('/chat-history/:userId/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;

        // Find messages between the two users
        const chatHistory = await Message.find({
            $or: [
                { sender: userId, recipient: friendId },
                { sender: friendId, recipient: userId }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp

        res.status(200).json(chatHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history', error });
    }
});


export default router;
