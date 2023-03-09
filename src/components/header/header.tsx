import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function header() {
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [headerStyle, setHeaderStyle] = useState<string>(
    "fixed h-16 w-full p-2 flex items-center justify-center bg-gradient-to-r from-blue-400  to-purple-500"
  );

  const toggleNav = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  function handleSignOut() {
    const user = auth.currentUser;
    if (user) {
      auth
        .signOut()
        .then(() => {
          console.log("User signed out successfully");
          setIsOpen(false);
          navigate("/signin");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } else {
      console.log("No user is currently signed in");
    }
  }

  function navigateToPage(navigate: any, pagePath: string) {
    navigate(pagePath);
    scrollTo(0, 0);
    setIsOpen(false);
  }

  const navigate = useNavigate();

  useEffect(() => {
    const navOptions = document.querySelectorAll(".nav-option");
    navOptions.forEach((navOption) => {
      navOption.addEventListener("click", () => {
        const pagePath = (navOption as HTMLAnchorElement).dataset.pagePath;
        if (pagePath) {
          navigateToPage(navigate, pagePath);
        }
      });
    });
  }, [isOpen, navigate]);

  useEffect(() => {
    if (
      window.location.href.includes("register") ||
      window.location.href.includes("signin")
    ) {
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
          <nav className="absolute top-12 right-0 h-screen w-screen bg-gray-900 bg-opacity-1 z-10 uppercase text-white mt-4  focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg dark:focus:ring-[#4285F4]/55">
            <ul className="flex flex-col items-center justify-center h-full space-y-4">
              <li className="text-2xl text-gray-50 underline">
                <a className="nav-option" data-page-path="/">
                  Home
                </a>
              </li>
              <li className="text-2xl text-gray-50 underline">
                <a className="nav-option" data-page-path="/about">
                  About
                </a>
              </li>
              {auth.currentUser?.displayName || auth.currentUser?.email ? (
                <div className="flex flex-col items-center justify-end space-y-4 h-1/4">
                  <li className="text-2xl text-gray-50 underline">
                    <a className="nav-option" data-page-path="/mypets">
                      My Pets
                    </a>
                  </li>
                  <li className="text-2xl text-gray-50 underline">
                    <a onClick={() => handleSignOut()} className="nav-option">
                      Sign out
                    </a>
                  </li>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <li className="text-2xl text-gray-50 underline">
                    <a className="nav-option" data-page-path="/signin">
                      Sign in
                    </a>
                  </li>
                  <li className="text-2xl text-gray-50 underline">
                    <a className="nav-option" data-page-path="/register">
                      Register
                    </a>
                  </li>
                </div>
              )}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
