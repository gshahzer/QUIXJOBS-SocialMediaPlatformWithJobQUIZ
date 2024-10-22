import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApplicationsPage = () => {
    const [userApplications, setUserApplications] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    // Fetch authenticated user data
    const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data),
    });

    // Fetch applications for the authenticated user
    const { data: userAppsData, isLoading: isUserAppsLoading, error: userAppsError } = useQuery({
        queryKey: ['userApplications', authUser?._id],
        enabled: !!authUser?._id,
        queryFn: () => axiosInstance.get(`/applicants/user/applications`).then((res) => res.data),
    });

    // Fetch applications for the jobs created by the authenticated user
    const { data: jobAppsData, isLoading: isJobAppsLoading, error: jobAppsError } = useQuery({
        queryKey: ['jobApplications', authUser?._id],
        enabled: !!authUser?._id,
        queryFn: () => axiosInstance.get(`/applicants/user/jobs/applications`).then((res) => res.data),
    });

    // Set user and job applications from fetched data
    useEffect(() => {
        if (userAppsData) {
            setUserApplications(userAppsData);
        }
        if (jobAppsData) {
            setJobApplications(jobAppsData);
        }
    }, [userAppsData, jobAppsData]);

    // Mutation for updating application status
    const mutation = useMutation({
        mutationFn: (applicationData) => {
            return axiosInstance.put(`/applicants/update-status`, applicationData);
        },
        onSuccess: (data, variables) => {
            // Optimistically update the status in the UI
            setJobApplications((prevApps) =>
                prevApps.map((app) =>
                    app?._id === variables.applicantId ? { ...app, status: data.applicant?.status } : app
                )
            );

            // Log the newStatus
            console.log("New Status:", variables.status);

            // Show toast notification based on status
            if (variables.status === 'Shortlisted') {
                toast.success("Applicant is shortlisted, email has been sent to them to let them know");
            } else if (variables.status === 'Rejected') {
                toast.error("Applicant is rejected, email has been sent to them to let them know");
            }

            // Invalidate queries to refetch data after update
            queryClient.invalidateQueries(['jobApplications']);
        },
        onError: (err) => {
            console.error(err.message);
            toast.error("Error updating status: " + err.message);
        },
    });

    const handleStatusChange = (applicationId, newStatus, isJobApp) => {
        if (isJobApp) {
            console.log("Updating Status for Application ID:", applicationId, "to New Status:", newStatus);
            mutation.mutate({ applicantId: applicationId, status: newStatus });
        } else {
            alert("You cannot update the status of your own application.");
        }
    };
    // Handle loading and error states
    if (isAuthLoading || isUserAppsLoading || isJobAppsLoading) {
        return <div className="text-center">Loading...</div>;
    }

    if (authError) {
        return <div className="text-red-500">Error fetching user: {authError.message}</div>;
    }

    if (userAppsError) {
        return <div className="text-red-500">Error fetching your applications: {userAppsError.message}</div>;
    }

    if (jobAppsError) {
        return <div className="text-red-500">Error fetching applications to your jobs: {jobAppsError.message}</div>;
    }

    const handleDownloadResume = (resumeUrl, originalFilename) => {
        console.log("Resume URL:", resumeUrl);
        console.log("Original Filename:", originalFilename);
    
        if (!originalFilename) {
            console.error("Original filename is not defined.");
            toast.error("Error: Filename is not defined.");
            return;
        }
    
        const filePath = `http://localhost:5000/${resumeUrl}`; // Ensure this matches your server route
    
        axiosInstance.get(filePath, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', originalFilename); // Use the original filename
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error("Error downloading the resume:", error);
                toast.error("Error downloading the resume.");
            });
    };
    
    
    

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />
            <h1 className="text-4xl font-bold mb-4">Applications</h1>

            {Array.isArray(userApplications) && userApplications.length === 0 ? (
                <p>No applications found.</p>
            ) : (
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Applications</h2>
                    <table className="min-w-full bg-white border border-gray-200 mb-4">
                        <thead>
                            <tr>
                                <th className="py-2 border-b">Job Title</th>
                                <th className="py-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userApplications.map((application) => (
                                <tr key={application?._id}>
                                    <td className="py-2 border-b text-center">{application?.jobTitle || 'N/A'}</td>
                                    <td className="py-2 border-b text-center">{application?.status || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <section>
                <h2 className="text-4xl font-bold mb-4">Applications to Your Jobs</h2>
                {Array.isArray(jobApplications) && jobApplications.length === 0 ? (
                    <p>No applications found for your created jobs.</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 border-b">Job Title</th>
                                <th className="py-2 border-b">Applicant Name</th>
                                <th className="py-2 border-b">Status</th>
                                <th className="py-2 border-b">Resume</th>
                                <th className="py-2 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobApplications.map((application) => (
                                <tr key={application?._id}>
                                    <td className="py-2 border-b text-center">{application?.jobTitle || 'N/A'}</td>
                                    <td className="py-2 border-b text-center">{application?.applicantName || 'N/A'}</td>
                                    <td className="py-2 border-b text-center">{application?.status || 'N/A'}</td>
                                    <td className="py-2 border-b text-center">
                                        <a
                                            onClick={() => handleDownloadResume(application?.resume, application?.resume.split('\\').pop())}
                    className="text-blue-500 underline cursor-pointer"
                                           download
                                          
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download Resume
                                        </a>
                                    </td>
                                    <td className="py-2 border-b text-center">
                                        <select
                                            value={application?.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(application._id, e.target.value, true)}
                                            className="border rounded p-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {error && <div className="text-red-500 mt-4">Error: {error}</div>}
        </div>
    );
};

export default ApplicationsPage;
