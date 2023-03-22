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
  files?: Array<string>;
  images?: Array<string>;
  weightData?: Array<{ date: Date; weight: number }>;
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
            files: pet.files,
            images: pet.images,
            weightData: pet.weightData,
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
          const firstImage = await getFirstImageIndexForEachPet(
            auth.currentUser.uid
          );
          console.log(firstImage);

          return firstImage;
        } else {
          console.log(" no user signed in ");
          navigate("/signin");
        }
      console.log(pets);
    });
  }, []);

  async function getFirstImageIndexForEachPet(userUid: string) {
    const userRef = doc(db, `users/${userUid}`);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist!");
      return [];
    }

    const pets = userDoc.data()?.pets ?? [];

    const result: string[] = [];

    for (const pet of pets) {
      const images = pet.images ?? [];

      if (images.length > 0) {
        result.push(images[0]); // push the value of the first image for this pet
      }
    }

    console.log(result);

    return result;
  }

  return (
    <div className="flex items-center w-full min-h-screen flex-col bg-gradient-to-b from-slate-900 to-slate-700 pb-8">
      {pets.length > 0 ? (
        <div className="flex flex-col items-center w-3/4 sm:w-1/3 h-full mt-28">
          <section className="w-full flex flex-col justify-center items-center">
            <h1 className="text-slate-100 text-4xl mb-8 font-semibold">
              My Pets
            </h1>
            {pets.map((pet: PetData) => (
              <section
                key={pet.name}
                className="h-full w-full bg-slate-200 rounded-md flex justify-between mb-4 sm:hover:scale-110 sm:hover:bg-blue-300 transition duration-300 ease-in-out"
              >
                <PetCard
                  petName={pet.name}
                  image={
                    pet.images &&
                    pet.images.length > 0 && (
                      <img
                        className="w-48 h-36 object-cover object-center rounded-t-md"
                        src={pet.images[0]}
                      ></img>
                    )
                  }
                  title={
                    <h1 className="self-center text-lg first-letter:capitalize">
                      {pet.name}
                    </h1>
                  }
                  icon={<FaEdit className="mr-4 self-center" />}
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
        <div className="h-full flex flex-col gap-10 mt-36 items-center">
          <p className="text-slate-100 text-xl sm:text-4xl">
            You haven't added any pets yet!
          </p>

          <p className="text-slate-100 text-xl">
            Click the button to add your first pet.
          </p>
          <section className="flex justify-center items-end">
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
