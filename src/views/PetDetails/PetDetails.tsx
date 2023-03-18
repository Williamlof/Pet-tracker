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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

const storage = getStorage(app);
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

type FileData = {
  name: string;
  url: string;
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
  const [selectedImage, setSelectedImage] = useState<File | null | undefined>(
    null
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileObject, setFileObject] = useState<FileData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [imageChanged, setImageChanged] = useState(false);
  const [fileChanged, setFileChanged] = useState(false);
  const [deletedImageUrl, setDeletedImageUrl] = useState<string>("");
  const [deletedFileUrl, setDeletedFileUrl] = useState<string>("");
  const [popupContent, setPopupContent] = useState<React.ReactNode>(<></>);
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
    if (!petsSnapshot.exists()) {
      return;
    }

    const petsData = petsSnapshot.get("pets");
    if (!Array.isArray(petsData)) {
      return;
    }

    const pet = petsData.find((pet) => pet.name === petName);
    if (!pet) {
      return;
    }

    const petObj = {
      name: pet.name,
      breed: pet.breed,
      notes: pet.notes,
      weight: pet.weight,
      birthday: pet.birthday,
      diet: pet.diet,
      gender: pet.gender,
      images: pet.images,
      files: pet.files,
      // Add any other properties you need here
    };
    setPet(petObj);
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
    triggerPopup("");
    setPopupContent(<p>Saving...</p>);
    onAuthStateChanged(auth, async (user) => {
      if (!auth.currentUser) {
        return;
      }

      const petsRef = doc(db, "users", auth.currentUser.uid);
      const petsSnapshot = await getDoc(petsRef);
      const petsData = petsSnapshot.data();

      if (petsData && petsData.pets) {
        const updatedPets = petsData.pets.map((p: { name: string }) => {
          if (p.name === pet.name) {
            return {
              name: pet.name,
              breed: pet.breed,
              weight: pet.weight,
              birthday: pet.birthday,
              gender: pet.gender,
              notes: pet.notes,
              images: pet.images,
              files: pet.files,
              diet: pet.diet,
            };
          } else {
            return p;
          }
        });

        await updateDoc(petsRef, { pets: updatedPets });

        setPopupContent(<p>Pet information updated!</p>);

        setTimeout(closePopup, 1000);
      } else {
        console.log("Pets data not found");
      }
    });
  };

  const handleImageUpload = async (name: string) => {
    const user = auth.currentUser;

    if (!selectedFile || !user) {
      setPopupContent(<p>Please select an image to upload</p>);
      triggerPopup("");
      setTimeout(closePopup, 1000);
      return;
    }

    try {
      setPopupContent(
        <p className=" text-2xl text-slate-800">Uploading image...</p>
      );
      triggerPopup("");
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
      setSelectedImage(null);
      setImageChanged(!imageChanged);
      setPopupContent(<p>Image uploaded successfully!</p>);
      setTimeout(() => {
        closePopup();
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (name: string) => {
    const user = auth.currentUser;

    if (!selectedFile || !user) {
      console.error("No file selected or user not logged in!");
      return;
    }

    try {
      setPopupContent(
        <p className=" text-2xl text-slate-800">Uploading file...</p>
      );
      triggerPopup("");
      const userFolderRef = ref(storage, `users/${user.uid}/`);
      const filesFolderRef = ref(userFolderRef, "files");

      await setDoc(
        doc(collection(db, "users", user.uid, "files")),
        { exists: true },
        { merge: true }
      );

      const newFileName = await generateUniqueFileName(
        filesFolderRef,
        selectedFile.name
      );
      const fileRef = ref(filesFolderRef, newFileName);

      const updatedFile = new File([selectedFile], newFileName, {
        type: selectedFile.type,
      });

      setSelectedFile(updatedFile);

      await uploadBytesResumable(fileRef, updatedFile, {
        contentType: updatedFile.type,
      });

      const fileUrl = await getDownloadURL(fileRef);
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
        files: [...(pets[petIndex].files || []), fileUrl],
      };

      pets[petIndex] = updatedPet;
      await setDoc(userRef, { pets }, { merge: true });

      setSelectedFile(null);
      setSelectedImage(null);
      setFileChanged(!fileChanged);
      setPopupContent(<p>File uploaded successfully!</p>);
      setTimeout(() => {
        closePopup();
      }, 1000);
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
  }, [auth]);

  const generateUniqueFileName = async (
    filesFolderRef: StorageReference,
    fileName: string
  ): Promise<string> => {
    const extensionIndex = fileName.lastIndexOf(".");
    const nameWithoutExt = fileName.slice(0, extensionIndex);
    const extension = fileName.slice(extensionIndex);

    let count = 1;
    let newFileName = fileName;
    let fileExists = await getDownloadURL(ref(filesFolderRef, newFileName))
      .then(() => true)
      .catch(() => false);

    while (fileExists) {
      newFileName = `${nameWithoutExt} (${count})${extension}`;
      fileExists = await getDownloadURL(ref(filesFolderRef, newFileName))
        .then(() => true)
        .catch(() => false);
      count++;
    }

    return newFileName;
  };

  async function getImageUrls(userUid: string, petName: string) {
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
            setImageChanged(!imageChanged);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    return result;
  }

  async function getFileUrls(userUid: string, petName: string) {
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

    const fileUrls = pet.files ?? [];
    const result: FileData[] = [];

    for (const fileUrl of fileUrls) {
      const storageRef = ref(storage, fileUrl);
      try {
        const metadata = await getMetadata(storageRef);
        if (metadata) {
          const url = await getDownloadURL(storageRef);
          if (url) {
            const fileName = metadata.name || "";
            result.push({ url: fileUrl, name: fileName });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    return result;
  }

  async function getImageDownloadUrls(petName: string) {
    console.log("getImageDownloadUrls");
    const userUid = getAuth().currentUser!.uid;

    if (userUid !== null || userUid !== undefined) {
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
      let result: string[] = [];

      for (const imageUrl of imageUrls) {
        const storageRef = ref(storage, imageUrl);
        try {
          const downloadUrl = await getDownloadURL(storageRef);
          if (downloadUrl) {
            result.push(downloadUrl);
            await downloadImage(downloadUrl);
          }
        } catch (error) {
          console.error(`Error getting download URL for ${imageUrl}`, error);
        }
      }

      return result;
    }
  }

  async function downloadImage(imageUrl: string) {
    const storageRef = ref(storage, imageUrl);

    try {
      const downloadUrl = await getDownloadURL(storageRef);
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const response = await fetch(proxyUrl + downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = imageUrl.split("/").pop() || "image";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error getting download URL for ${imageUrl}`, error);
    }
  }

  async function downloadFile(fileName: string, fileUrl: string) {
    try {
      const storageRef = ref(storage, fileUrl);
      const url = await getDownloadURL(storageRef);
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const response = await fetch(proxyUrl + url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  }

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
              images: pet.images.filter((url: string) => url !== imageUrl),
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

  const deleteFile = async (petName: string, fileUrl: string) => {
    try {
      console.log("deleteFile");

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
              files: pet.files.filter((url: string) => url !== fileUrl),
            };
          } else {
            return pet;
          }
        });

        await updateDoc(userRef, { pets: updatedPets });
        const storage = getStorage();
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);

        setDeletedFileUrl(fileUrl);
        console.log("deletedFileUrl: " + deletedFileUrl);
      }
      // Close the popup
      setShowPopup(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getImageUrls(user.uid, name)
          .then((urls) => setImageUrls(urls))
          .catch((error) => console.error(error));
        getFileUrls(user.uid, name)
          .then((urls) => setFileObject(urls))
          .catch((error) => console.error(error));
      } else {
        console.log("user is null or undefined");
      }
    });

    // Cleanup function to unsubscribe from the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, [auth, imageChanged, deletedImageUrl, deletedFileUrl]);

  return (
    <div className=" min-h-screen h-full w-full pt-20 bg-slate-700">
      <article className=" flex flex-col items-center pb-8 ">
        <section className="h-full min-h-screen w-full sm:w-2/4 md:max-w-screen-md lg:max-w-screen-lg bg-slate-600 rounded-md ">
          <div className="flex flex-col items-center justify-center max-w-screen-xl">
            <div className="flex flex-col items-center justify-center w-full">
              <h1 className="text-2xl font-semibold text-slate-100 pt-4 first-letter:capitalize">
                {petName}
              </h1>
              <img
                className="h-32 w-96 rounded-lg object-cover my-4"
                src={imageUrls[0]}
              />
            </div>
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
                <div>
                  <div className="px-4 pb-2 flex flex-col items-center md:flex-wrap md:h-full md:flex-row">
                    {imageUrls.length === 0 ? (
                      <p>No images found</p>
                    ) : (
                      imageUrls.map((imageUrl) => (
                        <img
                          className=" w-48 h-48 object-cover object-center rounded-lg shadow-md my-2 mx-2"
                          key={imageUrl}
                          src={imageUrl}
                          alt="Pet"
                          onClick={() => {
                            setPopupContent(
                              <article className="max-w-3/4 max-h-3/4 w-full flex flex-col">
                                <img
                                  className=" max-w-xs object-contain"
                                  src={imageUrl}
                                />
                                <section className="flex justify-between w-full">
                                  <button
                                    className="bg-red-500 text-slate-100 rounded-md px-4 py-3 mt-2"
                                    onClick={() =>
                                      deleteImage(pet.name, imageUrl)
                                    }
                                  >
                                    Delete image
                                  </button>
                                  <button
                                    className="bg-slate-800 text-slate-100 rounded-md px-4 py-3 mt-2"
                                    onClick={() => {
                                      getImageDownloadUrls(pet.name);
                                    }}
                                  >
                                    Download image
                                  </button>
                                </section>
                              </article>
                            );
                            triggerPopup(imageUrl);
                          }}
                        />
                      ))
                    )}
                  </div>
                  <section className="flex flex-col sm:flex-row p-1 sm:items-center sm:justify-between border border-slate-600 rounded-md">
                    <p> Upload a new image:</p>
                    <input
                      className=" hidden"
                      type="file"
                      id="img-input"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0])}
                    />
                    <label
                      className="inline-block px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600  w-48 text-center"
                      htmlFor="img-input"
                    >
                      Choose an Image
                    </label>
                    <span className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </span>
                    <button
                      className="bg-slate-800 text-slate-100 rounded-md px-2 py-2 m-1 w-48"
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
                <div className=" pb-2">
                  {fileObject.length === 0 ? (
                    <p className="p-4">No files found</p>
                  ) : (
                    fileObject.map((file: any) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between my-2 border-b border-gray-600"
                      >
                        <section className="flex items-center">
                          <FontAwesomeIcon
                            icon={faFile}
                            className="p-1 h-12 w-12 text-slate-700"
                          />
                          <span className="text-sm w-36">{file.name}</span>
                        </section>
                        <section className="sm:block">
                          <button
                            className=" bg-red-500 text-slate-100 rounded-md h-3/4 w-full my-2 py-2"
                            onClick={() => deleteFile(pet.name, file.url)}
                          >
                            Delete file
                          </button>
                          <button
                            className="bg-slate-800 text-slate-100 rounded-md h-3/4 w-full py-2 mb-2"
                            onClick={() => downloadFile(file.name, file.url)}
                          >
                            Download file
                          </button>
                        </section>
                      </div>
                    ))
                  )}
                  <section className="flex flex-col sm:flex-row p-1 sm:items-center sm:justify-between border border-slate-600 rounded-md">
                    <p> Upload a new file:</p>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept="file_extension txt doc docx pdf xls xlsx csv zip rar 7z gz tar tar.gz tar.bz2 tar.xz "
                      onChange={(e) => setSelectedFile(e.target.files?.[0])}
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-block px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600 w-48 text-center"
                    >
                      Choose a File
                    </label>
                    <span className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </span>
                    <button
                      className="bg-slate-800 text-slate-100 rounded-md px-2 py-2 m-1 w-48"
                      onClick={() => handleFileUpload(name)}
                    >
                      Upload file
                    </button>
                  </section>
                </div>
              }
            />
          </div>
        </section>
      </article>
      {showPopup ? <Popup onClose={closePopup} content={popupContent} /> : null}
    </div>
  );
}

export default PetDetails;
