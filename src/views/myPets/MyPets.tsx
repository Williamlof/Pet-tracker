import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "../../services/firebase";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface PetData {
  name: string;
  notes: string;
  breed: string;
  weight: number;
  birthday: Date;
  diet: string;
  gender: string;
}

const MyPets = () => {
  const [pets, setPets] = useState<Array<PetData>>([]);
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center  w-full h-screen flex-col bg-slate-700">
      {pets.length > 0 ? null : (
        <div className=" mx-8">
          <p className=" text-slate-100 text-xl">
            You haven't added any pets yet!
          </p>
          <br />
          <p className=" text-slate-100 text-xl">
            Click the button below to add your first pet.
          </p>
          <section className="flex justify-center items-end h-full">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-12 rounded-lg shadow"
              onClick={() => {
                navigate("/mypets/addpet");
              }}
            >
              Add Pet
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default MyPets;
