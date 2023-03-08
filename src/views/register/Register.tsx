import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import "firebase/auth";
import { firebaseConfig } from "../../services/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Create a new user account with email and password
      await createUserWithEmailAndPassword(firebaseAuth, email, password);

      // Clear the form data
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create user account");
    }
  };

  return (
    <div className="bg-[url('./assets/bg-mobile.webp')] w-screen h-screen bg-cover">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-[url('./assets/nalle.webp')] bg-cover w-3/4 h-2/6 rounded-full mb-4 shadow-xl"></div>
        <div className=" bg-gray-600 rounded-md bg-clip-padding-sm bg-opacity-30 border border-gray-100 p-4">
          <h1 className="text-2xl text-gray-100 font-bold text-center mb-4">
            Register
          </h1>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-80 h-10 rounded-md bg-gray-50 p-2 text-gray-600"
              required
            />
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-80 h-10 rounded-md bg-gray-50 p-2"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password (min 8 characters)"
              className="w-80 h-10 rounded-md bg-gray-50 p-2"
              minLength={8}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              className="w-80 h-10 rounded-md bg-gray-50 p-2"
              minLength={8}
              required
            />
            <button
              type="submit"
              className="w-80 h-10 rounded-md bg-gray-800 text-slate-200"
            >
              Register
            </button>
          </form>
        </div>
        <a
          href="/login"
          className=" text-blue-600 dark:text-blue-500 hover:underline mt-8
          text-lg
          font-semibold

          "
        >
          Already registered? Click here to login
        </a>
      </div>
    </div>
  );
}
