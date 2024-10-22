import React from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiPencil } from "react-icons/hi"; // Import icons

const JobManagement = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleCreateJob = () => {
    navigate("/jobs/myjobs/create"); // Navigate to Create Job page
  };

  const handleUpdateJob = () => {
    navigate("/jobs/myjobs/update"); // Navigate to Update/Delete Job page
  };

  return (
    <div className="flex flex-col md:flex-row h-[500px] bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg shadow-lg">
      {/* Left Section: Create Job */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-white rounded-l-full shadow-md transition-transform duration-300 hover:scale-105">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">
          Create a New Job
        </h2>
        <button
          onClick={handleCreateJob}
          className="flex items-center justify-center mt-4 p-4 w-44 border rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white transition duration-300 hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <HiPlus className="mr-2" /> Create Job
        </button>
      </div>
      {/* Right Section: Update/Delete Jobs */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-white rounded-r-full shadow-md transition-transform duration-300 hover:scale-105">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">
          Update or Delete Your Jobs
        </h2>
        <button
          onClick={handleUpdateJob}
          className="flex items-center justify-center mt-4 p-4 w-44 border rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white transition duration-300 hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <HiPencil className="mr-2" /> Update/Delete Job
        </button>
      </div>
    </div>
  );
};

export default JobManagement;
