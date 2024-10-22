import { mailtrapClient, sender } from "../lib/mailtrap.js";
import {
    createCommentNotificationEmailTemplate,
    createConnectionAcceptedEmailTemplate,
    createWelcomeEmailTemplate,
    createOtpEmailTemplate, // Import the OTP email template
    createShortlistedEmailTemplate, // Import the shortlisted email template
    createNotShortlistedEmailTemplate // Import the not shortlisted email template
} from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to UnLinked",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "welcome",
        });

        console.log("Welcome Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending Welcome Email:", error);
        throw new Error("Could not send welcome email. Please try again later.");
    }
};

export const sendCommentNotificationEmail = async (
    recipientEmail,
    recipientName,
    commenterName,
    postUrl,
    commentContent
) => {
    const recipient = [{ email: recipientEmail }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "New Comment on Your Post",
            html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
            category: "comment_notification",
        });

        console.log("Comment Notification Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending Comment Notification Email:", error);
        throw new Error("Could not send comment notification email. Please try again later.");
    }
};

export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName, profileUrl) => {
    const recipient = [{ email: senderEmail }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: `${recipientName} accepted your connection request`,
            html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
            category: "connection_accepted",
        });

        console.log("Connection Accepted Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending Connection Accepted Email:", error);
        throw new Error("Could not send connection accepted email. Please try again later.");
    }
};

const otpStore = {}; // In-memory store for OTPs

// New function to send OTP email
export const sendOtpEmail = async (recipientEmail, otp) => {
    const recipient = [{ email: recipientEmail }];
    const expirationTime = Date.now() + 10 * 60 * 1000; // Set expiration time to 10 minutes from now

    // Save OTP and expiration in the otpStore
    otpStore[recipientEmail] = {
        otp,
        expirationTime,
    };

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Your OTP for Login",
            html: createOtpEmailTemplate(otp), // You need to create this template
            category: "otp",
        });

        console.log("OTP Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending OTP Email:", error);
        throw new Error("Could not send OTP email. Please try again later.");
    }
};

// Function to verify OTP
export const verifyOtp = (email, otp) => {
    if (!otpStore[email]) {
        return { success: false, message: 'OTP not found. Please request a new OTP.' };
    }

    const { otp: storedOtp, expirationTime } = otpStore[email];

    // Check if the OTP is expired
    if (Date.now() > expirationTime) {
        delete otpStore[email]; // Remove expired OTP
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Verify the OTP
    if (storedOtp === otp) {
        delete otpStore[email]; // Clear the OTP after verification
        return { success: true, message: 'OTP verified successfully!' };
    } else {
        return { success: false, message: 'Invalid OTP. Please try again.' };
    }
};
// Function to send email when an applicant is shortlisted
export const sendShortlistedEmail = async (applicantEmail, applicantName, jobTitle) => {
    const recipient = [{ email: applicantEmail }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Congratulations! You Are Shortlisted",
            html: createShortlistedEmailTemplate(applicantName, jobTitle), // Create this template
            category: "shortlisted",
        });

        console.log("Shortlisted Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending Shortlisted Email:", error);
        throw new Error("Could not send shortlisted email. Please try again later.");
    }
};

// Function to send email when an applicant is not shortlisted
export const sendNotShortlistedEmail = async (applicantEmail, applicantName, jobTitle) => {
    const recipient = [{ email: applicantEmail }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Update on Your Job Application",
            html: createNotShortlistedEmailTemplate(applicantName, jobTitle), // Create this template
            category: "not_shortlisted",
        });

        console.log("Not Shortlisted Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending Not Shortlisted Email:", error);
        throw new Error("Could not send not shortlisted email. Please try again later.");
    }
};