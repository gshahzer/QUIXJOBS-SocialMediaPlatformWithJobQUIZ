// routes/ratingRoutes.js
import express from 'express'
import Rating from '../models/ratingModel.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // Ensure only authenticated users can rate
const router = express.Router();

// Fetch ratings for a user
router.get('/:userId', protectRoute, async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.params.userId }).populate('ratedBy', 'name profilePicture'); // Populate ratedBy with additional fields
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / (ratings.length || 1); // Prevent division by zero
    
    res.status(200).json({ ratings, averageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a rating
router.post('/', protectRoute, async (req, res) => {
  const { userId, rating } = req.body;
  const ratedBy = req.user.id; // Get the ID of the user who is rating from the token

  try {
    const existingRating = await Rating.findOne({ userId, ratedBy });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user.' });
    }

    const newRating = new Rating({ userId, ratedBy, rating });
    await newRating.save();
    
    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
