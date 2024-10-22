import Application from '../models/Application.js'; // Import your Application model
import Job from '../models/JobsModel.js';
import JobStatus from '../models/Jobstatus.js'; // Import your JobStatus model

// Create a job
export const createJob = async (req, res) => {
    const { title, description, location, company, salary, quizQuestions, employer } = req.body;

    try {
        const newJob = new Job({
            title,
            description,
            location,
            company,
            salary,
            employer, // Include employer data
            quizQuestions, // Include quiz questions
        });

        await newJob.save();
        return res.status(201).json({ message: 'Job created successfully!', job: newJob });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        return res.status(200).json({ message: 'Jobs fetched successfully!', jobs });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

// Get jobs by employer
export const getMyJobs = async (req, res) => {
    const employerId = req.params.employerId; 

    try {
        const jobs = await Job.find({ employer: employerId });

        if (jobs.length === 0) {
            return res.status(200).json({ message: 'No jobs found for this employer' });
        }

        return res.status(200).json({ message: 'Your jobs fetched successfully!', jobs });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching your jobs', error: error.message });
    }
};

// Update a job
export const updateJob = async (req, res) => {
    const { id } = req.params; 
    const updates = req.body; 

    try {
        const updatedJob = await Job.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        return res.status(200).json({ message: 'Job updated successfully!', job: updatedJob });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating job', error: error.message });
    }
};

// Delete a job

export const deleteJob = async (req, res) => {
    const { id } = req.params; 

    try {
        // Find and delete the job
        const deletedJob = await Job.findByIdAndDelete(id);

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Delete related applications
        await Application.deleteMany({ jobId: id }); // Assuming 'jobId' is the reference field in the Application model

        // Delete related job statuses
        await JobStatus.deleteMany({ jobId: id }); // Assuming 'jobId' is the reference field in the JobStatus model

        // Optionally delete related applicants if you have an Applicant model
        // await Applicant.deleteMany({ jobId: id }); // Uncomment if you have an Applicant model

        return res.status(200).json({ message: 'Job and all related entities deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};