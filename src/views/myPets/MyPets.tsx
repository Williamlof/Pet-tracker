import React, { useEffect, useState, ReactComponentElement } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../services/firebase";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import PetCard from "../../components/petCard/PetCard";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

interface PetData {
  age: number;
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
  const [editOverlay, setEditOverlay] = useState<boolean>(false);
  const navigate = useNavigate();

  // a function that will fetch all pets from the firestore database
  const fetchPets = async (auth: any) => {
    const petsRef = doc(db, "users", auth);
    const petsSnapshot = await getDoc(petsRef);
    if (petsSnapshot.exists()) {
      const petsData = petsSnapshot.get("pets");
      if (Array.isArray(petsData)) {
        const petsArray = petsData.map((pet) => {
          return {
            name: pet.name,
            age: pet.age,
            breed: pet.breed,
            notes: pet.notes,
            weight: pet.weight,
            birthday: pet.birthday,
            diet: pet.diet,
            gender: pet.gender,
            // Add any other properties you need here
          };
        });
        setPets(petsArray);
      }
    }
  };

  // load pets data from local storage when component mounts
  useEffect(() => {
    const petsData = localStorage.getItem("pets");
    if (petsData) {
      setPets(JSON.parse(petsData));
    }
  }, []);

  // save pets data to local storage when pets state changes
  useEffect(() => {
    localStorage.setItem("pets", JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (auth.currentUser != null || auth.currentUser != undefined)
        if (user) {
          fetchPets(auth.currentUser.uid);
          navigate("/mypets");
        } else {
          console.log(" no user signed in ");
          navigate("/signin");
        }
      console.log(pets);
    });
  }, []);

  const toggleEditOverlay = () => {
    if (editOverlay) {
      setEditOverlay(false);
    } else {
      setEditOverlay(true);
    }
  };

  return (
    <div className="flex items-center w-full min-h-screen flex-col bg-slate-700 pb-8">
      {pets.length > 0 ? (
        <div className="flex flex-col items-center w-3/4 h-full mt-28">
          <section className="w-full  flex flex-col justify-center items-center">
            <h1 className=" text-slate-100 text-xl mb-8 font-semibold">
              My Pets
            </h1>
            {pets.map((pet: PetData) => (
              <section
                key={pet.name}
                className="h-full w-full bg-slate-200 rounded-md flex justify-between mb-4"
              >
                <PetCard
                  petName={pet.name}
                  image={
                    <img
                      className="h-36 w-full object-cover rounded-t-md"
                      src="https://images.unsplash.com/photo-1583511655826-05700d52f4d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80"
                    ></img>
                  }
                  title={
                    <h1 className="self-center text-lg first-letter:capitalize">
                      {pet.name}
                    </h1>
                  }
                  icon={
                    <FaEdit
                      className="mr-4 self-center"
                      onClick={() => {
                        toggleEditOverlay;
                      }}
                    />
                  }
                />
              </section>
            ))}
            <section className="flex justify-center items-end h-full">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-12 rounded-lg shadow mt-4"
                onClick={() => {
                  navigate("/mypets/addpet");
                }}
              >
                Add Pet
              </button>
            </section>
          </section>
        </div>
      ) : (
        <div className=" mx-8 mt-24">
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
