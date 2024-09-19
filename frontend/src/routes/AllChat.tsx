import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { userStore } from '../services/UserService';
import config from '../config/backendConfig';
import useSound from 'use-sound';
import { Message } from '../models/Message';
import { loadMessages_all, saveMessage } from '../services/MessageService';
import { decode } from 'jsonwebtoken';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';

const SENT_SOUND_PATH = '/sounds/sentSound.mp3';
const RECEIVED_SOUND_PATH = '/sounds/rcvdSound.mp3';

const AllChat: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const [userInfo, setUserInfo] = useState<string | null>(null);

    const [playSentSound] = useSound(SENT_SOUND_PATH);
    const [playReceivedSound] = useSound(RECEIVED_SOUND_PATH);

    const messageContainerRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => {
            setUserInfo(userStore.getState().token);
        });
        setUserInfo(userStore.getState().token);
        return () => unsubscribe();
    }, []);

    function getPrintableUsername(token: string): string {
        const user = decode(token) as {
            admin: boolean;
            username: string;
        };

        if (user == null) {
            return 'guest';
        }

        return user.username;
    }

    const scrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        loadMessages_all()
            .then((loadedMessages) => {
                setMessages(loadedMessages.filter(message => message.to_user === 'all'));
            })
            .catch((error) => {
                console.error("Error loading messages:", error);
            });
    }, []);

    useLayoutEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const loggedUser = userInfo ? getPrintableUsername(userInfo) : 'guest';

    const addMessageToUI = useCallback((ownMessage: boolean, msg: Message) => {
        setMessages((prevMessages) => [...prevMessages, msg]);

        if (ownMessage) {
            playSentSound();
        } else {
            playReceivedSound();
        }
    }, [playSentSound, playReceivedSound]);

    useEffect(() => {
        const newSocket = io(config.websocketserverAddress);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setSocket(newSocket);
            newSocket.emit('register', loggedUser);
        });

        newSocket.on('clients-total', (data: number) => {
            console.log(`Received clients-total: ${data}`);
        });

        newSocket.on('chatMessage', (msg: Message) => {
            addMessageToUI(false, msg);
        });

        return () => {
            newSocket.disconnect();
            console.log('Socket disconnected');
        };
    }, [addMessageToUI, loggedUser]);

    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (messageInput === '' || !socket) return;

        const msg: Message = {
            from_user: loggedUser,
            to_user: 'all',
            msg: messageInput,
            date_time: new Date().toLocaleString(),
        };

        socket.emit('message', msg);

        setMessageInput('');
        addMessageToUI(true, msg);

        saveMessage(msg)
            .then(() => {
                console.log("Message saved successfully");
            })
            .catch((error) => {
                console.error("Error saving message:", error);
            });

        console.log(msg);
    };

    return (
        <>
            <h2>All Chat</h2>
            
            <div>
                <ul className="messageContainer" ref={messageContainerRef}>
                    {messages.map((msg, index) => (
                        <li key={index} className={msg.from_user === loggedUser ? 'messageRight' : 'messageLeft'}>
                            <p className="message">
                                <span>{msg.from_user}: {msg.msg}</span>
                                <br />
                                <span> ● {msg.date_time}</span>
                            </p>
                        </li>
                    ))}
                </ul>

                <form className="messageSendingForm" onSubmit={sendMessage}>
                    <input
                        type="text"
                        id="messageInput"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <Button type="submit">
                        <FontAwesomeIcon id="addUserIcon" icon={faArrowRightLong} />
                    </Button>
                </form>
            </div>
        </>
    );
};

export default AllChat;
