import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config/backendConfig";
import { io, Socket } from "socket.io-client";
import { userStore } from "../services/UserService";
import { decode } from "jsonwebtoken";
import './Lobby.css';
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Lobby() {
    const [userInfo, setUserInfo] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]); 
    const [isTokenChecked, setIsTokenChecked] = useState(false);
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => {
            setUserInfo(userStore.getState().token);
        });
        setUserInfo(userStore.getState().token);
        setIsTokenChecked(true);
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
        if (isTokenChecked && loggedUser === 'guest') {
            navigate('/login');
        }
    }, [loggedUser, navigate, isTokenChecked]);

    useEffect(() => {
        if (loggedUser !== 'guest' && !socketRef.current) {
            socketRef.current = io(config.websocketserverAddress);

            socketRef.current.emit('register', loggedUser);
            socketRef.current.emit('connected-clients', loggedUser);

            socketRef.current.on('error', ( errorMessage: string ) => {
                alert(errorMessage);
            })
        
            socketRef.current.on('connected-clients', (activeUsers: string[]) => {
                setActiveUsers(activeUsers); 
                console.log(`clients connected: ${activeUsers}`);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [loggedUser]);

    function refreshConnectedUsers() {
        if (socketRef.current && loggedUser !== 'guest') {
            socketRef.current.emit('connected-clients', loggedUser);
        }
    }

    return (
        <div className="parentContainer">
            {isTokenChecked && loggedUser !== 'guest' && (
                <div>
                    <Button onClick={refreshConnectedUsers}>
                        <FontAwesomeIcon id="addUserIcon" icon={faRefresh} />
                    </Button>
                    <ul className="userListContainer">
                        <Link to={`/all-chat/${loggedUser}`}><li className="userListItem">All Chat</li></Link>
                        {activeUsers && activeUsers.map((user, index) => (
                            <Link to={`/${loggedUser}/chats-with/${user}`} key={index}>
                                <li className="userListItem">{user}</li>
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Lobby;
