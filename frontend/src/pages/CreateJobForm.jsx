import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from "../lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateJobForm = () => {
    const { username } = useParams();
    const queryClient = useQueryClient();

    const [jobDetails, setJobDetails] = useState({
        title: '',
        description: '',
        location: '',
        company: '',
        salary: '',
    });
    
    const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['', '', ''], correctAnswer: '' }]); // Ensure 3 options

    // Fetch the current logged-in user data
    const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data), // Replace with your actual endpoint
    });

    const { mutate: createJob } = useMutation({
        mutationFn: async (data) => {
            return axiosInstance.post('/jobs/create', data);
        },
        onSuccess: () => {
            toast.success("Job created successfully!"); // Toast notification on success
            setJobDetails({ title: '', description: '', location: '', company: '', salary: 0 });
            setQuizQuestions([{ question: '', options: ['', '', ''], correctAnswer: '' }]); // Reset state
        },
        onError: (error) => {
            console.error("Server error:", error.response ? error.response.data : error.message);
            toast.error("Error creating job: " + (error.response ? error.response.data.message : error.message)); // Toast on error
        },
    });
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobDetails((prev) => ({
            ...prev,
            [name]: name === "salary" ? parseFloat(value) : value,
        }));
    };

    const handleQuizChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQuestions = [...quizQuestions];
        updatedQuestions[index][name] = value;
        setQuizQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...quizQuestions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuizQuestions(updatedQuestions);
    };

    const addQuizQuestion = () => {
        setQuizQuestions([...quizQuestions, { question: '', options: ['', '', ''], correctAnswer: '' }]); // Ensure 3 options
    };

    const removeQuizQuestion = (index) => {
        if (quizQuestions.length > 1) {
            const updatedQuestions = quizQuestions.filter((_, i) => i !== index);
            setQuizQuestions(updatedQuestions);
        } else {
            toast.warning("You must have at least one question.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!jobDetails.title || !jobDetails.salary || !jobDetails.location || !jobDetails.company || !jobDetails.description) {
            toast.error("Please fill out all required fields.");
            return;
        }
        const data = {
            ...jobDetails,
            quizQuestions,
            employer: authUser, // Include the fetched user data as employer
        };
        console.log("Submitting data:", data);
        createJob(data); // Perform job creation
    };

    if (isAuthLoading) {
        return <div>Loading...</div>;
    }

    if (authError) {
        return <div>Error loading user data.</div>;
    }

    return (
        <div>
            <ToastContainer />
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Job Opening</h2>

                <div className="mb-5">
                    <label className="block mb-2 text-sm font-semibold" htmlFor="title">Job Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={jobDetails.title}
                        onChange={handleInputChange}
                        required
                        className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                <div className="mb-5">
                    <label className="block mb-2 text-sm font-semibold" htmlFor="description">Job Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={jobDetails.description}
                        onChange={handleInputChange}
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
                        value={jobDetails.location}
                        onChange={handleInputChange}
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
                        value={jobDetails.company}
                        onChange={handleInputChange}
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
                        value={jobDetails.salary}
                        onChange={handleInputChange}
                        required
                        className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                <h3 className="text-lg font-semibold mb-4">Quiz Questions</h3>
                {quizQuestions.map((question, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-100 shadow">
                        <div className="flex justify-between mb-2">
                            <label className="block mb-1" htmlFor={`question${index}`}>Question {index + 1}</label>
                            <button type="button" onClick={() => removeQuizQuestion(index)} className="text-red-500 hover:underline">Remove</button>
                        </div>
                        <input
                            type="text"
                            name="question"
                            value={question.question}
                            onChange={(e) => handleQuizChange(index, e)}
                            required
                            placeholder="Enter your question here"
                            className="border rounded-lg w-full p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />

                        {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                {optionIndex === 0 && (
                                    <select
                                        name="correctAnswer"
                                        value={question.correctAnswer}
                                        onChange={(e) => handleQuizChange(index, { target: { name: 'correctAnswer', value: e.target.value } })}
                                        className="ml-2 border rounded-lg p-2 bg-gray-200"
                                    >
                                        <option value="" disabled>Select Correct Answer</option>
                                        {question.options.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                <button type="button" onClick={addQuizQuestion} className="mt-2 p-2 shadow-xl border rounded-full bg-blue-500 text-white">Add Quiz Question</button>

                <button type="submit" className="mt-4 p-3 w-full border shadow-xl rounded-full bg-green-500 text-white">Create Job</button>
            </form>
        </div>
    );
};

export default CreateJobForm;
