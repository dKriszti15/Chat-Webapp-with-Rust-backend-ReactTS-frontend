import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './style.css';
import { userStore } from './services/UserService';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';
import RegisterPage from './routes/RegisterPage';
import LoginPage from './routes/LoginPage';

function App() {
  const [token, setToken] = useState<string | null>(null);

  userStore.subscribe(() => setToken(userStore.getState().token));

  useEffect(() => {
    document.title = "WEBCHAT";
  }, []);


    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

export default App;
