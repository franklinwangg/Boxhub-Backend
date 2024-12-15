import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/UserContext';
import "./Login.css";

function Login() {

    const [enteredUsername, setEnteredUsername] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const { username, setUsername } = useContext(UserContext); // Access username and setUsername from context

    const navigate = useNavigate();

    const handleButtonClick = async () => {

        try {

            console.log("enteredPassword", enteredPassword);
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username : enteredUsername,
                    password : enteredPassword,
                })
            });

            console.log("printed");
            const responseJSON = await response.json();

            if (responseJSON.success === true) {

                console.log("enteredUsername is ", enteredUsername);
                setUsername(enteredUsername);

                console.log("username is now ", username);
                navigate("/");
            } else {
                console.log("login failed");
            }

            // const response = await fetch("http://localhost:5000/api/users/", {
            //     method: "GET",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
                    
            //     })
            // });

            // const responseJSON = await response.json();

            // if (responseJSON.success === true) {

            //     console.log("enteredUsername is ", enteredUsername);
            //     setUsername(enteredUsername);

            //     console.log("username is now ", username);
            //     navigate("/homepage");
            // } else {
            //     console.log("login failed");
            // }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };


    const changeEnteredUsername = (event) => {
        setEnteredUsername(event.target.value);
    };
    const changeEnteredPassword = (event) => {
        setEnteredPassword(event.target.value);
    };

    return (
        <div id = "login-container">
            <input type="text" id="username" value={enteredUsername} placeholder="Username" onChange={changeEnteredUsername}></input>
            <input type="text" id="password" value={enteredPassword} placeholder="Password" onChange={changeEnteredPassword}></input>
            <button id="login-button" onClick={handleButtonClick}>Login</button>
            <div></div>
            <Link to="/register">Register here</Link>
        </div>
    );
}

export default Login;