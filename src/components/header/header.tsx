import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function header() {
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [headerStyle, setHeaderStyle] = useState<string>(
    "fixed h-16 w-full p-2 flex items-center justify-center bg-gradient-to-r from-blue-400  to-purple-500"
  );
  const [navLoggedIn, setNavLoggedIn] = useState<boolean>(false);

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
          if (window.location.href.includes(pagePath)) {
            setIsOpen(false);
            return;
          } else {
            navigateToPage(navigate, pagePath);
          }
        }
      });
    });
  }, [isOpen, navigate]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (auth.currentUser != null || auth.currentUser != undefined)
        if (user) {
          setNavLoggedIn(true);
        } else {
          navigate("/signin");
        }
    });
  }, [auth]);

  return (
    <header className="fixed h-16 w-full p-2 flex justify-center bg-gradient-to-r from-blue-400  to-purple-500 z-20">
      <nav
        className="absolute left-4 space-y-2 z-50 md:hidden block pt-3 cursor-pointer"
        onClick={toggleNav}
      >
        <div className="w-8 h-0.5 bg-amber-100"></div>
        <div className="w-8 h-0.5 bg-amber-100"></div>
        <div className="w-8 h-0.5 bg-amber-100"></div>
      </nav>
      <div className="hidden md:flex justify-start w-1/6 h-screen absolute left-0 z-10 top-16 border-r border-stone-600">
        <aside className="fixed justify-center items-center w-48 min-h-screen rounded-r-lg">
          <ul className="flex flex-col items-start text-left pl-4 justify-start pt-12 h-screen w-full space-y-4">
            <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
              <a className="nav-option cursor-pointer " data-page-path="/home">
                Home
              </a>
            </li>
            <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
              <a className="nav-option cursor-pointer" data-page-path="/about">
                About
              </a>
            </li>
            {getAuth().currentUser ? (
              <div className="flex flex-col items-center justify-end space-y-4 h-1/4">
                <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                  <a
                    className="nav-option cursor-pointer"
                    data-page-path="/mypets"
                  >
                    My Pets
                  </a>
                </li>
                <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                  <a
                    onClick={() => handleSignOut()}
                    className="nav-option cursor-pointer"
                  >
                    Sign out
                  </a>
                </li>
              </div>
            ) : (
              <div className="flex flex-col justify-center space-y-4">
                <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                  <a
                    className="nav-option cursor-pointer"
                    data-page-path="/signin"
                  >
                    Sign in
                  </a>
                </li>
                <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                  <a
                    className="nav-option cursor-pointer"
                    data-page-path="/register"
                  >
                    Register
                  </a>
                </li>
              </div>
            )}
          </ul>
        </aside>
      </div>
      <h1 className=" text-gray-50 text-4xl italic h-full text-center">
        PetFolio
      </h1>
      {isOpen ? (
        <div>
          <nav className="absolute top-0 right-0 h-screen w-screen bg-gray-900 bg-opacity-1 z-10 uppercase text-white   focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium dark:focus:ring-[#4285F4]/55">
            <ul className="flex flex-col items-center justify-center h-full space-y-4">
              <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                <a className="nav-option" data-page-path="/home">
                  Home
                </a>
              </li>
              <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                <a className="nav-option" data-page-path="/about">
                  About
                </a>
              </li>
              {auth.currentUser?.displayName || auth.currentUser?.email ? (
                <div className="flex flex-col items-center justify-end space-y-4 h-1/4">
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <a className="nav-option" data-page-path="/mypets">
                      My Pets
                    </a>
                  </li>
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <a onClick={() => handleSignOut()} className="nav-option">
                      Sign out
                    </a>
                  </li>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <a className="nav-option" data-page-path="/signin">
                      Sign in
                    </a>
                  </li>
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
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
