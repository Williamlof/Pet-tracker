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
import CostAnalysisGraph from "../../components/costAnalysisGraph/CostAnalysisGraph";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
import { active } from "d3";

type CostData = {
  [key: string]: number;
  food: number;
  veterinary: number;
  insurance: number;
  other: number;
};

type MonthData = {
  month: string;
  totalSpent: number;
  costs: CostData;
};

type WeightData = {
  date: string;
  weight: number;
};

export default function Statistics() {
  const navigate = useNavigate();
  const name = useParams().petName;
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [costData, setCostData] = useState<MonthData[]>([]);
  const [popupContent, setPopupContent] = useState<React.ReactNode>(<></>);
  const [showPopup, setShowPopup] = useState(false);
  const [background, setBackground] = useState<string>("bg-slate-100");
  const [fetchDataTrigger, setFetchDataTrigger] = useState(false);
  const [activeComponent, setActiveComponent] = useState("Weight");
  const triggerPopup = () => {
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
  };
  const handleDataInputCosts = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPopupContent(<p className="self-center text-4xl">Adding new data...</p>);
    triggerPopup();
    const month = e.currentTarget.month.value;
    const food = parseFloat(e.currentTarget.food.value);
    const veterinary = parseFloat(e.currentTarget.veterinary.value);
    const insurance = parseFloat(e.currentTarget.insurance.value);
    const other = parseFloat(e.currentTarget.other.value);

    const userId = auth.currentUser?.uid;
    if (userId !== null && userId !== undefined) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const pets = userDocSnap.data().pets || [];

        // Find the pet with the specified pet name in the user's pets array
        const petIndex = pets.findIndex(
          (pet: { name: string }) => pet.name === name
        );

        if (petIndex !== -1) {
          const pet = pets[petIndex];

          // Create a new cost entry object
          const totalSpent = food + veterinary + insurance + other;
          const newCostEntry = {
            month,
            totalSpent,
            costs: { food, veterinary, insurance, other },
          };

          // Check if the pet object has a costData property, and if not, create one with an empty array
          pet.costData = pet.costData || [];

          // Push the new cost entry object into the costData array inside the pet object
          pet.costData.push(newCostEntry);

          // Update the user's document with the modified pets array
          await updateDoc(userDocRef, { pets });
          setPopupContent(
            <p className="self-center text-4xl">Data added successfully!</p>
          );
        } else {
          setPopupContent(
            <p className="self-center text-4xl">
              Pet not found, please try again
            </p>
          );
        }

        setTimeout(() => {
          closePopup();
          setFetchDataTrigger(true);
        }, 1000);
      } else {
        setPopupContent(
          <p className="self-center text-4xl">
            Something went wrong, please try again
          </p>
        );
      }
    } else {
      setPopupContent(
        <p className="self-center text-4xl">
          Something went wrong, please try again
        </p>
      );
    }
  };

  const handleDataInputWeight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPopupContent(<p className="self-center text-4xl">Adding new data...</p>);
    triggerPopup();
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
          setPopupContent(
            <p className="self-center text-4xl">Data added successfully!</p>
          );
          setTimeout(() => {
            closePopup();
            setFetchDataTrigger(true);
          }, 1000);
        } else {
          // Handle the case where the user's document does not exist
          setPopupContent(
            <p className="self-center text-4xl">
              Something went wrong, please try again
            </p>
          );
        }
      } else {
        // Handle the case where 'name' is undefined
        setPopupContent(
          <p className="self-center text-4xl">
            Something went wrong, please try again
          </p>
        );
      }
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
      }
    });
    const fetchWeightData = async () => {
      const petName = name;

      const userId = auth.currentUser?.uid;

      if (userId !== null && userId !== undefined) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const pets = (await userDocSnap.data().pets) || [];
          const pet = await pets.find(
            (pet: { name: string }) => pet.name === petName
          );

          if (pet && pet.weightData) {
            setWeightData(pet.weightData);
          }
        }
      }
    };
    setTimeout(() => {
      triggerPopup();
      setPopupContent(<p className="self-center text-4xl">Loading graph...</p>);
      fetchWeightData();
      setTimeout(() => {
        closePopup();
      }, 1250);
    }, 1000);

    if (fetchDataTrigger) {
      // Reset the fetchDataTrigger state to false after fetching the data
      setFetchDataTrigger(false);
    }
  }, [auth, name, fetchDataTrigger]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
      }
    });

    const fetchCostData = async () => {
      const petName = name;

      const userId = auth.currentUser?.uid;

      if (userId !== null && userId !== undefined) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const pets = (await userDocSnap.data().pets) || [];
          const pet = await pets.find(
            (pet: { name: string }) => pet.name === petName
          );

          if (pet && pet.costData) {
            setCostData(pet.costData);
          }
        }
      }
    };

    setTimeout(() => {
      triggerPopup();
      setPopupContent(<p className="self-center text-4xl">Loading graph...</p>);
      fetchCostData();
      setTimeout(() => {
        closePopup();
      }, 1250);
    }, 1000);

    if (fetchDataTrigger) {
      // Reset the fetchDataTrigger state to false after fetching the data
      setFetchDataTrigger(false);
    }
  }, [auth, fetchDataTrigger]);

  return (
    <div className="w-full pt-20 bg-gradient-to-b from-slate-900 to-slate-700 sm:flex sm:justify-center min-h-full">
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:w-3/4 ">
        <select
          className="bg-slate-100 text-slate-900 rounded p-2 mb-4"
          onChange={(e) => {
            setActiveComponent(e.target.value); // Update the active component
          }}
        >
          <option
            className="bg-slate-100 text-slate-900 rounded p-2 mb-4"
            value="Weight"
          >
            Weight
          </option>
          <option
            className="bg-slate-100 text-slate-900 rounded p-2 mb-4"
            value="Cost"
          >
            Costs
          </option>
        </select>

        <h1 className="text-2xl text-white mb-4">
          {activeComponent} Statistics for {name}
        </h1>
        {activeComponent === "Weight" ? (
          <WeightGraph data={weightData} setData={setWeightData} />
        ) : (
          <>
            {activeComponent === "Cost" && costData.length > 0 ? (
              <CostAnalysisGraph data={costData} setData={setCostData} />
            ) : (
              <section className="h-32 w-full text-center pt-12">
                <p className="text-white">No data to display</p>
              </section>
            )}
          </>
        )}
        {activeComponent === "Weight" ? (
          <div className="flex border my-4 p-4 rounded w-full sm:w-2/4">
            <form
              action="addData"
              className="flex flex-col space-y-11 w-full"
              onSubmit={handleDataInputWeight}
            >
              <h2 className="text-2xl text-white text-center">
                Add Weight Data
              </h2>
              <section className="flex justify-between">
                <label
                  htmlFor="date"
                  className=" text-slate-200 text-xl w-full"
                >
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
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
                  step="0.5"
                  required
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
        ) : (
          <div className="flex border my-4 p-4 rounded w-full sm:w-2/4">
            <form
              action="addData"
              className="flex flex-col space-y-11 w-full"
              onSubmit={handleDataInputCosts}
            >
              <h2 className="text-2xl text-white text-center">Add Cost Data</h2>
              <section className="flex justify-between">
                <label
                  htmlFor="month"
                  className="text-slate-200 text-xl w-full"
                >
                  Month:
                </label>
                <select
                  itemType="month"
                  name="month"
                  required
                  className="w-full rounded-lg shadow-md text-slate-800 p-3"
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </section>
              <section className="flex justify-between">
                <label htmlFor="food" className="text-slate-200 text-xl w-full">
                  Food Cost:
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  name="food"
                  className="w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
                />
              </section>
              <section className="flex justify-between">
                <label
                  htmlFor="veterinary"
                  className="text-slate-200 text-xl w-full"
                >
                  Veterinary Cost:
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  name="veterinary"
                  className="w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
                />
              </section>
              <section className="flex justify-between">
                <label
                  htmlFor="insurance"
                  className="text-slate-200 text-xl w-full"
                >
                  Insurance Cost:
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  name="insurance"
                  className="w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
                />
              </section>
              <section className="flex justify-between">
                <label
                  htmlFor="other"
                  className="text-slate-200 text-xl w-full"
                >
                  Other Costs:
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  name="other"
                  className="w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
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
        )}

        {showPopup && (
          <Popup
            onClose={closePopup}
            content={popupContent}
            background={background}
          />
        )}
      </div>
    </div>
  );
}
