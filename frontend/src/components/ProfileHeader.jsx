import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Camera, Clock, MapPin, Star, UserCheck, UserPlus, X } from "lucide-react";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [userRating, setUserRating] = useState(null);
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
        queryKey: ["connectionStatus", userData._id],
        queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
        enabled: !isOwnProfile,
    });

    const { data: ratingsData, refetch: refetchRatings } = useQuery({
        queryKey: ["ratings", userData._id],
        queryFn: () => axiosInstance.get(`/ratings/${userData._id}`),
        enabled: !!userData._id, // Only fetch if userId is available
    });

    const isConnected = userData.connections.some((connection) => connection === authUser._id);

    // Connection request mutations
    const { mutate: sendConnectionRequest } = useMutation({
        mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () => {
            toast.success("Connection request sent");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: acceptRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: rejectRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request rejected");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: removeConnection } = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
        onSuccess: () => {
            toast.success("Connection removed");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    // Rating submission mutation
    const { mutate: rateUser } = useMutation({
        mutationFn: (rating) => axiosInstance.post('/ratings', rating),
        onSuccess: () => {
            toast.success("Rating submitted");
            refetchRatings(); // Refetch ratings after submission
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    // Derived connection status
    const getConnectionStatus = useMemo(() => {
        if (isConnected) return "connected";
        return connectionStatus?.data?.status || "not_connected";
    }, [isConnected, connectionStatus]);

    // Render connection button based on connection status
    const renderConnectionButton = () => {
        const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
        switch (getConnectionStatus) {
            case "connected":
                return (
                    <div className='flex gap-2 justify-center'>
                        <div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
                            <UserCheck size={20} className='mr-2' />
                            Connected
                        </div>
                        <button
                            className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
                            onClick={() => removeConnection(userData._id)}
                        >
                            <X size={20} className='mr-2' />
                            Remove Connection
                        </button>
                    </div>
                );

            case "pending":
                return (
                    <button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
                        <Clock size={20} className='mr-2' />
                        Pending
                    </button>
                );

            case "received":
                return (
                    <div className='flex gap-2 justify-center'>
                        <button
                            onClick={() => acceptRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-green-500 hover:bg-green-600`}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => rejectRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-red-500 hover:bg-red-600`}
                        >
                            Reject
                        </button>
                    </div>
                );

            default:
                return (
                    <button
                        onClick={() => sendConnectionRequest(userData._id)}
                        className='bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
                    >
                        <UserPlus size={20} className='mr-2' />
                        Connect
                    </button>
                );
        }
    };

    // Handle image changes for profile and banner
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedData((prev) => ({ ...prev, [event.target.name]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle saving edited data
    const handleSave = () => {
        onSave(editedData);
        setIsEditing(false);
    };

    // Handle rating changes
    const handleRatingChange = (rating) => {
        if (!isOwnProfile) { // Prevent rating own profile
            setUserRating(rating);
            rateUser({ userId: userData._id, rating }); // Submit rating directly
        }
    };

    // Calculate average rating if ratings are available
    const averageRating = ratingsData?.data?.averageRating || 0;

    return (
        <div className='bg-white shadow rounded-lg mb-6'>
            <div
                className='relative h-48 rounded-t-lg bg-cover bg-center'
                style={{
                    backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
                }}
            >
                {isEditing && isOwnProfile && (
                    <label className='absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer'>
                        <Camera size={20} />
                        <input
                            type='file'
                            className='hidden'
                            name='bannerImg'
                            onChange={handleImageChange}
                            accept='image/*'
                        />
                    </label>
                )}
            </div>

            <div className='p-4'>
                <div className='relative -mt-20 mb-4'>
                    <img
                        className='w-32 h-32 rounded-full mx-auto object-cover'
                        src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
                        alt={userData.name}
                    />

                    {isEditing && isOwnProfile && (
                        <label className='absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer'>
                            <Camera size={20} />
                            <input
                                type='file'
                                className='hidden'
                                name='profilePicture'
                                onChange={handleImageChange}
                                accept='image/*'
                            />
                        </label>
                    )}
                </div>

                <div className='text-center mb-4'>
                    {isEditing && isOwnProfile ? (
                        <input
                            type='text'
                            value={editedData.name ?? userData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            className='text-2xl font-bold mb-2 text-center w-full'
                        />
                    ) : (
                        <h1 className='text-2xl font-bold mb-2'>{userData.name}</h1>
                    )}

                    {isEditing && isOwnProfile ? (
                        <input
                            type='text'
                            value={editedData.headline ?? userData.headline}
                            onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
                            className='text-lg text-gray-500 mb-2 text-center w-full'
                        />
                    ) : (
                        <h2 className='text-lg text-gray-500 mb-2'>{userData.headline}</h2>
                    )}
                </div>

                <div className='flex justify-center gap-4 mb-4'>
                    <div className='flex items-center'>
                        <MapPin size={20} className='mr-1' />
                        <span>{userData.location || "Not specified"}</span>
                    </div>
                </div>

				<div className='flex justify-center mb-4'>
    <div className='text-center'>
        <p className='text-lg font-semibold mb-2'>Average Rating</p>
        <div className='flex justify-center items-center mb-1'>
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    size={32} // Increased size for better visibility
                    className={`cursor-pointer transition-transform duration-200 ease-in-out transform ${index < averageRating ? "text-yellow-500" : "text-gray-300"} hover:scale-110`}
                    onClick={() => handleRatingChange(index + 1)}
                />
            ))}
        </div>
        <p className='text-sm text-gray-500'>
            <span className='font-semibold text-gray-800'>{averageRating.toFixed(1)}</span> / 5
        </p>
    </div>
</div>


                <div className='flex justify-center'>
                    {isEditing && isOwnProfile ? (
                        <button onClick={handleSave} className='bg-blue-500 text-white px-4 py-2 rounded'>
                            Save
                        </button>
                    ) : isOwnProfile ? (
							<button onClick={() => setIsEditing(true)} className='bg-blue-500 text-white py-2 px-4 rounded'>
								Edit Profile
							</button>
							): (
                        renderConnectionButton()
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
