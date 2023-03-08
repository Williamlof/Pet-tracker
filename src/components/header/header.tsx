import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [headerStyle, setHeaderStyle] = useState<string>(
    "fixed h-16 w-full p-2 flex items-center justify-center bg-gradient-to-r from-blue-400  to-purple-500"
  );
  const navigate = useNavigate();

  const toggleNav = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (window.location.href.includes("register")) {
      setHeaderStyle(
        "fixed h-16 w-full p-2 flex items-center justify-center bg-opacity-0"
      );
    } else {
      setHeaderStyle(
        "fixed h-16 w-full p-2 flex items-center justify-center bg-gradient-to-r from-blue-400  to-purple-500"
      );
    }
  }, [window.location.href]);

  return (
    <header className={headerStyle}>
      <nav className="absolute left-4 space-y-2" onClick={toggleNav}>
        <div className="w-8 h-0.5 bg-gray-600"></div>
        <div className="w-8 h-0.5 bg-gray-600"></div>
        <div className="w-8 h-0.5 bg-gray-600"></div>
      </nav>
      <h1 className=" text-gray-50 text-4xl italic">PetFolio</h1>
      {isOpen ? (
        <div>
          <nav className="absolute top-16 right-0 h-screen w-screen bg-gray-900 bg-opacity-1 z-10">
            <ul className="flex flex-col items-center justify-center h-full space-y-4">
              <li className="text-2xl text-gray-50 underline">
                <a href="/">Home</a>
              </li>
              <li className="text-2xl text-gray-50 underline">
                <a href="about">About</a>
              </li>
              <li className="text-2xl text-gray-50 underline">
                <a href="contact">Contact</a>
              </li>
              <div className="flex flex-col items-center justify-center space-y-4">
                <li className="text-2xl text-gray-50 underline">
                  <a href="login">Log in</a>
                </li>
                <li className="text-2xl text-gray-50 underline">
                  <a href="register">Register</a>
                </li>
              </div>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
