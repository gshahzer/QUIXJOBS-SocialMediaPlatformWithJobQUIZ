import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String }, // Store OTP
    otpExpires: { type: Date }, // Store OTP expiration time
    profilePicture: {
        type: String,
        default: "",
    },
    bannerImg: {
        type: String,
        default: "",
    },
    headline: {
        type: String,
        default: "QuixJob",
    },
    location: {
        type: String,
        default: "Earth",
    },
    about: {
        type: String,
        default: "",
    },
    skills: [String],
    experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
    },
],
    education: [{
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
    },
],
    connections: [{
        type: mongoose.Schema.Types.ObjectId, ref:"user"
}, 
    ],
},
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
export default User;