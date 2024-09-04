import { decode } from "jsonwebtoken";
import { useEffect, useState } from "react";
import { userStore } from "../services/UserService";

function HomePage(){
    const [userInfo, setUserInfo] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = userStore.subscribe(() => {
          setUserInfo(userStore.getState().token);
        });
        setUserInfo(userStore.getState().token);
        return () => unsubscribe();
    }, []);

    function getPrintableUsername(token: string) {
        let user = decode(token) as {
          admin: boolean;
          username: string;
        };
    
        if (user == null) {
          return <span> guest</span>;
        }
    
        if (user.admin) {
          return <span className="admin-name"> {user.username}</span>;
        }
    
        return <span className="user-name"> {user.username}</span>;
      }

    return(
        <>
        {userInfo ? (
            <div>
                hi, {getPrintableUsername(userInfo)}!
            </div>
        ) : (
            <div>hi, guest!</div>
        )}
        </>
    )
}

export default HomePage;
