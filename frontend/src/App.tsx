import React, { useEffect, useState } from 'react';
import './style.css';
import { userStore } from './services/UserService';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';
import RegisterPage from './routes/RegisterPage';
import LoginPage from './routes/LoginPage';
import Navibar from './routes/Navibar';

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
      <Navibar /> {/* Keep Navibar outside of Routes so it is always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Make sure "/" points to HomePage */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
