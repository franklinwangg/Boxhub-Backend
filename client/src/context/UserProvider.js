import React, {useState, useEffect} from "react";
import UserContext from "./UserContext";

const UserProvider = ({children}) => {
    const[username, setUsername] = useState(() => {
        return localStorage.getItem("username") || "";
    });

    useEffect(() => {
        if(username) {
            localStorage.setItem("username", username);
        }
    }, [username]);

    return(
        <UserContext.Provider value = {{username, setUsername}}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;