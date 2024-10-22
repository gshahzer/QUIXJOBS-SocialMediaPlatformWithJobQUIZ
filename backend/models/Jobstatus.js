import mongoose from 'mongoose';

const JobStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',  // Adjust this reference if necessary
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job',  // Adjust this reference if necessary
  },
  status: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('JobStatus', JobStatusSchema);
