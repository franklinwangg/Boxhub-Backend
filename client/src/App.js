
import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/UserAuthentification/Login/Login'; // Adjust path as necessary
import Register from './components/UserAuthentification/Register/Register'; // Adjust path as necessary
import Homepage from './components/Pages/Homepage/Homepage';
import CreatePost from './components/Pages/CreatePost/CreatePost';
import Post from './components/Posts/Post/Post';
import HeaderBar from './components/Others/HeaderBar';

// import {UserProvider } from './context/UserContext';
import UserProvider from './context/UserProvider';

const LayoutWithHeader = ({ children }) => (
  <>
    <HeaderBar /> {/* This will render above the specific routes */}
    {children}
  </>
);

function App() {

  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}

          <Route path="/register" element={<Register />} />
          {/* <Route path="/homepage" element={<Homepage />} /> */}
          <Route path="/login" element={<Login />} />

          <Route path="/createPost" element={<CreatePost />} />

          {/* Routes with HeaderBar */}
          <Route
            path="/"
            element={
              <LayoutWithHeader>
                <Homepage />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/post/:id"
            element={
              <LayoutWithHeader>
                <Post />
              </LayoutWithHeader>
            }
          />

        </Routes>
      </UserProvider>
    </Router>



  );
}

export default App;
