import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import "firebase/auth";
import { firebaseConfig } from "../../services/firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getFirestore,
  setDoc,
} from "@firebase/firestore";
import { getStorage, ref, uploadString, deleteObject } from "firebase/storage";

// Get a reference to the Firebase Storage service
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

interface RegisterFormState {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormState>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const createUserFolder = async (uid: string) => {
    // Get a reference to the user's storage folder
    const storageRef = getStorage();
    const userFolderRef = ref(storageRef, `users/${uid}/`);

    try {
      // Set a dummy file to create the user's storage folder
      await uploadString(ref(userFolderRef, "dummy"), "dummy content");
      console.log(`User storage folder created for user with uid: ${uid}`);
    } catch (error) {
      console.error(`Error creating user storage folder: ${error}`);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { displayName, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Create a new user account with email and password
      await setPersistence(auth, browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          // Signed in
          const user = userCredential.user;
          // ...
          console.log(user);
        }
      );

      await setDoc(doc(db, "users", auth.currentUser!.uid), {
        displayName: displayName,
        email: email,
        pets: [],
      });
      await createUserFolder(auth.currentUser!.uid);
      navigate("/mypets");
      // Clear the form data
      setFormData({
        displayName: "",
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
    <div className="bg-gradient-to-b from-slate-900  to-slate-700 w-screen h-screen bg-cover sm:flex sm:items-center sm:justify-center">
      <div className="flex flex-col items-center justify-center h-full sm:flex-row sm:h-3/5 sm:rounded-lg sm:flex-1 sm:max-w-screen-lg">
        <div className=" sm:border-b-slate-700 sm:h-full sm:min-h-full sm:flex sm:justify-center sm:p-8 sm:bg-slate-600 sm:flex-col sm:w-3/4 sm:rounded-bl-lg sm:rounded-tl-md shadow-2xl">
          <h1 className=" hidden sm:flex text-4xl w-3/4  text-slate-100 font-bold leading-11 mb-2">
            Store your pets information the easy way with
          </h1>
          <h2 className="hidden sm:flex text-5xl w-3/4  font-bold leading-11 italic underline underline-offset-8 text-purple-300 ">
            PetFolio
          </h2>
          <div className="bg-[url('./assets/nalle.webp')] bg-cover w-48 h-48 rounded-full my-8 shadow-xl sm:w-72 sm:h-72 sm:mt-0 sm:my-0 self-center"></div>
        </div>

        <div className="sm:h-full sm:flex sm:items-center sm:justify-center sm:bg-slate-700 sm:w-2/5 sm:rounded-br-lg sm:rounded-tr-md shadow-2xl">
          <div className=" bg-gray-600 rounded-md bg-clip-padding-sm bg-opacity-30 border border-gray-100 p-2 sm:p-4 sm:m-8 flex justify-center flex-col items-center">
            <h1 className="text-2xl text-gray-100 font-bold text-center mb-4">
              Register
            </h1>
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Display name"
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
                className="w-80 h-10 mb-8 rounded-md bg-gray-800 text-slate-200"
              >
                Register
              </button>
            </form>
            <a
              href="/signin"
              className=" text-blue-600 dark:text-blue-500 hover:underline mt-4 text-lg font-semibold"
            >
              Already registered? Click here to signin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
