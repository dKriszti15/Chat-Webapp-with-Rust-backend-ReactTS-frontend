import { useCallback, useEffect, useState } from "react";
import useSound from "use-sound";
import { userStore } from "../services/UserService";
import { decode } from "jsonwebtoken";
import config from "../config/backendConfig";
import { io, Socket } from "socket.io-client";
import '../style.css';
import { useParams } from 'react-router-dom';
import { saveMessage } from "../services/MessageService";
import { Message } from "../models/Message";

const SENT_SOUND_PATH = '/sounds/sentSound.mp3';
const RECEIVED_SOUND_PATH = '/sounds/rcvdSound.mp3';

function Conversation() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userInfo, setUserInfo] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const [toUser, setToUser] = useState<string>('');
    const { user2 } = useParams<{ user2: string }>(); 

    const [playSentSound] = useSound(SENT_SOUND_PATH);
    const [playReceivedSound] = useSound(RECEIVED_SOUND_PATH);

    useEffect(() => {
        if (user2) {
            setToUser(user2);
        }
    }, [user2]);

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
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setSocket(newSocket);
            newSocket.emit('register', loggedUser);
        });

        newSocket.on('privateChatMessage', (msg: Message) => {
            addMessageToUI(false, msg);
        });

        return () => {
            newSocket.disconnect();
            console.log('Socket disconnected');
        };
    }, [addMessageToUI, loggedUser]);

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        if (messageInput === '' || !socket) return;
    
        const msg: Message = {
            from_user: loggedUser,
            to_user: toUser,
            msg: messageInput,
            date_time: new Date().toLocaleString()
        };
    
        socket.emit('privateMessage', msg);
    
        setMessageInput('');
        addMessageToUI(true, msg);
    
        try {
            await saveMessage(msg);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    
    };
    

    return (
        <>
            <div>
                <ul className="messageContainer">
                    {messages.map((msg, index) => (
                        <li key={index} className={msg.from_user === loggedUser ? 'messageRight' : 'messageLeft'}>
                            <p className="message">
                                <span>{msg.from_user}: {msg.msg}</span>
                                <br />
                                <span> ● {msg.date_time.toLocaleString()}</span>
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
                    <button type="submit">Send Message</button>
                </form>
            </div>
        </>
    );
}

export default Conversation;
