import React, { useContext, useState } from "react";
import UserContext from "../../context/UserContext";
import personIcon from "./personicon.png";
import { useNavigate } from "react-router-dom";
import "./HeaderBar.css";



const HeaderBar = () => {

    const { username, setUsername } = useContext(UserContext); // Access username and setUsername from context
    const [showLogoutButton, setShowLogoutButton] = useState(false);

    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
        setShowPopup(!showPopup); // Toggle the popup visibility
    };

    const navigate = useNavigate();

    const openLogoutButton = () => {
        setShowLogoutButton(true);
    };
    const handleLPBClick = () => {
        try {
            navigate("/Login");
        } catch (error) {
            console.error("Error during navigating to CNP page :", error);
        }
    };

    const logOut = () => {
        setUsername(null);
        togglePopup();
    };

    const handleCNPPageButtonClick = async () => {
        try {
            console.log("tryna naviagte");
            navigate("/createPost");
        } catch (error) {
            console.error("Error during navigating to CNP page :", error);
        }
    };
    
    return (

        <div>
            <div>
                <div id="upper-empty-column"></div>
                <div id="upper-logo-bar">

                    <button id="plus-button" onClick = {handleCNPPageButtonClick}>+</button>



                    {username && <div id="username-text">{username}</div>}

                    <button id="go-to-login-page-button" onClick={username == null ? handleLPBClick : togglePopup}>
                        <img id="person-icon" src={personIcon} alt="User" />
                    </button>

                    {showPopup && (
                        <button id="logout-button" onClick={logOut}>Log Out</button>
                    )}

                </div>

            </div>
        </div>
    );
};

export default HeaderBar;