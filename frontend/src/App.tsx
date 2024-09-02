import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { userStore } from './services/UserService';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';

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
           
        </Routes>
      </BrowserRouter>
    );
  }

export default App;
