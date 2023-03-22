import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faNavicon } from "@fortawesome/free-solid-svg-icons";

export default function header() {
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showList, setShowList] = useState<boolean>(false);
  const [navLoggedIn, setNavLoggedIn] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);
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
          setNavLoggedIn(false);
          setShowList(false);
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } else {
      console.log("No user is currently signed in");
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    };

    if (showList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showList]);

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

      <h1 className=" text-gray-50 text-5xl italic h-full text-center">
        PetFolio
      </h1>
      {navLoggedIn ? (
        <div className="sm:flex justify-evenly items-center w-2/4 hidden text-slate-200 text-2xl">
          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/home"
          >
            Home
          </Link>
          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/About"
          >
            About
          </Link>
          <FontAwesomeIcon
            icon={faUser}
            className="absolute right-12 top-5 text-2xl hidden sm:flex cursor-pointer text-slate-800"
            onClick={() => setShowList(!showList)}
          />
        </div>
      ) : (
        <div className="sm:flex justify-evenly items-center w-3/4 hidden text-slate-200 text-2xl">
          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/home"
          >
            Home
          </Link>
          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/About"
          >
            About
          </Link>

          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/Register"
          >
            Register
          </Link>
          <Link
            className="text-2xl text-gray-50 transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-900"
            to="/signin"
          >
            Sign In
          </Link>
        </div>
      )}

      {showList && (
        <ul
          ref={listRef}
          className="absolute right-12 top-12 bg-white text-slate-800 border border-slate-300 rounded shadow-md "
        >
          <li className="cursor-pointer hover:bg-blue-300 p-4">
            <Link to="/mypets">My Pets</Link>
          </li>
          <li
            className="cursor-pointer hover:bg-blue-300 p-4"
            onClick={handleSignOut}
          >
            <Link to="/signin">Sign Out</Link>
          </li>
        </ul>
      )}

      {isOpen ? (
        <div>
          <nav className="absolute top-0 right-0 h-screen w-screen bg-gray-900 bg-opacity-1 z-10 uppercase text-white   focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium dark:focus:ring-[#4285F4]/55">
            <ul className="flex flex-col items-center justify-center h-full space-y-4">
              <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                <Link to="/home" onClick={toggleNav}>
                  Home
                </Link>
              </li>
              <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                <Link to="/about" onClick={toggleNav}>
                  About
                </Link>
              </li>
              {auth.currentUser?.displayName || auth.currentUser?.email ? (
                <div className="flex flex-col items-center justify-end space-y-4 h-1/4">
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <Link to="/mypets" onClick={toggleNav}>
                      My pets
                    </Link>
                  </li>
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <Link to="/signin" onClick={handleSignOut}>
                      Sign Out
                    </Link>
                  </li>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <Link to="/signin" onClick={toggleNav}>
                      Sign in
                    </Link>
                  </li>
                  <li className="text-2xl text-gray-50 underline transition-all hover:scale-125 hover:translate-x-3 hover:text-blue-400">
                    <Link to="/register" onClick={toggleNav}>
                      Register
                    </Link>
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
