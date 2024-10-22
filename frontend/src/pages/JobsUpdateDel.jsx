import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from "../lib/axios";
import 'tailwindcss/tailwind.css';

import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobList = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch the current logged-in user data
    const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data),
    });

    // Fetch jobs only if the user is authenticated
    const { data: jobsData, isLoading: isJobsLoading, error: jobsError } = useQuery({
        queryKey: ["myJobs", authUser?._id],
        queryFn: () => axiosInstance.get(`/jobs/my-jobs/${authUser?._id}`).then((res) => res.data),
        enabled: !!authUser,
    });

    const deleteJobMutation = useMutation({
        mutationFn: (jobId) => axiosInstance.delete(`/jobs/jobs/${jobId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["myJobs", authUser?._id]);
            toast.success("Job deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting job: ${error.response.data.message}`);
        },
    });

    const handleDeleteJob = (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            deleteJobMutation.mutate(jobId);
        }
    };

    const [editingJob, setEditingJob] = useState(null);
    const [updatedTitle, setUpdatedTitle] = useState('');
    const [updatedDescription, setUpdatedDescription] = useState('');
    const [updatedLocation, setUpdatedLocation] = useState('');
    const [updatedCompany, setUpdatedCompany] = useState('');
    const [updatedSalary, setUpdatedSalary] = useState('');
    const [updatedQuizQuestions, setUpdatedQuizQuestions] = useState([]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const openPopup = (job) => {
        setEditingJob(job);
        setUpdatedTitle(job.title);
        setUpdatedDescription(job.description);
        setUpdatedLocation(job.location);
        setUpdatedCompany(job.company);
        setUpdatedSalary(job.salary);
        setUpdatedQuizQuestions(job.quizQuestions || []);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setEditingJob(null);
        setUpdatedTitle('');
        setUpdatedDescription('');
        setUpdatedLocation('');
        setUpdatedCompany('');
        setUpdatedSalary('');
        setUpdatedQuizQuestions([]);
    };

    const updateJobMutation = useMutation({
        mutationFn: (updatedJob) => axiosInstance.put(`/jobs/jobs/${updatedJob._id}`, updatedJob),
        onSuccess: () => {
            queryClient.invalidateQueries(["myJobs", authUser?._id]);
            closePopup();
            toast.success("Job updated successfully");
        },
        onError: (error) => {
            toast.error(`Error updating job: ${error.response.data.message}`);
        },
    });

    const handleUpdateJob = (e) => {
        e.preventDefault();
        if (editingJob) {
            const updatedJob = { 
                ...editingJob, 
                title: updatedTitle, 
                description: updatedDescription, 
                location: updatedLocation,
                company: updatedCompany,
                salary: updatedSalary,
                quizQuestions: updatedQuizQuestions 
            };
            updateJobMutation.mutate(updatedJob);
        }
    };

    const handleAddQuizQuestion = () => {
        setUpdatedQuizQuestions([...updatedQuizQuestions, { question: '', options: [''], correctAnswer: '' }]);
    };

    const handleDeleteQuizQuestion = (index) => {
        const newQuizQuestions = updatedQuizQuestions.filter((_, i) => i !== index);
        setUpdatedQuizQuestions(newQuizQuestions);
    };

    const handleQuizQuestionChange = (index, field, value) => {
        const newQuizQuestions = [...updatedQuizQuestions];
        if (field === 'question') {
            newQuizQuestions[index].question = value;
        } else if (field === 'options') {
            newQuizQuestions[index].options = value.split(',').map(option => option.trim()); // Options are comma-separated
        } else if (field === 'correctAnswer') {
            newQuizQuestions[index].correctAnswer = value;
        }
        setUpdatedQuizQuestions(newQuizQuestions);
    };

    if (isAuthLoading) return <div className="text-center">Loading user...</div>;
    if (authError) {
        console.error(authError);
        return <div className="text-center text-red-500">Error fetching user: {authError.message}</div>;
    }

    if (isJobsLoading) return <div className="text-center">Loading jobs...</div>;
    if (jobsError) {
        console.error(jobsError);
        return <div className="text-center text-red-500">Error fetching jobs: {jobsError.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-4">Your Jobs</h1>
            {jobsData && jobsData.jobs && jobsData.jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobsData.jobs.map((job) => (
                        <div key={job._id} className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold">{job.title}</h2>
                            <p className="text-gray-600">{job.description}</p>
                            <p className="mt-2"><strong>Location:</strong> {job.location}</p>
                            <p><strong>Company:</strong> {job.company}</p>
                            <p><strong>Salary:</strong> {job.salary}</p>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => openPopup(job)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Edit</button>
                                <button onClick={() => handleDeleteJob(job._id)} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">
                No jobs created. Why not try <button className="text-blue-500 underline" onClick={() => navigate('/jobs/myjobs/create')}>creating one</button>?
            </p>
            )}

            {/* Popup Form */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mt-24 overflow-y-auto max-h-[80vh]">
                        <h2 className="text-2xl font-bold mb-6 text-center">Edit Job Opening</h2>

                        <form onSubmit={handleUpdateJob}>
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold" htmlFor="title">Job Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={updatedTitle}
                                    onChange={(e) => setUpdatedTitle(e.target.value)}
                                    required
                                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold" htmlFor="description">Job Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={updatedDescription}
                                    onChange={(e) => setUpdatedDescription(e.target.value)}
                                    required
                                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    rows="4"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold" htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={updatedLocation}
                                    onChange={(e) => setUpdatedLocation(e.target.value)}
                                    required
                                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold" htmlFor="company">Company Name</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={updatedCompany}
                                    onChange={(e) => setUpdatedCompany(e.target.value)}
                                    required
                                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold" htmlFor="salary">Salary</label>
                                <input
                                    type="number"
                                    id="salary"
                                    name="salary"
                                    value={updatedSalary}
                                    onChange={(e) => setUpdatedSalary(e.target.value)}
                                    required
                                    className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold">Quiz Questions</label>
                                {updatedQuizQuestions.map((question, index) => (
                                    <div key={index} className="mb-4">
                                        <input
                                            type="text"
                                            value={question.question}
                                            onChange={(e) => handleQuizQuestionChange(index, 'question', e.target.value)}
                                            placeholder={`Question ${index + 1}`}
                                            className="border rounded-lg w-full p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                        <input
                                            type="text"
                                            value={question.options.join(',')}
                                            onChange={(e) => handleQuizQuestionChange(index, 'options', e.target.value)}
                                            placeholder="Options (comma separated)"
                                            className="border rounded-lg w-full p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                        <input
                                            type="text"
                                            value={question.correctAnswer}
                                            onChange={(e) => handleQuizQuestionChange(index, 'correctAnswer', e.target.value)}
                                            placeholder="Correct Answer"
                                            className="border rounded-lg w-full p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteQuizQuestion(index)}
                                            className="mt-2 text-red-500 underline"
                                        >
                                            Delete Question
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddQuizQuestion}
                                    className="text-blue-500 underline"
                                >
                                    Add Quiz Question
                                </button>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                >
                                    Update Job
                                </button>
                                <button
                                    type="button"
                                    onClick={closePopup}
                                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobList;
