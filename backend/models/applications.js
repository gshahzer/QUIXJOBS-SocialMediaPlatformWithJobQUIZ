// models/applications.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    location: { type: String, required: true }, // New field for applicant's location
    resume: { type: String, required: true }, // New field for resume (e.g., URL or path to the file)
    status: { type: String, default: "applied" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Default status
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
    // Add other fields as necessary
});

// Export the model
const Applicant = mongoose.model('Applicant', applicationSchema);
export default Applicant;
