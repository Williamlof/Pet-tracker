import React, { useState } from "react";
import { firebaseConfig } from "../../services/firebase";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "@firebase/firestore";
import { deleteObject, getStorage, ref, uploadString } from "firebase/storage";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);

interface SignInFormState {
  email: string;
  password: string;
}

export interface ISignInPageProps {}

const SignInPage: React.FunctionComponent<ISignInPageProps> = (props) => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [authing, setAuthing] = useState<boolean>(false);
  const [formData, setFormData] = useState<SignInFormState>({
    email: "",
    password: "",
  });

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

  const signInWithGoogle = async () => {
    setAuthing(true);
    try {
      await setPersistence(auth, browserSessionPersistence)
        .then(() => {
          return signInWithPopup(auth, new GoogleAuthProvider());
        })
        .then(async (result) => {
          const user = result.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
          } else {
            await setDoc(doc(db, "users", user.uid), {
              id: user.uid,
              displayName: user.displayName,
              email: user.email,
              pets: [],
            });
          }
          await createUserFolder(user.uid);
          navigate("/mypets");
        });
    } catch (error) {
      console.log(error);
    } finally {
      setAuthing(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password } = formData;

    try {
      // Sign in the user with email and password
      await setPersistence(auth, browserSessionPersistence).then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      });

      // Clear the form data
      setFormData({
        email: "",
        password: "",
      });

      navigate("/mypets");
    } catch (error) {
      console.error(error);
      alert("Failed to sign in");
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
            <h1 className="text-2xl text-gray-100 font-bold text-center mb-4 sm:content-none">
              Sign In
            </h1>
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col items-center justify-center space-y-4 "
            >
              <input
                className="w-80 h-10 rounded-md bg-gray-50 p-2 text-gray-600"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                className="w-80 h-10 rounded-md bg-gray-50 p-2 text-gray-600"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <br />
              <button
                type="submit"
                className="w-48 h-10 rounded-md bg-gray-800 text-slate-200"
              >
                Sign In
              </button>
            </form>
            <button
              onClick={signInWithGoogle}
              className=" text-white mt-4 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mb-2 w-48"
              disabled={authing}
              title="Sign in with Google"
            >
              <svg
                className="w-4 h-4 mr-2 -ml-1"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </button>
            <a
              href="/signin"
              className=" text-blue-600 dark:text-blue-500 hover:underline mt-4 text-lg font-semibold"
            >
              New user? Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
