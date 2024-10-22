import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from "../lib/axios";
import ClipLoader from "react-spinners/ClipLoader"; // For loading spinner
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons'

const JobList = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [timer, setTimer] = useState(60);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [applicantData, setApplicantData] = useState({ name: "", location: "", resume: null });
  const [jobStatus, setJobStatus] = useState({}); // Track status for each job

  // Fetch the authenticated user
  const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data),
  });

  // Fetch job data
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => axiosInstance.get('/jobs/jobs').then((res) => res.data.jobs),
  });

  // Fetch job statuses for the authenticated user
  const fetchJobStatuses = async () => {
    try {
      const response = await axiosInstance.get(`/jobstatus/job-status/${authUser._id}`);
      const statuses = response.data; // Assuming this is an array of job status objects
  
      // Create a mapping of jobId to status
      const updatedStatus = {};
      statuses.forEach((status) => {
        updatedStatus[status.jobId._id] = status.status; // Map jobId's _id to its status
      });
  
      setJobStatus(updatedStatus); // Update state with the mapped statuses
    } catch (error) {
      console.error('Error fetching job statuses:', error);
      toast.error('Error loading job statuses.');
    }
  };
  
  
  useEffect(() => {
    fetchJobStatuses();
  }, [authUser]);

  useEffect(() => {
    if (jobsData) {
      const filtered = jobsData.filter((job) => {
        const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesTerm = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesLocation && matchesTerm;
      });
      setFilteredJobs(filtered);
    }
  }, [jobsData, searchTerm, locationFilter]);

  useEffect(() => {
    if (isQuizOpen && !quizComplete) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            toast.error("Time's up! Quiz closed.");
            handleQuizFail();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isQuizOpen, quizComplete]);

  // Handle tab switch event
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isQuizOpen) {
        toast.error("You switched tabs! Quiz closed.");
        handleQuizFail();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isQuizOpen]);

  const handleQuizOpen = (job) => {
    setSelectedJob(job);
    setIsQuizOpen(true);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setTimer(60);
    setQuizScore(0);
    setQuizComplete(false);
    setQuizPassed(false);
    setJobStatus((prev) => ({ ...prev, [job._id]: "default" }));
  };

  const handleQuizFail = () => {
    setIsQuizOpen(false);
    setQuizComplete(true);
    setJobStatus((prev) => ({ ...prev, [selectedJob._id]: "rejected" }));
    updateJobStatusInDatabase(selectedJob._id, 'rejected');
    
  };

  const handleQuizChange = (questionIndex, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < selectedJob.quizQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimer(60);
    } else {
      calculateScore();
      setQuizComplete(true);
    }
    document.querySelectorAll(`input[name="question-${currentQuestionIndex}"]`).forEach((input) => {
      input.checked = false;
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    selectedJob.quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers += 1;
      }
    });
    const score = (correctAnswers / selectedJob.quizQuestions.length) * 100;
    setQuizScore(score);
    if (score >= 75) {
      setQuizPassed(true);
      setShowForm(true); // Show the form if passed
      setJobStatus((prev) => ({ ...prev, [selectedJob._id]: "applied" }));
      updateJobStatusInDatabase(selectedJob._id, 'applied');
    } else {
      toast.error("You are not eligible for the position.");
      setJobStatus((prev) => ({ ...prev, [selectedJob._id]: "notEligible" }));
      updateJobStatusInDatabase(selectedJob._id, 'not eligible');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setApplicantData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeUpload = (e) => {
    if (e.target.files.length > 0) {
      setApplicantData((prev) => ({
        ...prev,
        resume: e.target.files[0], // Ensure this is a File object
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!applicantData.name || !applicantData.location || !applicantData.resume) {
      toast.error("Please fill out all fields.");
      return;
    }
    // Create a FormData object to send the resume file
    const formData = new FormData();
    formData.append("name", applicantData.name);
    formData.append("location", applicantData.location);
    formData.append("resume", applicantData.resume); // Ensure this is a File object
    formData.append("email", authUser.email); // Use the email from the authenticated user
    formData.append("jobTitle", selectedJob.title);
    formData.append("userId", authUser._id);
    formData.append("jobId", selectedJob._id); // Add the job title

    try {
      // Logic to handle form submission (e.g., send data to server)
      await axiosInstance.post('/applicants/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Your application has been submitted!");
      setShowForm(false);
      setIsQuizOpen(false);
      setJobStatus((prev) => ({ ...prev, [selectedJob._id]: "applied" }));
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("There was an error submitting your application. Please try again.");
    }
  };

  const updateJobStatusInDatabase = async (jobId, status) => {
    try {
      const userId = authUser._id; // Ensure authUser contains an id field
      console.log('Updating job status with data:', { userId, jobId, status }); // Log the data being sent
  
      // Ensure the URL is correct and matches your backend setup
      const response = await axiosInstance.post('/jobstatus/job-status', { userId, jobId, status });
      
      // Optional: log the response for additional context
      console.log('Job status updated successfully:', response.data);
      
    } catch (error) {
      console.error("Error updating job status:", error);
  
      // Check for specific error details
      if (error.response) {
        console.error("Error response:", error.response.data); // Log the error response from the server
        console.error("Error status:", error.response.status); // Log the HTTP status code
      }
  
      toast.error("Error updating job status.");
    }
  };

  if (isAuthLoading || isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader loading={isLoading} size={50} />
    </div>
  );

  if (authError || error) return <div>Error loading jobs: {authError?.message || error?.message}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
       <ToastContainer />
      <h2 className="text-3xl font-bold text-center mb-6">All Jobs</h2>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, company, or keywords..."
          className="p-2 border rounded w-1/2"
        />
        <input
          type="text"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Filter by location..."
          className="p-2 border rounded w-1/2"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredJobs.length === 0 ? ( // Check if there are no jobs
    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-4">
      <h2 className="text-xl font-semibold">No Jobs Available</h2>
      <p className="text-gray-600 text-xs">Please check back later.</p>
    </div>
  ) : (
    filteredJobs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort jobs by creation date
      .map((job) => (
        <div key={job._id} className="border rounded p-4 shadow hover:shadow-lg bg-white relative transform transition-transform duration-300 ease-in-out hover:scale-105">
          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-4">{job.company}</p>
          <p className="text-gray-600 mb-4">{job.location}</p>
          <p className="text-gray-600 mb-4">{job.description}</p>

          {/* Button Section with Flexbox for Alignment */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (!["rejected", "not eligible", "applied"].includes(jobStatus[job._id])) {
                  handleQuizOpen(job);
                }
              }}
              className={`px-4 py-2 rounded text-white ${
                jobStatus[job._id] === "applied"
                  ? "bg-green-500"
                  : jobStatus[job._id] === "rejected"
                  ? "bg-red-500"
                  : jobStatus[job._id] === "not eligible"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              disabled={["rejected", "not eligible", "applied"].includes(jobStatus[job._id])}
            >
              {jobStatus[job._id] === "applied"
                ? "Applied"
                : jobStatus[job._id] === "rejected"
                ? "Rejected"
                : jobStatus[job._id] === "not eligible"
                ? "Not Eligible"
                : "Attempt Quiz for Position"}
            </button>
            
          </div>
        </div>
      ))
  )}
</div>


      {isQuizOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 h-4/5 relative flex flex-col items-center justify-center transition-all transform duration-300 ease-in-out">
            <h2 className="text-3xl font-bold mb-6">Attempt Quiz for {selectedJob.title} </h2>

            <div className="w-full h-3 mb-6 bg-gray-300 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / selectedJob.quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            <div className="absolute top-4 left-4 text-white bg-blue-600 px-3 py-1 rounded-full shadow-md">
              Time Left: {timer}s
            </div>

            {!quizComplete && (
              <div>
                <h3 className="text-xl font-bold mb-4">{selectedJob.quizQuestions[currentQuestionIndex].question}</h3>
                {selectedJob.quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="mb-2">
                    <label>
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        onChange={() => handleQuizChange(currentQuestionIndex, option)}
                      />
                      {option}
                    </label>
                  </div>
                ))}
                <button
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  onClick={handleNextQuestion}
                >
                  Next
                </button>
              </div>
            )}

            {quizComplete && (
              <div>
                <h3 className="text-xl font-bold mb-4">Your Score: {quizScore}%</h3>
                {quizPassed ? (
                  <div>
                    <p className="text-green-600">Congratulations! You passed the quiz!</p>
                    <button
                      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                      onClick={() => setShowForm(true)}
                    >
                      Proceed to Apply
                    </button>
                  </div>
                ) : (
                  <p className="text-red-600">You did not pass the quiz.</p>
                  
                )}
              </div>
            )}
            <button
              className="absolute top-4 right-4 bg-red-500 w-[50px] h-[50px] text-white rounded-full p-2"
              onClick={() => {
                setIsQuizOpen(false);
                setQuizComplete(false);
              }}
            >
              X
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          
          <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 md:w-1/2">
          
            <h2 className="text-2xl font-bold mb-4">Application Form for {selectedJob.title}</h2>
            <form onSubmit={handleFormSubmit}>
            <button
              className="absolute top-[90px] right-[325px] bg-red-500 w-[50px] h-[50px] text-white rounded-full p-2"
              onClick={() => {
                setShowForm(false);
              }}
            >
              X
            </button>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={applicantData.name}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={applicantData.location}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Upload Resume</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Submit Application
              </button>
          
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
