import { useState, useEffect, useRef } from "react"; // Import useRef
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import {
  Bell,
  Home,
  LogOut,
  User,
  Users,
  Briefcase,
  ChevronDown,
  Plus,
  Send,
  Dock,
  Speech
} from "lucide-react"; // Use Send icon for applying job

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unreadNotificationCount = notifications?.data.filter(
    (notif) => !notif.read
  ).length;
  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                className="h-8 rounded"
                src="/small-logo.png"
                alt="quix job"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {authUser ? (
              <>
                <Link
                  to={"/"}
                  className="text-neutral flex flex-col items-center"
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>
                <Link
                  to="/network"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {unreadConnectionRequestsCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unreadConnectionRequestsCount}
                    </span>
                  )}
                </Link>

                {/* Jobs Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="text-neutral flex flex-col items-center "
                    onClick={toggleDropdown} // Toggle dropdown
                  >
                    <Briefcase size={20} />
                    <span className="text-xs hidden md:block">Jobs</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute bg-white shadow-lg rounded mt-2 w-[140px]">
                      <Link
                        to="/jobs/apply"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {/* Apply for Job icon */}
                        <Send size={16} className="mr-2" />{" "}
                        {/* Changed to Send icon */}
                        Apply for Job
                      </Link>
                      <Link
                        to="/jobs/myjobs"
                        className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {/* Create a Job icon */}
                        <Plus size={16} className="mr-2" />
                        Create a Job
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/applications"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Dock size={20} />
                  <span className="text-xs hidden md:block">Applications</span>
                  
                    
               
                </Link>
                <Link
                  to="/interviewpreparation"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Speech size={20} />
                  <span className="text-xs hidden md:block">Interview Preparation</span>
                  
                    
               
                </Link>
                <Link
                  to="/notifications"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>

                <Link
                  to={`/profile/${authUser.username}`}
                  className="text-neutral flex flex-col items-center"
                >
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary text-white">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
