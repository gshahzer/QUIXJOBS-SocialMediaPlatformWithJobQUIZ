import { Link } from "react-router-dom";
import { Home, UserPlus, Bell, Share2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios'; // Import your axios instance here

export default function Sidebar({ user }) {
    // Check if user is valid
    if (!user || !user._id) {
        return <div className="p-4 text-center">Loading user data...</div>; // Loading message
    }

	const { data: ratingsData, error, isLoading } = useQuery({
		queryKey: ["ratings", user._id],
		queryFn: () => axiosInstance.get(`/ratings/${user._id}`).then(res => {
			console.log("Fetched ratings data:", res.data); // Log fetched data
			return res.data;
		}),
		enabled: !!user._id, // Only fetch if userId is available
	});
	
	// Error logging
	if (error) {
		console.error("Error fetching ratings:", error);
	}
    const handleReferralClick = () => {
        const referralLink = window.location.href; // Gets the current page URL

        navigator.clipboard.writeText(referralLink).then(() => {
            toast.success("Referral link is copied!");
        }).catch(err => {
            toast.error("Failed to copy the referral link.");
        });
    };

    return (
        <div className='bg-secondary rounded-lg shadow'>
            <ToastContainer />
            <div className='p-4 text-center'>
                <div
                    className='h-16 rounded-t-lg bg-cover bg-center'
                    style={{
                        backgroundImage: `url("${user.bannerImg || "/banner.png"}")`,
                    }}
                />
                <Link to={`/profile/${user.username}`}>
                    <img
                        src={user.profilePicture || "/avatar.png"}
                        alt={user.name}
                        className='w-20 h-20 rounded-full mx-auto mt-[-40px]'
                    />
                    <h2 className='text-xl font-semibold mt-2'>{user.name}</h2>
                </Link>
                <p className='text-info'>{user.headline}</p>
                <p className='text-info text-xs'>{user.connections.length} connections</p>
            </div>
            <div className='border-t border-base-100 p-4'>
                <nav>
                    <ul className='space-y-2'>
                        <li>
                            <Link
                                to='/'
                                className='flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                            >
                                <Home className='mr-2' size={20} /> Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/network'
                                className='flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                            >
                                <UserPlus className='mr-2' size={20} /> My Network
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/notifications'
                                className='flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                            >
                                <Bell className='mr-2' size={20} /> Notifications
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="#"
                                onClick={handleReferralClick}
                                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
                            >
                                <Share2 className="mr-2" size={20} /> Refer to a friend
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Your Rating Section */}
			<div className='border-t border-base-100 p-4 bg-white ml-4'>
    <h3 className='text-lg font-semibold mb-3'>Your Rating</h3>
    {isLoading ? (
        <p className='text-gray-500'>Loading...</p>
    ) : error ? (
        <p className='text-red-500'>Error fetching rating: {error.message}</p>
    ) : (
        <div className='flex items-center'>
            {ratingsData && ratingsData.averageRating !== undefined ? (
                <>
                    <div className='flex items-center'>
                        <span className='text-yellow-500 text-2xl'>
                            {'★'.repeat(Math.floor(ratingsData.averageRating))}
                        </span>
                        <span className='text-gray-300 text-2xl'>
                            {'★'.repeat(5 - Math.floor(ratingsData.averageRating))}
                        </span>
                    </div>
                    <span className='ml-2 text-info text-lg font-semibold'>
                        {ratingsData.averageRating.toFixed(1)}
                    </span>
                    <span className='text-sm text-gray-500 ml-2'>/ 5</span>
                </>
            ) : (
                <p className='text-gray-500'>No rating available</p>
            )}
        </div>
    )}
</div>


            <div className='border-t border-base-100 p-4 ml-4'>
                <Link to={`/profile/${user.username}`} className='text-sm font-semibold'>
                    Visit your profile
                </Link>
            </div>
        </div>
    );
}
