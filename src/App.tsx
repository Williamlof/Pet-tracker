import React, { useState } from "react";
import "./App.css";
import About from "./views/about/About";
import Error from "./views/error/Error";
import Home from "./views/home/Home";
import Register from "./views/register/Register";
import Header from "./components/header/header";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import { Route, Routes, Navigate } from "react-router-dom";
import SignInPage from "./views/signIn/SignIn";
import MyPets from "./views/myPets/MyPets";
import "./index.css";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./services/firebase";
import AddPet from "./views/myPets/addPet/AddPet";
import PetDetails from "./views/PetDetails/PetDetails";
import Statistics from "./views/Statistics/Statistics";

initializeApp(firebaseConfig);

const App: React.FC = () => {
  return (
    <div className=" h-full w-full bg-gradient-to-b from-slate-900 to-slate-700 ">
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/*" element={<Error />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route
          path="/mypets"
          element={
            <AuthRoute>
              <MyPets />
            </AuthRoute>
          }
        />

        <Route path="/mypets/addPet" element={<AddPet />} />

        <Route path="/mypets/:petName" element={<PetDetails />} />
        <Route path="/mypets/:petName/Statistics" element={<Statistics />} />
      </Routes>
    </div>
  );
};

export default App;
