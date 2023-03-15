import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../services/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";
import Accordion from "../../components/accordion/Accordion";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import Popup from "../../components/Popup/Popup";

const storage = getStorage(app);
const user = getAuth().currentUser;
type PetData = {
  name: string;
  notes: string;
  breed: string;
  weight: number;
  birthday: Date;
  diet: string;
  gender: string;
  [key: string]: any; // Add an index signature to allow for any other properties
};

function PetDetails() {
  const { petName } = useParams(); // get the pet name from the URL parameter
  const [pet, setPet] = useState<PetData>(
    {} as PetData // set the initial state to an empty object
  );
  const name = pet.name;
  const [selectedFile, setSelectedFile] = useState<File | null | undefined>(
    null
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageChanged, setImageChanged] = useState(false);
  const [deletedImageUrl, setDeletedImageUrl] = useState<string>("");
  const triggerPopup = (imageUrl: string) => {
    setShowPopup(true);
    setImageUrl(imageUrl);
  };
  const closePopup = () => {
    setShowPopup(false);
    setImageUrl("");
  };
  const navigate = useNavigate();

  const fetchPet = async (auth: any, petName: string) => {
    const petsRef = doc(db, "users", auth);
    const petsSnapshot = await getDoc(petsRef);
    if (petsSnapshot.exists()) {
      const petsData = petsSnapshot.get("pets");
      if (Array.isArray(petsData)) {
        const pet = petsData.find((pet) => pet.name === petName);
        if (pet) {
          const petObj = {
            name: pet.name,
            breed: pet.breed,
            notes: pet.notes,
            weight: pet.weight,
            birthday: pet.birthday,
            diet: pet.diet,
            gender: pet.gender,
            // Add any other properties you need here
          };
          setPet(petObj);
        }
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setPet((prevState) => ({
      ...prevState,
      notes: name === "notes" ? value : prevState.notes,
      diet: name === "diet" ? value : prevState.diet,
    }));
  };
  const handleSave = async () => {
    console.log(pet);

    onAuthStateChanged(auth, async (user) => {
      if (auth.currentUser != null || auth.currentUser != undefined) {
        const petsRef = doc(db, "users", auth.currentUser.uid);
        const petsSnapshot = await getDoc(petsRef);
        const petsData = petsSnapshot.data();

        if (petsData !== undefined && petsData.pets !== undefined) {
          const updatedPets = petsData.pets.map((p: any) => {
            if (p.name === pet.name) {
              return {
                name: pet.name,
                breed: pet.breed,
                weight: pet.weight,
                birthday: pet.birthday,
                gender: pet.gender,
                notes: pet.notes,
                diet: pet.diet,
              };
            } else {
              return console.log(p);
            }
          });

          await updateDoc(petsRef, {
            pets: updatedPets,
          });

          alert("Pet information updated!");
        } else {
          console.log("Pets data not found");
        }
      }
    });
  };

  const handleImageUpload = async (name: string) => {
    const user = auth.currentUser;

    if (!selectedFile || !user) {
      console.error("No file selected or user not logged in!");
      return;
    }

    try {
      const userFolderRef = ref(storage, `users/${user.uid}/`);
      const imagesFolderRef = ref(userFolderRef, "images");

      await setDoc(
        doc(collection(db, "users", user.uid, "images")),
        { exists: true },
        { merge: true }
      );

      const imageRef = ref(imagesFolderRef, selectedFile.name);

      await uploadBytesResumable(imageRef, selectedFile, {
        contentType: selectedFile.type,
      });

      const imageUrl = await getDownloadURL(imageRef);
      const userRef = doc(db, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User document does not exist!");
        return;
      }

      const pets = userDoc.data()?.pets ?? [];
      const petIndex = pets.findIndex(
        (pet: { name: string }) => pet.name === name
      );

      if (petIndex === -1) {
        console.error(`Pet with name ${name} not found!`);
        return;
      }

      const updatedPet = {
        ...pets[petIndex],
        images: [...(pets[petIndex].images || []), imageUrl],
      };

      pets[petIndex] = updatedPet;
      await setDoc(userRef, { pets }, { merge: true });

      setSelectedFile(null);
      setImageChanged(true);
      console.log("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (auth.currentUser != null || auth.currentUser != undefined)
        if (user) {
          if (petName) {
            // add a check to make sure petName is defined
            fetchPet(auth.currentUser.uid, petName);
          }
        } else {
          console.log(" no user signed in ");
          navigate("/signin");
        }
    });
  }, [auth, petName, navigate]);

  const getImageUrls = async (userUid: string, petName: string) => {
    const userRef = doc(db, `users/${userUid}`);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist!");
      return [];
    }

    const pets = userDoc.data()?.pets ?? [];
    const pet = pets.find((pet: { name: string }) => pet.name === petName);

    if (!pet) {
      console.error(`Pet with name ${petName} not found!`);
      return [];
    }

    const imageUrls = pet.images ?? [];
    const result: string[] = [];

    for (const imageUrl of imageUrls) {
      const storageRef = ref(storage, imageUrl);
      try {
        const metadata = await getMetadata(storageRef);
        if (metadata) {
          const url = await getDownloadURL(storageRef);
          if (url) {
            result.push(imageUrl);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    return result;
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteImage = async (petName: string, imageUrl: string) => {
    try {
      // Update pet document in Firestore
      const db = getFirestore();
      const userId = auth.currentUser!.uid;
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const pets = userDoc.data().pets;
        const updatedPets = pets.map((pet: PetData) => {
          if (pet.name === petName) {
            return {
              ...pet,
              imageUrls: pet.images.filter((url: string) => url !== imageUrl),
            };
          } else {
            return pet;
          }
        });

        await updateDoc(userRef, { pets: updatedPets });

        setDeletedImageUrl(imageUrl);
      }
      // Close the popup
      setShowPopup(false);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const user = auth.currentUser;
    if (user === null || user === undefined) {
      console.log("user is null or undefined");

      return;
    } else {
      getImageUrls(user.uid, name)
        .then((urls) => setImageUrls(urls))
        .catch((error) => console.error(error));
    }
  }, [auth, name, imageChanged, deletedImageUrl]);

  return (
    <div className=" min-h-screen h-full w-full pt-24 bg-slate-700">
      <article className=" flex flex-col items-center mx-8 pb-8 ">
        <section className="h-full min-h-screen w-full bg-slate-600 rounded-md">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold text-slate-100 pt-4 first-letter:capitalize">
              {petName}
            </h1>
            <img
              className="h-32 w-80 rounded-lg object-cover my-4"
              src="https://images.unsplash.com/photo-1601880348117-25c1127a95df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
            />
            <Accordion
              title="Information"
              content={
                <div className="px-0 pb-2 ">
                  <section className="flex justify-between py-2 border-b border-gray-600">
                    <p>Breed:</p>
                    <p>{pet.breed}</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-600">
                    <p>Gender:</p>
                    <p>{pet.gender}</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-600">
                    <p>Current weight:</p>
                    <p>{pet.weight}kg</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-600">
                    <p>Birthday:</p>
                    <p>{new Date(pet.birthday).toLocaleDateString("en-US")}</p>
                  </section>
                  <section className="py-4">
                    <label>
                      Diet:
                      <textarea
                        name="diet"
                        typeof="text"
                        placeholder={pet.diet}
                        defaultValue={pet.diet || ""}
                        onChange={handleInputChange}
                        className="mt-2 w-full h-32 p-1"
                      ></textarea>
                    </label>
                  </section>
                  <section className="py-4">
                    <label>
                      Notes:
                      <textarea
                        name="notes"
                        typeof="text"
                        defaultValue={pet.notes}
                        placeholder={pet.notes || ""}
                        onChange={handleInputChange}
                        className="mt-2 w-full h-32 p-1"
                      ></textarea>
                    </label>
                  </section>
                  <button
                    className="bg-slate-800 text-slate-100 rounded-md px-2 py-1 mt-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              }
            />
            <Accordion
              title="Images"
              content={
                <div className="px-4 pb-2">
                  {imageUrls.length === 0 ? (
                    <p>No images found</p>
                  ) : (
                    imageUrls.map((imageUrl) => (
                      <img
                        key={imageUrl}
                        src={imageUrl}
                        alt="Pet"
                        onClick={() => {
                          triggerPopup(imageUrl);
                        }}
                        className="w-full object-cover rounded-md shadow-lg my-2 h-32"
                      />
                    ))
                  )}
                  <section>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => setSelectedFile(e.target.files?.[0])}
                    />
                    <button
                      className="bg-slate-800 text-slate-100 rounded-md px-2 py-1 mt-2"
                      onClick={() => handleImageUpload(name)}
                    >
                      Upload image
                    </button>
                  </section>
                </div>
              }
            />
            <Accordion
              title="Files"
              content={
                <div className="px-4 pb-2">
                  <p>Files</p>
                </div>
              }
            />
          </div>
        </section>
      </article>
      {showPopup ? (
        <Popup
          onClose={closePopup}
          content={
            <article>
              <img
                className=" max-w-screen w-3/4 h-full max-h-screen object-contain"
                src={imageUrl}
              ></img>
              <section className="flex justify-between">
                <button
                  className=" bg-slate-800 text-slate-100 rounded-md px-2 py-1 mt-2 "
                  onClick={() => deleteImage(pet.name, imageUrl)}
                >
                  Delete image
                </button>
                <button
                  className=" bg-slate-800 text-slate-100 rounded-md px-2 py-1 mt-2"
                  onClick={() => {
                    downloadImage(imageUrl, "image.jpg");
                  }}
                >
                  Download image
                </button>
              </section>
            </article>
          }
        />
      ) : null}
    </div>
  );
}

export default PetDetails;
