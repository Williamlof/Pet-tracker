import React, { useState } from "react";
import firebase, { initializeApp } from "firebase/app";
import "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../services/firebase";
const app = initializeApp(firebaseConfig);
interface PetData {
  name: string;
  notes: string;
  breed: string;
  weight: number;
  birthday: Date;
  diet: string;
  gender: string;
}
const AddPetForm = () => {
  const [petData, setPetData] = useState<PetData>({
    name: "",
    notes: "",
    breed: "",
    weight: 0,
    birthday: new Date(),
    diet: "",
    gender: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPetData({
      name: "",
      notes: "",
      breed: "",
      weight: 0,
      birthday: new Date(),
      diet: "",
      gender: "",
    });
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, "pets"), {
      name: petData.name,
      notes: petData.notes,
      breed: petData.breed,
      weight: petData.weight,
      birthday: petData.birthday,
      diet: petData.diet,
      gender: petData.gender,
    });
    console.log("Document written with ID: ", docRef.id);
  };

  return (
    <div
      className="flex flex-col justify-center items-center
    bg-slate-700 w-full h-full pt-24"
    >
      <form
        onSubmit={handleSubmit}
        className=" 
        flex flex-col justify-center items-start rounded-lg w-3/4 pb-16"
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
            value={petData.birthday.toISOString().slice(0, 10)}
            onChange={(e) =>
              setPetData({ ...petData, birthday: new Date(e.target.value) })
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
          Weight (in kg's):
          <input
            className=" w-full rounded-lg h-10 shadow-md text-slate-800 p-4"
            type="number"
            value={petData.weight}
            onChange={(e) =>
              setPetData({ ...petData, weight: Number(e.target.value) })
            }
          />
        </label>
        <br />

        <label className=" text-slate-200 text-md w-full">
          Diet:
          <textarea
            typeof="text"
            value={petData.diet}
            onChange={(e) => setPetData({ ...petData, diet: e.target.value })}
            className=" w-full rounded-lg h-24 shadow-md text-slate-800 p-4"
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
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <br />

        <label className=" text-slate-200 text-md w-full">
          Notes:
          <textarea
            typeof="text"
            value={petData.notes}
            onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
            className=" w-full rounded-lg h-28 shadow-md text-slate-800 p-4"
          ></textarea>
        </label>
        <br />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-12 rounded-lg shadow self-center"
          type="submit"
        >
          Add Pet
        </button>
      </form>
    </div>
  );
};

export default AddPetForm;
