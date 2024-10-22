import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState(""); // State for OTP
	const [isOtpSent, setIsOtpSent] = useState(false); // Flag to check if OTP has been sent
	const [resendOtpCooldown, setResendOtpCooldown] = useState(false); // Resend OTP cooldown
	const queryClient = useQueryClient();

	const { mutate: signUpMutation, isLoading: isSigningUp } = useMutation({
		mutationFn: async (data) => {
			const res = await axiosInstance.post("/auth/signup", data);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Account created successfully. An OTP has been sent to your email.");
			setIsOtpSent(true); // Set flag to true when OTP is sent
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Something went wrong");
		},
	});

	const { mutate: verifyOtpMutation, isLoading: isVerifyingOtp } = useMutation({
		mutationFn: async (data) => {
			const res = await axiosInstance.post("/auth/verify-otp", data);
			return res.data;
		},
		onSuccess: () => {
			toast.success("OTP verified successfully. You can now log in.");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Invalid OTP or OTP expired");
		},
	});

	const { mutate: resendOtpMutation, isLoading: isResendingOtp } = useMutation({
		mutationFn: async () => {
			const res = await axiosInstance.post("/auth/resend-otp", { email });
			return res.data;
		},
		onSuccess: () => {
			toast.success("OTP resent successfully");
			setResendOtpCooldown(true); // Disable the button for 60 seconds
			setTimeout(() => setResendOtpCooldown(false), 60000); // 1-minute cooldown
		},
		onError: (err) => {
			toast.error("Error resending OTP. Please try again.");
		},
	});

	const handleSignUp = (e) => {
		e.preventDefault();
		// Basic form validation
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long.");
			return;
		}
		if (!email.includes("@")) {
			toast.error("Invalid email format.");
			return;
		}
		signUpMutation({ name, username, email, password });
	};

	const handleVerifyOtp = (e) => {
		e.preventDefault();
		verifyOtpMutation({ email, otp });
	};

	return (
		<>
			{!isOtpSent ? (
				<form onSubmit={handleSignUp} className='flex flex-col gap-4'>
					<input
						type='text'
						placeholder='Full name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						className='input input-bordered w-full'
						required
					/>
					<input
						type='text'
						placeholder='Username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className='input input-bordered w-full'
						required
					/>
					<input
						type='email'
						placeholder='Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='input input-bordered w-full'
						required
					/>
					<input
						type='password'
						placeholder='Password (6+ characters)'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='input input-bordered w-full'
						required
					/>

					<button type='submit' disabled={isSigningUp} className='btn btn-primary w-full text-white'>
						{isSigningUp ? <Loader className='size-5 animate-spin' /> : "Agree & Join"}
					</button>
				</form>
			) : (
				<form onSubmit={handleVerifyOtp} className='flex flex-col gap-4'>
					<input
						type='text'
						placeholder='Enter OTP'
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						className='input input-bordered w-full'
						required
					/>

					<button type='submit' disabled={isVerifyingOtp} className='btn btn-primary w-full text-white'>
						{isVerifyingOtp ? <Loader className='size-5 animate-spin' /> : "Verify OTP"}
					</button>

					{/* Resend OTP button */}
					{isOtpSent && !isVerifyingOtp && (
						<button
							onClick={() => resendOtpMutation()}
							disabled={isResendingOtp || resendOtpCooldown}
							className='btn btn-secondary'>
							{isResendingOtp ? <Loader className='size-5 animate-spin' /> : "Resend OTP"}
						</button>
					)}
				</form>
			)}
		</>
	);
};

export default SignUpForm;
