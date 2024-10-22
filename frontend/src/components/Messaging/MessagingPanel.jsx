import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../../Context/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from "../../lib/axios"; 
import EmojiPicker from 'emoji-picker-react';

const MessagingPanel = () => {
    const { socket } = useContext(SocketContext);
    const [messages, setMessages] = useState({});
    const [inputMessage, setInputMessage] = useState('');
    const [openChats, setOpenChats] = useState({});
    const [latestMessages, setLatestMessages] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [isChatPanelOpen, setChatPanelOpen] = useState(true);

    const toggleChatPanel = () => {
    setChatPanelOpen((prevState) => !prevState);
};

    const chatRefs = useRef({}); // Create a ref for each chat container

    const { data: authUser, isLoading: isAuthLoading, error: authError } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get('/auth/me').then((res) => res.data),
    });

    const { data: connections = [], isLoading: isConnectionsLoading, error: connectionsError } = useQuery({
        queryKey: ['connections'],
        queryFn: () => axiosInstance.get('/connections').then((res) => res.data),
    });

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (data) => {
                console.log('Message received:', data);
                if (data.sender && data.recipient) {
                    // Update messages
                    setMessages((prevMessages) => ({
                        ...prevMessages,
                        [data.sender]: [
                            ...(prevMessages[data.sender] || []),
                            { sender: data.sender, message: data.message }
                        ]
                    }));
                    if (!openChats[data.sender]) {
                        setUnreadMessages((prevUnread) => ({
                            ...prevUnread,
                            [data.sender]: true  // Mark as unread
                        }));
                    }
                    // Update latest message for both sender and recipient
                    setLatestMessages((prevLatest) => ({
                        ...prevLatest,
                        [data.sender]: data.message,
                        [data.recipient]: data.message // Update for recipient too
                    }));
                }
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket]);

    useEffect(() => {
        if (authUser) {
            console.log('Connections data:', connections); // Inspect connections data

            if (Array.isArray(connections)) {
                connections.forEach((friend) => {
                    fetchChatHistory(friend._id);
                });
            } else {
                console.error('Connections is not an array:', connections);
            }
        }
    }, [authUser, connections]);

    const fetchChatHistory = async (friendId) => {
        try {
            const { data: chatHistory } = await axiosInstance.get(`/messages/chat-history/${authUser._id}/${friendId}`);
            console.log('Chat history:', chatHistory); // Check fetched chat history

            if (chatHistory && chatHistory.length > 0) {
                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [friendId]: chatHistory
                }));

                const lastMessage = chatHistory[chatHistory.length - 1];
                setLatestMessages((prevLatest) => ({
                    ...prevLatest,
                    [friendId]: lastMessage.message,
                    [lastMessage.sender]: lastMessage.message // Update for sender too
                }));
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleSend = async (friend) => {
        if (inputMessage.trim() && friend && authUser) {
            const messageData = {
                recipient: friend._id,
                message: inputMessage, // This can include emojis
                sender: authUser._id
            };
    
            try {
                // Emit the message without waiting for a response to prevent channel closing issues
                socket.emit('send_message', messageData);
    
                // Save the message to the database
                await axiosInstance.post('/messages/save-message', messageData);
    
                // Update local messages
                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [friend._id]: [
                        ...(prevMessages[friend._id] || []),
                        { sender: authUser._id, message: inputMessage }
                    ]
                }));
    
                // Update the latest message
                setLatestMessages((prevLatest) => ({
                    ...prevLatest,
                    [friend._id]: inputMessage,
                    [authUser._id]: inputMessage // Optionally update for self
                }));
    
                setInputMessage(''); // Clear input after sending
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };
    
    const toggleChat = (friendId) => {
        setOpenChats((prev) => {
            // Close all chats except the one being opened or toggle the current one
            const newOpenChats = {};
            if (!prev[friendId]) {
                // Open the selected chat and close others
                newOpenChats[friendId] = true;
            } else {
                // If the chat is already open, just close it
                newOpenChats[friendId] = false;
            }
            return newOpenChats;
        });
         // Mark messages as read when opening the chat
    setUnreadMessages((prevUnread) => ({
        ...prevUnread,
        [friendId]: false // Mark as read
    }));
        if (!openChats[friendId]) {
            setTimeout(() => {
                const chatContainer = chatRefs.current[friendId];
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
                }
            }, 100); // Delay to ensure messages are rendered
        }
    };

    const onEmojiClick = (emojiObject) => {
        setInputMessage((prevInput) => prevInput + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const parseMessageWithLinks = (message) => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return message.split(urlPattern).map((part, index) => {
            if (urlPattern.test(part)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="decoration-blue-900 underline"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };
    
    // Scroll to the bottom whenever messages are updated
    useEffect(() => {
        Object.keys(openChats).forEach(friendId => {
            if (openChats[friendId]) {
                const chatContainer = chatRefs.current[friendId];
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
                }
            }
        });
    }, [messages]);

    if (isAuthLoading || isConnectionsLoading) return <p>Loading...</p>;
    if (authError || connectionsError) return <p>Error: {authError?.message || connectionsError?.message}</p>;

    // Sort connections based on latest messages
    const connectionsList = Array.isArray(connections) ? connections.sort((a, b) => {
        const aLastMessage = latestMessages[a._id] || '';
        const bLastMessage = latestMessages[b._id] || '';

        // Prioritize by checking if messages exist; use message content or a timestamp comparison if available
        if (aLastMessage && bLastMessage) {
            return bLastMessage.localeCompare(aLastMessage);
        }
        return aLastMessage ? -1 : 1; // If a has a message and b doesn't, a comes first
    }) : [];

    return (
        <div className="p-6 space-y-4 w-[450px]  mx-auto bg-white rounded-2xl shadow-lg">
            <h2 className="font-semibold text-xl text-center text-gray-800">Messages</h2>
            <div className="h-96 overflow-y-auto border border-none rounded-lg scrollbar">
                {connectionsList.length === 0 ? (
                    <p className="text-gray-500 text-center">No connections to chat with.</p>
                ) : (
                    connectionsList.map((friend) => (
                        <div key={friend._id} className="space-y-6 mb-3">
                            <div className="card bg-base-100 shadow-md">
                                <div 
                                    className="card-header flex items-center justify-between p-4 cursor-pointer "
                                    onClick={() => toggleChat(friend._id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full ">
                                            <span className="text-lg font-bold">{friend.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-medium text-gray-700">{friend.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {latestMessages[friend._id] || 'No messages yet.'}
                                            </p>
                                        </div>
                                    </div>
                                    {unreadMessages[friend._id] && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
    )}
    
                                </div>
                                {openChats[friend._id] && (
                                    <div className="card-body bg-base-100 ">
                                        <div 
                                            ref={(el) => (chatRefs.current[friend._id] = el)} // Assign ref to each chat container
                                            className="h-40 overflow-y-auto p-2 space-y-2 scrollbar"
                                            id={`chat-${friend._id}`}
                                        >
                                            {messages[friend._id]?.map((msg, index) => (
                                                <div key={index} className={`chat ${msg.sender === authUser._id ? 'chat-end' : 'chat-start'}`}>
                                                    <div className={`chat-bubble ${msg.sender === authUser._id ? 'chat-bubble-primary' : 'chat-bubble-secondary'} max-w-xs`}>
                                                    <p className="text-sm">{parseMessageWithLinks(msg.message)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center p-2 relative right-6">
                                            <input 
                                                type="text" 
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                className="input input-bordered flex-grow border-gray-300 bg-white focus:outline-none"
                                                placeholder="Type a message..."
                                            />
                                            <button 
                                                onClick={() => handleSend(friend)} 
                                                className="btn btn-primary ml-2"
                                            >
                                                Send
                                            </button>
                                            <button 
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="btn btn-secondary ml-2"
                                            >
                                                😊
                                            </button>
                                            {showEmojiPicker && (
                                                <div className="absolute z-10">
                                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MessagingPanel;
