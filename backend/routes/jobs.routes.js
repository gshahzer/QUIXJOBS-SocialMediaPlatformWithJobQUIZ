import express from 'express'
import { getAllJobs, getMyJobs, updateJob, deleteJob, createJob } from '../controllers/jobs.controller.js'
const router = express.Router()

router.post('/create', createJob)
// Route for fetching all jobs
router.get('/jobs', getAllJobs);
router.get('/my-jobs/:employerId', getMyJobs);

// Route for updating a job by ID
router.put('/jobs/:id', updateJob);

// Route for deleting a job by ID
router.delete('/jobs/:id', deleteJob);


export default router;