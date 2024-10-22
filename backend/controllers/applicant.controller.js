import mongoose from "mongoose";
import { sendShortlistedEmail, sendNotShortlistedEmail } from "../emails/emailHandlers.js";
import Applicant from "../models/applications.js";
import Job from "../models/JobsModel.js";

// Add a new applicant
export const addApplicant = async (req, res) => {
    const { name, email, location, jobTitle, jobId, userId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Resume file is required." });
    }

    const resume = req.file.path;

    try {
        const newApplicant = new Applicant({
            name,
            email,
            location,
            resume,
            jobTitle,
            job: jobId,
            user: userId,
            status: "applied",
        });

        await newApplicant.save();
        return res.status(201).json({ message: "Applicant added successfully.", applicant: newApplicant });
    } catch (error) {
        console.error("Error adding applicant:", error);
        return res.status(500).json({ message: "An error occurred while adding the applicant." });
    }
};

// Update applicant status and send email notifications
export const updateApplicantStatus = async (req, res) => {
    const { applicantId, status } = req.body;

    try {
        const applicant = await Applicant.findById(applicantId).populate('job');

        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found." });
        }

        applicant.status = status;
        await applicant.save();

        // Log and send emails
        if (status === "Shortlisted") {
            await sendShortlistedEmail(applicant.email, applicant.name, applicant.jobTitle);
        } else if (status === "Rejected") {
            await sendNotShortlistedEmail(applicant.email, applicant.name, applicant.jobTitle);
            await deleteApplicant(applicantId); // Call delete after sending email
        }

        return res.status(200).json({ message: "Applicant status updated successfully." });
    } catch (error) {
        console.error("Error updating applicant status:", error);
        return res.status(500).json({ message: "An error occurred while updating the applicant status." });
    }
};

// Delete an applicant
export const deleteApplicant = async (applicantId) => {
    try {
        const result = await Applicant.findByIdAndDelete(applicantId);
        if (result) {
            console.log(`Applicant with ID ${applicantId} deleted successfully.`);
        } else {
            console.error(`Applicant with ID ${applicantId} not found.`);
        }
    } catch (error) {
        console.error("Error deleting applicant:", error);
    }
};

// Fetch applications submitted by the authenticated user
export const getApplicationsByUserId = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const userId = req.user._id;
        const applications = await Applicant.find({ user: userId });

        if (!applications || applications.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(applications);
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ message: 'Error fetching applications', error: err.message });
    }
};

// Fetch applications submitted to the jobs created by the authenticated user
export const getApplicationsForUserCreatedJobs = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobs = await Job.find({ employer: userId }).select('_id');
        const jobIds = jobs.map(job => job._id);

        const applications = await Applicant.find({ job: { $in: jobIds } }).populate('user', 'name');

        if (!applications || applications.length === 0) {
            return res.status(200).json([]);
        }

        const applicationsWithJobDetails = await Promise.all(applications.map(async (application) => {
            const job = await Job.findById(application.job).select('title');
            return {
                ...application.toObject(),
                jobTitle: job ? job.title : 'Unknown Job',
                applicantName: application.user ? application.user.name : 'Unknown Applicant'
            };
        }));

        res.status(200).json(applicationsWithJobDetails);
    } catch (err) {
        console.error("Error fetching applications for user-created jobs:", err);
        res.status(500).json({ message: 'Error fetching applications for user-created jobs', error: err.message });
    }
};
