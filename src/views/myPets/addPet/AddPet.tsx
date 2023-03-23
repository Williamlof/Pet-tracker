import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { firebaseConfig } from "../../../services/firebase";
const app = initializeApp(firebaseConfig);
const auth = getAuth();
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface PetData {
  name: string;
  notes: string;
  breed: string;
  weight: number;
  birthday: string;
  diet: string;
  chipNumber: string;
  gender: string;
  files: string[];
  images: string[];
  weightData: { weight: number; date: string }[];
}

const AddPetForm = () => {
  const navigate = useNavigate();
  const [petData, setPetData] = useState<PetData>({
    name: "",
    notes: "",
    breed: "",
    weight: 0,
    birthday: "",
    chipNumber: "",
    diet: "",
    gender: "",
    files: [],
    images: [],
    weightData: [],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPetData({
      name: "",
      notes: "",
      breed: "",
      weight: 0,
      birthday: "",
      diet: "",
      gender: "",
      chipNumber: "",
      files: [],
      images: [],
      weightData: [],
    });

    const db = getFirestore(app);

    // Create a reference to the user's pets collection
    const userDocRef = doc(db, "users", auth.currentUser!.uid);

    // Add the pet to the user's pets collection
    try {
      await updateDoc(userDocRef, {
        pets: arrayUnion({
          name: petData.name,
          notes: petData.notes,
          breed: petData.breed,
          weight: petData.weight,
          birthday: petData.birthday,
          diet: petData.diet,
          chipData: petData.chipNumber,
          gender: petData.gender,
          files: petData.files,
          images: petData.images,
          weightData: [
            {
              weight: petData.weight,
              date: new Date().toISOString().slice(0, 10),
            },
          ],
        }),
      });
      navigate("/mypets");
    } catch (e) {}
  };
  return (
    <div
      className="flex flex-col justify-center items-center 
      bg-gradient-to-b from-slate-900  to-slate-700 w-full min-w-screen h-full pt-24"
    >
      <FontAwesomeIcon
        icon={faCircleArrowLeft}
        className="text-slate-200 scale-200 self-start pl-4 pb-4 sm:pl-48 md:pl-56 lg:pl-64 cursor-pointer"
        onClick={() => navigate("/mypets")}
      />
      <h1 className=" text-slate-100 text-4xl font-bold mb-8 text-center">
        Fill in your pets information
      </h1>
      <form
        onSubmit={handleSubmit}
        className=" 
        flex flex-col justify-center items-start rounded-lg sm:w-1/3 pb-16"
      >
        <label className=" text-slate-200 text-md w-full">
          Name:
          <input
            type="text"
            value={petData.name}
            onChange={(e) => setPetData({ ...petData, name: e.target.value })}
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
          />
        </label>
        <br />
        <label className=" text-slate-200 text-md w-full">
          Birthday:
          <input
            type="date"
            value={petData.birthday.toString().slice(0, 10)}
            onChange={(e) =>
              setPetData({ ...petData, birthday: e.target.value })
            }
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
            onKeyDown={(e) => {
              e.preventDefault();
            }}
          />
        </label>
        <br />
        <label className=" text-slate-200 text-md w-full">
          Breed:
          <input
            type="text"
            value={petData.breed}
            onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
          />
        </label>
        <br />
        <label className=" text-slate-200 text-md w-full">
          Chip number:
          <input
            type="text"
            value={petData.chipNumber}
            onChange={(e) =>
              setPetData({ ...petData, chipNumber: e.target.value })
            }
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
          />
        </label>
        <br />
        <label className=" text-slate-200 text-md w-full">
          Weight (in kg's):
          <input
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
            type="number"
            step={0.5}
            value={petData.weight}
            onChange={(e) =>
              setPetData({ ...petData, weight: Number(e.target.value) })
            }
          />
        </label>
        <br />

        <label className=" text-slate-200 text-md w-full h-36">
          Diet:
          <textarea
            typeof="text"
            value={petData.diet}
            onChange={(e) => setPetData({ ...petData, diet: e.target.value })}
            className=" w-full min-h-full rounded-lg shadow-md text-slate-800 p-4 max-h-36"
          ></textarea>
        </label>
        <br />
        <label className=" text-slate-200 text-md w-full">
          Gender:
          <select
            value={petData.gender}
            onChange={(e) => setPetData({ ...petData, gender: e.target.value })}
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 px-4"
          >
            <option value="">Select a gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <br />

        <label className=" text-slate-200 text-md w-full h-36">
          Notes:
          <textarea
            typeof="text"
            value={petData.notes}
            onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
            className=" w-full min-h-full rounded-lg shadow-md text-slate-800 p-4 max-h-36"
          ></textarea>
        </label>
        <br />
        <section className="w-full flex justify-between">
          <a
            className=" text-blue-500 dark:text-blue-400 hover:underline mt-8 text-lg font-semibold self-start pl-8 mb-8 "
            href="/myPets"
          >
            Cancel
          </a>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2  rounded-lg  self-center w-1/3 shadow-lg"
            type="submit"
          >
            Add Pet
          </button>
        </section>
      </form>
    </div>
  );
};

export default AddPetForm;
