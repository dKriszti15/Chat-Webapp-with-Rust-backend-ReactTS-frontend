import { decode } from 'jsonwebtoken';
import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { userStore } from '../services/UserService';
import config from '../config/backendConfig';
import useSound from 'use-sound';

const SENT_SOUND_PATH = '/sounds/sentSound.mp3';
const RECEIVED_SOUND_PATH = '/sounds/rcvdSound.mp3';

interface Message {
    from: string;
    to: string;
    message: string;
    dateTime: string;
}

const MyChats: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const [toUser, setToUser] = useState<string>('');
    const [userInfo, setUserInfo] = useState<string | null>(null);

    const [playSentSound] = useSound(SENT_SOUND_PATH);
    const [playReceivedSound] = useSound(RECEIVED_SOUND_PATH);

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
            playSentSound()
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

        newSocket.on('privateChatMessage', (msg: Message) => {
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
            from: loggedUser,
            to: toUser === 'everyone' ? '' : toUser,
            message: messageInput,
            dateTime: new Date().toLocaleString(),
        };

        if (msg.to === '') {
            socket.emit('message', msg);
        } else {
            socket.emit('privateMessage', msg);
        }

        setMessageInput('');
        addMessageToUI(true, msg);

        console.log(msg);
    };

    return (
        <div>
            <ul id="messageContainer">
                {messages.map((msg, index) => (
                    <li key={index} className={msg.from === loggedUser ? 'messageRight' : 'messageLeft'}>
                        <p className="message">
                            <span>{msg.from}: {msg.message}</span>
                            <br />
                            <span> ● {msg.dateTime}</span>
                        </p>
                    </li>
                ))}
            </ul>

            <form id="messageSendingForm" onSubmit={sendMessage}>
                <input
                    type="text"
                    id="messageInput"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <input
                    type="text"
                    id="toUser"
                    value={toUser}
                    onChange={(e) => setToUser(e.target.value)}
                />
                <button type="submit">Send Message</button>
            </form>
        </div>
    );
};

export default MyChats;
