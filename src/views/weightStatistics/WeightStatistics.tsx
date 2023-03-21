import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../services/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  StorageReference,
  deleteObject,
} from "firebase/storage";
import Popup from "../../components/Popup/Popup";
import WeightGraph from "../../components/weightGraph/weightGraph";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function WeightStatistics() {
  const navigate = useNavigate();
  const name = useParams().petName;
  const [weightData, setWeightData] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
      }
    });
    const fetchWeightData = async () => {
      const petName = name;
      // Get the logged-in user's UID
      const userId = auth.currentUser?.uid;
      if (userId !== null && userId !== undefined) {
        console.log("User ID found, fetching weight data...");

        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const pets = userDocSnap.data().pets || [];
          const pet = pets.find((pet: { name: string }) => pet.name === name);

          if (pet && pet.weightData) {
            setWeightData(pet.weightData);
          } else {
            setWeightData([]);
          }
        } else {
          console.error("User's document does not exist");
        }
      } else {
        console.error("Name is undefined");
      }
    };

    fetchWeightData();
  }, [name]);

  const handleDataInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const date = e.currentTarget.date.value;
    let weight = e.currentTarget.weight.value;
    weight = weight.replace(",", ".");

    if (typeof name === "string") {
      // Get the logged-in user's UID
      const userId = auth.currentUser?.uid;
      if (userId !== null && userId !== undefined) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Retrieve the pets array from the user's document
          const pets = userDocSnap.data().pets || [];

          // Check if a pet with the specified petName exists in the pets array
          const petIndex = pets.findIndex(
            (pet: { name: string }) => pet.name === name
          );

          if (petIndex === -1) {
            // If the pet does not exist, create an object with the pet name, an empty weightData array, and the initial weight
            const newPet = {
              name,
              weightData: [{ date, weight: parseFloat(weight) }],
              weight: parseFloat(weight),
            };

            // Add the new pet to the pets array
            pets.push(newPet);
          } else {
            // Ensure the pet's weightData array is defined
            pets[petIndex].weightData = pets[petIndex].weightData || [];

            // If the pet exists, add the new entry to the pet's weightData array
            pets[petIndex].weightData.push({
              date,
              weight: parseFloat(weight),
            });

            // Update the pet's weight field with the latest entry's weight value
            pets[petIndex].weight = parseFloat(weight);
          }

          // Update the user's document with the modified pets array
          await updateDoc(userDocRef, { pets });
        } else {
          // Handle the case where the user's document does not exist
          console.error("User's document does not exist");
        }
      } else {
        // Handle the case where 'name' is undefined
        console.error("Name is undefined");
      }
    }
  };
  return (
    <div className="w-full pt-20 bg-gradient-to-b from-slate-900 to-slate-700 sm:flex sm:justify-center">
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:w-3/4 ">
        <h1 className="text-2xl text-white mb-4">
          Weight Statistics for {name}
        </h1>
        <div className="flex border my-4 p-4 rounded w-full sm:w-2/4">
          <form
            action="addData"
            className="flex flex-col space-y-11 w-full"
            onSubmit={handleDataInput}
          >
            <h2 className="text-2xl text-white text-center">Add new Data</h2>
            <section className="flex justify-between">
              <label htmlFor="date" className=" text-slate-200 text-xl w-full">
                Date:
              </label>
              <input
                type="date"
                name="date"
                className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
              />
            </section>
            <section className="flex justify-between">
              <label
                htmlFor="weight"
                className=" text-slate-200 text-xl w-full"
              >
                Weight (kgs):
              </label>
              <input
                type="number"
                name="weight"
                className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
              />
            </section>

            <button
              type="submit"
              className="text-2xl text-white bg-blue-500 px-4 py-2 rounded"
            >
              Add Data
            </button>
          </form>
        </div>
        <WeightGraph data={weightData} />
      </div>
    </div>
  );
}
