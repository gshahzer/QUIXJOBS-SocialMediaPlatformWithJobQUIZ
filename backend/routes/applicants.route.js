import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";
import {
    addApplicant,
    updateApplicantStatus,
    getApplicationsByUserId,
    getApplicationsForUserCreatedJobs
} from "../controllers/applicant.controller.js";
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Save file with a unique name
    }
});

const upload = multer({ storage: storage });

// Middleware to validate request body for adding applicants
const validateApplicant = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('jobTitle').notEmpty().withMessage('Job title is required.'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Route to add a new applicant with file upload
router.post("/add", upload.single('resume'), validateApplicant, handleValidationErrors, addApplicant);

// Route to update applicant status and send notification emails
router.put("/update-status", updateApplicantStatus);

// Route to get applications submitted by the authenticated user
router.get("/user/applications",protectRoute, getApplicationsByUserId);

// Route to get applications for jobs created by the authenticated user
router.get("/user/jobs/applications",protectRoute, getApplicationsForUserCreatedJobs);

export default router;
