import React, { useState } from "react";
import firebase, { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { firebaseConfig } from "../../../services/firebase";
const app = initializeApp(firebaseConfig);
const auth = getAuth();

interface PetData {
  name: string;
  notes: string;
  breed: string;
  weight: number;
  birthday: string;
  diet: string;
  gender: string;
}

const AddPetForm = () => {
  const [petData, setPetData] = useState<PetData>({
    name: "",
    notes: "",
    breed: "",
    weight: 0,
    birthday: "",
    diet: "",
    gender: "",
  });

  // Add a listener to check if a user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const db = getFirestore(app);
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log("User is signed in");
      console.log(auth.currentUser!.uid);
    } else {
      // User is signed out
      console.log("User is signed out");

      // ...
    }
  });

  class Pet {
    name: string;
    notes: string;
    breed: string;
    weight: number;
    birthday: Date;
    diet: string;
    gender: string;

    constructor(
      name: string,
      notes: string,
      breed: string,
      weight: number,
      birthday: Date,
      diet: string,
      gender: string
    ) {
      this.name = name;
      this.notes = notes;
      this.breed = breed;
      this.weight = weight;
      this.birthday = birthday;
      this.diet = diet;
      this.gender = gender;
    }
    toString() {
      return (
        this.name +
        ", " +
        this.notes +
        ", " +
        this.breed +
        ", " +
        this.diet +
        ", " +
        this.gender
      );
    }
  }

  // Firestore data converter
  const petConverter = {
    toFirestore: (pet: PetData) => {
      return {
        name: pet.name,
        notes: pet.notes,
        breed: pet.breed,
        weight: pet.weight,
        birthday: pet.birthday,
        diet: pet.diet,
        gender: pet.gender,
      };
    },
    fromFirestore: (snapshot: { data: (arg0: any) => any }, options: any) => {
      const data = snapshot.data(options);
      return new Pet(
        data.name,
        data.notes,
        data.breed,
        data.weight,
        data.birthday,
        data.diet,
        data.gender
      );
    },
  };
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
    });

    const db = getFirestore(app);

    // Create a reference to the user's pets collection
    const userDocRef = doc(db, "users", auth.currentUser!.uid);
    console.log("User doc ref: ", userDocRef);

    // Add the pet to the user's pets collection
    try {
      console.log("entered try block");

      await updateDoc(userDocRef, {
        pets: arrayUnion({
          name: petData.name,
          notes: petData.notes,
          breed: petData.breed,
          weight: petData.weight,
          birthday: petData.birthday,
          diet: petData.diet,
          gender: petData.gender,
        }),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  return (
    <div
      className="flex flex-col justify-center items-center
    bg-slate-700 w-full h-full pt-14"
    >
      <a
        className=" text-blue-400 dark:text-blue-200 hover:underline mt-8 text-lg font-semibold self-start pl-8 mb-8"
        href="/myPets"
      >
        Cancel
      </a>

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
