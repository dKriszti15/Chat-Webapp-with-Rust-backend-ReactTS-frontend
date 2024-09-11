import { useEffect, useState } from "react";
import config from "../config/backendConfig";
import { io } from "socket.io-client";
import { userStore } from "../services/UserService";
import { decode } from "jsonwebtoken";
import './Lobby.css'
import { Link } from "react-router-dom";

function Lobby() {
    const [userInfo, setUserInfo] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]); 

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

    useEffect(() => {
        const newSocket = io(config.websocketserverAddress);
    
        newSocket.emit('register', loggedUser);

        newSocket.emit('connected-clients', loggedUser);
    
        newSocket.on('connected-clients', (activeUsers: string[]) => {
            setActiveUsers(activeUsers); 
            console.log(`clients connected: ${activeUsers}`);
        });

    }, [loggedUser]);

    return (
        <>
            <ul>
                <li className="userListItem"><Link to={`/all-chat/${loggedUser}`}>All Chat</Link></li>
                {activeUsers && activeUsers.map((user, index) => (
                    <li className="userListItem" key={index}>{user}</li>
                ))}
            </ul>
        </>
    );
}

export default Lobby;
