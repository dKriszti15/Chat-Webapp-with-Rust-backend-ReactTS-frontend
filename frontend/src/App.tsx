import React, { useEffect, useState } from 'react';
import './style.css';
import { userStore } from './services/UserService';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';
import RegisterPage from './routes/RegisterPage';
import LoginPage from './routes/LoginPage';
import Navibar from './routes/Navibar';
import AllChat from './routes/AllChat';
import Lobby from './routes/Lobby';
import Conversation from './routes/Conversation';

function App() {
  const [, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setToken(userStore.getState().token);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.title = "WEBCHAT";
  }, []);

  return (
    <BrowserRouter>
      <Navibar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lobby/:username" element={<Lobby />} />
        <Route path='/all-chat/:username' element={<AllChat />} />
        <Route path='/:user1-chats-with-:user2' element={<Conversation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
