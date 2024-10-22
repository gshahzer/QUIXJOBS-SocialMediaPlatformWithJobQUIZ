import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa'; // Import the close icon
import MessagingPanel from './MessagingPanel';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5173'); // Update this URL as needed

const MessagingToggle = () => {
    const [isOpen, setIsOpen] = useState(false); // Messaging panel toggle
    const messagingPanelRef = useRef(null); // Ref for the messaging panel
    const [unreadMessages, setUnreadMessages] = useState(false); // Track unread messages

    const toggleMessagingPanel = () => {
        setIsOpen(!isOpen);

        // Mark messages as read when the panel is opened
        if (!isOpen) {
            setUnreadMessages(false);
        }
    };

    const sendMessage = (message) => {
        if (socket) {
            socket.emit('send_message', message);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (data) => {
                console.log(data);
                // Handle incoming messages and set unreadMessages to true
                if (!isOpen) {
                    setUnreadMessages(true); // Only set unread if panel is closed
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [isOpen]); // Rerun effect when panel open state changes

    // Handle clicks outside the messaging panel
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (messagingPanelRef.current && !messagingPanelRef.current.contains(event.target)) {
                setIsOpen(false); // Close the panel if clicked outside
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="fixed bottom-4 right-4">
            <button
                onClick={toggleMessagingPanel}
                className="relative flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg focus:outline-none transition-transform duration-300 transform hover:scale-105"
            >
                {/* Toggle between chat icon and close icon */}
                {isOpen ? (
                    <FaTimes size={24} className="transition-transform duration-300 hover:animate-spin" />
                ) : (
                    <FaComments size={24} className="transition-transform duration-300" />
                )}

                {/* Show unread message dot */}
                {!isOpen && unreadMessages && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={messagingPanelRef} // Attach the ref to the panel
                    className="absolute right-0 bottom-14 bg-white border-none rounded-2xl shadow-lg transition-opacity duration-300"
                >
                    <MessagingPanel sendMessage={sendMessage} /> {/* Pass sendMessage to MessagingPanel */}
                </div>
            )}
        </div>
    );
};

export default MessagingToggle;
