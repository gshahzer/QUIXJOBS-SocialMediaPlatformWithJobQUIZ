import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import ApplyForJob from "./pages/ApplyForJob";
import JobManagement from "./pages/JobSplit";
import CreateJobForm from "./pages/CreateJobForm";
import JobsUpdateDel from "./pages/JobsUpdateDel";
import Applications from "./pages/Applications";
import MessagingToggle from "./components/Messaging/MessagingToggle";
import InterviewPreparation from "./pages/InterviewPreparation";

function App() {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get("/auth/me");
				return res.data;
			} catch (err) {
				if (err.response && err.response.status === 401) {
					return null;
				}
				toast.error(err.response.data.message || "Something went wrong");
			}
		},
	});

	if (isLoading) return null;

	return (
		<Layout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
				<Route path='/notifications' element={authUser ? <NotificationsPage /> : <Navigate to={"/login"} />} />
				<Route path='/network' element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />} />
				<Route path='/post/:postId' element={authUser ? <PostPage /> : <Navigate to={"/login"} />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
				<Route path="/jobs/myjobs" element={authUser ? <JobManagement /> : <Navigate to={"/login"} />} />
				<Route path="/jobs/myjobs/create" element={authUser ? <CreateJobForm /> : <Navigate to={"/login"} />} />
				<Route path="/jobs/myjobs/update" element={authUser ? <JobsUpdateDel /> : <Navigate to={"/login"} />} />
				<Route path="/jobs/apply" element={authUser ? <ApplyForJob /> : <Navigate to={"/login"} />} />
				<Route path="/applications" element={authUser ? <Applications /> : <Navigate to={"/login"} />} />
				<Route path="/interviewpreparation" element={authUser ? <InterviewPreparation/> : <Navigate to={"/login"} />} />
			</Routes>
			<Toaster />
			{authUser && <MessagingToggle />} {/* Render MessagingToggle only when the user is logged in */}
		</Layout>
	);
}

export default App;
