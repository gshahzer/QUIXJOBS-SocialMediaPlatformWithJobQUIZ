import express from 'express'
import JobStatus from '../models/Jobstatus.js'  // Adjust the path to your model
const router = express.Router();

// Save job status
router.post('/job-status', async (req, res) => {
    const { userId, jobId, status } = req.body;
  
    try {
      console.log(`Received request to save job status: ${JSON.stringify(req.body)}`);
      const existingStatus = await JobStatus.findOne({ userId, jobId });
  
      if (existingStatus) {
        existingStatus.status = status;
        await existingStatus.save();
        return res.status(200).json(existingStatus);
      }
  
      const newStatus = new JobStatus({ userId, jobId, status });
      await newStatus.save();
      return res.status(201).json(newStatus);
    } catch (error) {
      console.error('Error occurred while saving job status:', error);
      return res.status(500).json({ message: error.message });
    }
  });

// Get job statuses for a user
router.get('/job-status/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const statuses = await JobStatus.find({ userId }).populate('jobId');
    return res.status(200).json(statuses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
