import React, { useState } from "react";
import "./App.css";
import About from "./views/about/About";
import Error from "./views/error/Error";
import Home from "./views/home/Home";
import Register from "./views/register/Register";
import Header from "./components/header/header";
import ContactForm from "./views/contactForm/ContactForm";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./views/login/Login";
import Dashboard from "./views/dashboard/Dashboard";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./services/firebase";

initializeApp(firebaseConfig);
const App: React.FC = () => {
  return (
    <div className=" h-screen w-full">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/*" element={<Error />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthRoute>
              <Dashboard />
            </AuthRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
