import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    company: { type: String, required: true },
    salary: { type: Number, required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Assuming employer is a User reference
    quizQuestions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
    }],
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
