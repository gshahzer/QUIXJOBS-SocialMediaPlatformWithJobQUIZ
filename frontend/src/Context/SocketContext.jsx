import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from "../lib/axios";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connections, setConnections] = useState([]); // Store connected friends

    const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data),
    });

    useEffect(() => {
        // Ensure authUser is available before connecting the socket
        if (!authUser) return;

        const newSocket = io('http://localhost:5000'); // Update with your server URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            const userId = authUser._id; // Use the actual user ID from authUser
            newSocket.emit('register_user', userId); // Emit user ID to register
        });

        // Listening for messages from connected friends
        newSocket.on('receive_message', (data) => {
            // Handle incoming messages, possibly update the UI
            console.log('Message received:', data);
            // You can implement additional logic to update the UI based on received messages
        });

        // Cleanup on unmount
        return () => {
            newSocket.off('receive_message'); // Remove the listener
            newSocket.close(); // Close the socket connection
        };
    }, [authUser]); // Depend on authUser

    // Fetch connections when authUser is available
    useEffect(() => {
        const fetchConnections = async () => {
            if (authUser) {
                try {
                    const response = await axiosInstance.get('/connections/'); // Replace with your actual endpoint
                    setConnections(response.data); // Set the connections state
                } catch (error) {
                    console.error("Error fetching connections:", error);
                }
            }
        };

        fetchConnections(); // Call the function to fetch connections
    }, [authUser]); // Depend on authUser

    return (
        <SocketContext.Provider value={{ socket, connections }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};

export { SocketContext };
