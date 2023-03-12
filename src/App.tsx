import React, { useState } from "react";
import "./App.css";
import About from "./views/about/About";
import Error from "./views/error/Error";
import Home from "./views/home/Home";
import Register from "./views/register/Register";
import Header from "./components/header/header";
import ContactForm from "./views/contactForm/ContactForm";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import { Route, Routes, Navigate } from "react-router-dom";
import SignInPage from "./views/signIn/SignIn";
import MyPets from "./views/myPets/MyPets";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./services/firebase";
import AddPet from "./views/myPets/addPet/AddPet";

initializeApp(firebaseConfig);

const App: React.FC = () => {
  return (
    <div className=" h-full w-full">
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/*" element={<Error />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route
          path="/myPets"
          element={
            <AuthRoute>
              <MyPets />
            </AuthRoute>
          }
        />
        <Route path="/myPets/addPet" element={<AddPet />} />
      </Routes>
    </div>
  );
};

export default App;
