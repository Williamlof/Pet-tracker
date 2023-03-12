import React, { useEffect, useState, ReactComponentElement } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../services/firebase";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import Accordion from "../../components/accordion/Accordion";
import EditIcon from "../../assets/icons/EditIcon.svg";
import { FaEdit } from "react-icons/fa";
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

  return (
    <div className="flex items-center w-full h-screen flex-col bg-slate-700">
      {pets.length > 0 ? (
        <div className="flex flex-col items-center w-3/4 h-full mt-28">
          <section className="w-full">
            <h1 className=" text-slate-100 text-xl mb-8 font-semibold">
              My Pets
            </h1>
            {pets.map((pet: PetData) => (
              // tailwind classes to make an accordion for each pet
              <section key={pet.name}>
                <Accordion
                  title={pet.name}
                  icon={<FaEdit />}
                  content={
                    <div>
                      <div className="px-4 pb-2">
                        <p>Breed: {pet.breed}</p>
                        <p>Notes: {pet.notes}</p>
                        <p>Weight: {pet.weight}</p>
                        <p>
                          Birthday:{" "}
                          {new Date(pet.birthday).toLocaleDateString("en-US")}
                        </p>
                        <p>Diet: {pet.diet}</p>
                        <p>Gender: {pet.gender}</p>
                      </div>
                    </div>
                  }
                />
              </section>
            ))}
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
          </section>
        </div>
      ) : (
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
