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
  chipData: string;
  gender: string;
  files: string[];
  images: string[];
  weightData: Array<{ date: Date; weight: number }>;
  costData: Array<{
    month: string;
    totalSpent: number;
    costs: {
      food: number;
      veterinary: number;
      insurance: number;
    };
  }>;
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
  const [fileObject, setFileObject] = useState<FileData[]>([]);
  const [imageObject, setImageObject] = useState<FileData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageChanged, setImageChanged] = useState(false);
  const [fileChanged, setFileChanged] = useState(false);
  const [deletedImageUrl, setDeletedImageUrl] = useState<string>("");
  const [isFetching, setIsFetching] = useState(true);
  const [deletedFileUrl, setDeletedFileUrl] = useState<string>("");
  const [popupContent, setPopupContent] = useState<React.ReactNode>(<></>);
  const [background, setBackground] = useState<string>("");
  const [uploadFileBtnState, setUploadFileBtnState] = useState<string>(
    "border border-red-500 cursor-not-allowed"
  );
  const [uploadImageBtnState, setUploadImageBtnState] = useState<string>(
    "border border-red-500 cursor-not-allowed"
  );
  const triggerPopup = (imageUrl: string) => {
    if (imageUrl === "") {
      setBackground("bg-slate-200 my-auto");
    }
    setShowPopup(true);
    setImageUrl(imageUrl);
  };
  const closePopup = () => {
    setShowPopup(false);
    setBackground("");
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
      chipData: pet.chipData,
      diet: pet.diet,
      gender: pet.gender,
      images: pet.images,
      files: pet.files,
      weightData: pet.weightData,
      costData: pet.costData,
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
    triggerPopup("");
    setPopupContent(<p className="text-3xl">Saving...</p>);
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
            // Update only the notes and diet properties of the pet
            return {
              ...p, // Keep all the original properties
              notes: pet.notes, // Update the notes property
              diet: pet.diet, // Update the diet property
            };
          } else {
            return p;
          }
        });

        await updateDoc(petsRef, { pets: updatedPets });

        setPopupContent(<p className="text-3xl">Pet information updated!</p>);

        setTimeout(closePopup, 1000);
      } else {
        setPopupContent(
          <p className="text-3xl">Could not update pet information</p>
        );
        setTimeout(closePopup, 1000);
      }
    });
  };

  const handleImageUpload = async (name: string) => {
    const user = auth.currentUser;

    if (!selectedImage || !user) {
      setPopupContent(
        <p className="text-3xl">Please select an image to upload</p>
      );
      triggerPopup("");

      return;
    }

    try {
      setPopupContent(<p className=" text-3xl ">Uploading image...</p>);
      triggerPopup("");
      const userFolderRef = ref(storage, `users/${user.uid}/`);
      const imagesFolderRef = ref(userFolderRef, "images");

      await setDoc(
        doc(collection(db, "users", user.uid, "images")),
        { exists: true },
        { merge: true }
      );

      const imageRef = ref(imagesFolderRef, selectedImage.name);

      await uploadBytesResumable(imageRef, selectedImage, {
        contentType: selectedImage.type,
      });

      const imageUrl = await getDownloadURL(imageRef);
      const userRef = doc(db, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const petIndex = await pets.findIndex(
        (pet: { name: string }) => pet.name === name
      );

      if (petIndex === -1) {
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
      setUploadImageBtnState("border border-red-500 cursor-not-allowed");
      setImageChanged(!imageChanged);
      setPopupContent(<p className="text-3xl">Image uploaded successfully!</p>);

      setTimeout(() => {
        closePopup();
      }, 1000);
    } catch (error) {}
  };

  const handleFileUpload = async (
    name: string,
    onUploadComplete: () => void
  ) => {
    const user = auth.currentUser;

    if (!selectedFile || !user) {
      setPopupContent(
        <p className="text-3xl">Please select a file to upload</p>
      );
      triggerPopup("");

      return;
    }

    try {
      setPopupContent(<p className=" text-3xl ">Uploading file...</p>);
      triggerPopup("");
      const userFolderRef = ref(storage, `users/${user.uid}/`);
      const filesFolderRef = ref(userFolderRef, "files");

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
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const petIndex = await pets.findIndex(
        (pet: { name: string }) => pet.name === name
      );

      if (petIndex === -1) {
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
      setUploadFileBtnState("border border-red-500 cursor-not-allowed");
      onUploadComplete();
      setPopupContent(<p className="text-3xl">File uploaded successfully!</p>);
      setTimeout(() => {
        closePopup();
      }, 1000);
    } catch (error) {}
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
          setPopupContent(
            <p className="text-3xl">Please sign in to view this page</p>
          );
          setTimeout(closePopup, 1000);
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

  async function getPet(userUid: string, petName: string) {
    const userRef = doc(db, `users/${userUid}`);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const pets = (await userDoc.data()?.pets) ?? [];
    const pet = await pets.find(
      (pet: { name: string }) => pet.name === petName
    );

    if (!pet) {
    }

    return pet;
  }

  async function getImageUrls(userUid: string, petName: string) {
    const pet = await getPet(userUid, petName);

    if (!pet) {
      return [];
    }

    const imageUrls = pet.images ?? [];
    const result: FileData[] = [];

    for (const imageUrl of imageUrls) {
      const storageRef = ref(storage, imageUrl);
      try {
        // Check if the file exists in Firebase Storage
        const exists = await getMetadata(storageRef)
          .then(() => true)
          .catch(() => false);

        if (!exists) {
          console.warn("File not found in Firebase Storage:", imageUrl);
          continue;
        }

        const metadata = await getMetadata(storageRef);
        const url = await getDownloadURL(storageRef);
        if (url) {
          const imageName = metadata.name || "";
          result.push({ url: url, name: imageName });
        }
      } catch (error) {}
    }
    return result;
  }

  async function getFileUrls(userUid: string, petName: string) {
    const pet = await getPet(userUid, petName);

    if (!pet) {
      return [];
    }

    const fileUrls = pet.files ?? [];
    const result: FileData[] = [];
    for (const fileUrl of fileUrls) {
      const storageRef = ref(storage, fileUrl);

      try {
        // Check if the file exists in Firebase Storage
        const exists = await getMetadata(storageRef)
          .then(() => true)
          .catch(() => false);

        if (!exists) {
          console.warn("File not found in Firebase Storage:", fileUrl);
          continue;
        }

        const metadata = await getMetadata(storageRef);
        const url = await getDownloadURL(storageRef);
        if (url) {
          const fileName = metadata.name || "";
          result.push({ url: url, name: fileName });
        }
      } catch (error) {}
    }
    return result;
  }

  async function getImageDownloadUrls(
    petName: string,
    imageUrl: string,
    imageName: string
  ) {
    const userUid = getAuth().currentUser!.uid;

    if (userUid !== null || userUid !== undefined) {
      const userRef = doc(db, `users/${userUid}`);

      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const pet = await pets.find(
        (pet: { name: string }) => pet.name === petName
      );

      if (!pet) {
        return;
      }

      const imageUrls = pet.images ?? [];

      if (imageUrls.includes(imageUrl)) {
        await downloadImage(imageUrl, imageName);
      }
    }
  }

  async function downloadImage(imageUrl: string, imageName: string) {
    try {
      const storageRef = ref(storage, imageUrl);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {}
  }

  async function downloadFile(fileName: string, fileUrl: string) {
    try {
      const storageRef = ref(storage, fileUrl);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {}
  }

  const deleteImage = async (petName: string, imageUrl: string) => {
    try {
      // Update pet document in Firestore
      setPopupContent(<p className="text-3xl">Deleting image...</p>);
      triggerPopup("");
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
        setImageChanged(!imageChanged);
        setPopupContent(<p className="text-3xl">Image deleted sucessfully</p>);
        setTimeout(() => {
          closePopup();
        }, 1000);
      }
      // Close the popup
    } catch (error) {}
  };

  const deleteFile = async (petName: string, fileUrl: string) => {
    try {
      triggerPopup("");
      setPopupContent(<p className="text-3xl">Deleting file...</p>);
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
      }
      // Close the popup

      setPopupContent(<p className="text-3xl">File deleted!</p>);
      setTimeout(() => {
        closePopup();
      }, 1000);
      setFileChanged(!fileChanged);
    } catch (error) {}
  };

  function handleSelectedFile(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0]);
    setUploadFileBtnState("border border-green-500 ");
    if (!e.target.files?.[0])
      setUploadFileBtnState("border border-red-500 cursor-not-allowed");
  }
  function handleSelectedImage(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedImage(e.target.files?.[0]);
    setUploadImageBtnState("border border-green-500 ");
    if (!e.target.files?.[0])
      setUploadImageBtnState("border border-red-500 cursor-not-allowed");
  }
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && name) {
        getImageUrls(user.uid, name).then((urls) => setImageObject(urls));
        getFileUrls(user.uid, name).then((urls) => setFileObject(urls));
        setTimeout(() => {
          setIsFetching(false);
        }, 5000);
      } else {
        return;
      }
    });

    // Cleanup function to unsubscribe from the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, [auth, name, imageChanged, fileChanged]);

  return (
    <div className=" min-h-screen h-full w-full pt-20 bg-gradient-to-b from-slate-900  to-slate-700">
      <article className=" flex flex-col items-center pb-8 ">
        <section className="h-full min-h-screen w-full sm:w-2/4 md:max-w-screen-md lg:max-w-screen-lg rounded-md ">
          <div className="flex flex-col items-center justify-center max-w-screen-xl">
            <div className="flex flex-col items-center justify-center w-full">
              <h1 className="text-2xl font-semibold text-slate-100 pt-4 first-letter:capitalize">
                {petName}
              </h1>
              {imageObject.length > 0 ? (
                <img
                  className=" max-h-360 w-80 rounded-lg object-cover my-4"
                  src={imageObject.length > 0 ? imageObject[0].url : ""}
                  alt="pet-image"
                />
              ) : (
                <p className="text-slate-200 text-xl">
                  Upload an image to see it here
                </p>
              )}
            </div>
            <Accordion
              title="Information"
              content={
                <div className="px-0 pb-2 ">
                  <section className="flex justify-between py-2 border-b border-gray-800 text-slate-100">
                    <p>Breed:</p>
                    <p>{pet.breed}</p>
                  </section>
                  <section className="flex justify-between py-2 border-b border-gray-800 text-slate-100">
                    <p>Chip number:</p>
                    <p>{pet.chipData}</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-800 text-slate-100">
                    <p>Gender:</p>
                    <p>{pet.gender}</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-800 text-slate-100">
                    <p>Current weight:</p>
                    <p>{pet.weight}kg</p>
                  </section>

                  <section className="flex justify-between py-2 border-b border-gray-800 text-slate-100">
                    <p>Birthday:</p>
                    <p>{new Date(pet.birthday).toLocaleDateString("en-US")}</p>
                  </section>
                  <section className="py-4 ">
                    <label className="text-slate-100">
                      Diet:
                      <textarea
                        name="diet"
                        typeof="text"
                        placeholder={pet.diet}
                        defaultValue={pet.diet || ""}
                        onChange={handleInputChange}
                        className="mt-2 w-full h-32 p-2 rounded-md text-slate-800"
                      ></textarea>
                    </label>
                  </section>
                  <section className="py-4">
                    <label className="text-slate-100">
                      Notes:
                      <textarea
                        name="notes"
                        typeof="text"
                        defaultValue={pet.notes}
                        placeholder={pet.notes || ""}
                        onChange={handleInputChange}
                        className="mt-2 w-full h-32 p-2 rounded-md text-slate-800"
                      ></textarea>
                    </label>
                  </section>
                  <section className="flex justify-center">
                    <button
                      className="bg-slate-800 text-slate-100 rounded-md px-2 py-2 m-1 w-48"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </section>
                </div>
              }
            />
            <Accordion
              title="Images"
              content={
                <div>
                  <div className="px-4 pb-2 flex flex-col items-center md:flex-wrap md:h-full md:flex-row">
                    {imageObject.length === 0 ? (
                      <p className="text-slate-100">No images found</p>
                    ) : (
                      imageObject.map((image) => (
                        <img
                          className=" w-48 h-48 object-cover object-center rounded-lg shadow-md my-2 mx-2"
                          key={image.name}
                          src={image.url}
                          alt="Pet"
                          onClick={() => {
                            setPopupContent(
                              <article className=" max-h-full w-full flex flex-col self-center justify-center">
                                <section className="self-center">
                                  <img
                                    className=" object-contain rounded-lg shadow-md max-h-480 sm:max-h-600 md:max-h-720"
                                    src={image.url}
                                  />
                                </section>

                                <section className="flex justify-between w-full">
                                  <button
                                    className="bg-slate-800 border-red-500 hover:bg-red-500 hover:border-slate-800 transition border text-slate-100 rounded-md px-2 py-2 mt-2 text-sm"
                                    title="This will delete the image from your account. There is no way to undo this action."
                                    onClick={() =>
                                      deleteImage(pet.name, image.url)
                                    }
                                  >
                                    Delete image
                                  </button>
                                  <button
                                    className="rounded-md px-2 py-2 mt-2 text-sm
                               text-white bg-blue-500  cursor-pointer hover:bg-blue-600 w-48 text-center"
                                    onClick={() => {
                                      getImageDownloadUrls(
                                        petName!,
                                        image.url,
                                        image.name
                                      );
                                    }}
                                  >
                                    Download image
                                  </button>
                                </section>
                              </article>
                            );
                            triggerPopup(image.url);
                          }}
                        />
                      ))
                    )}
                  </div>
                  <section className="flex flex-col xl:flex-row p-2 items-center sm:justify-between border-2 border-slate-700 rounded-md">
                    <p className="text-slate-100 "> Upload a new image:</p>
                    <input
                      className=" hidden"
                      type="file"
                      id="img-input"
                      accept="image/*"
                      onChange={(e) => handleSelectedImage(e)}
                    />
                    <label
                      className="inline-block px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600  w-48 text-center"
                      htmlFor="img-input"
                    >
                      Choose an Image
                    </label>
                    <span className="text-sm w-36 text-slate-100 text-ellipsis h-8 px-2">
                      {selectedImage?.name.slice(0, 15).concat("...")}
                    </span>
                    <button
                      className={`${uploadImageBtnState} bg-slate-800 text-slate-100 rounded-md px-2 py-2 m-1 w-48`}
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
                  {fileObject.length === 0 || isFetching ? (
                    <p className="p-4 text-lg text-slate-200">No files found</p>
                  ) : (
                    fileObject.map((file: any) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between my-2 border rounded-lg p-1 border-gray-800"
                      >
                        <section className="flex items-center">
                          <FontAwesomeIcon
                            icon={faFile}
                            className="p-1 h-12 w-12 text-slate-400"
                          />
                          <span className="text-sm w-32 sm:w-16 md:w-52 lg:w-64 xl:w-full text-slate-100 overflow-hidden whitespace-nowrap overflow-ellipsis">
                            {file.name}
                          </span>
                        </section>
                        <section className="flex flex-col sm:block">
                          <button
                            className=" bg-slate-800 border-red-500 hover:bg-red-500 hover:border-slate-800 transition border text-slate-100 rounded-md sm:h-3/4 sm:w-full my-2 py-2 px-2"
                            onClick={() => deleteFile(pet.name, file.url)}
                          >
                            Delete
                          </button>
                          <button
                            className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-slate-100 rounded-md sm:h-3/4 sm:w-full py-2 mb-2 px-2"
                            onClick={() => downloadFile(file.name, file.url)}
                          >
                            Download
                          </button>
                        </section>
                      </div>
                    ))
                  )}
                  <section className="flex flex-col xl:flex-row p-2 items-center sm:justify-between border-2 border-slate-700 rounded-md">
                    <p className="text-slate-100"> Upload a new file:</p>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept=".txt, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, application/zip, application/x-rar-compressed, application/x-7z-compressed, application/gzip, application/x-tar, application/x-gtar, application/x-gzip, application/x-bzip2, application/x-xz"
                      onChange={(e) => handleSelectedFile(e)}
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-block px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600 w-48 text-center"
                    >
                      Choose a File
                    </label>
                    <section className="text-sm w-36 text-slate-100 flex items-center justify-center">
                      <span
                        className=" overflow-hidden whitespace-nowrap overflow-ellipsis h-8 px-2"
                        style={{
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {selectedFile?.name}
                      </span>
                    </section>

                    <button
                      className={`${uploadFileBtnState} bg-slate-800 text-slate-100 rounded-md px-2 py-2 m-1 w-48`}
                      onClick={() =>
                        handleFileUpload(name, () => {
                          setFileChanged(!fileChanged);
                        })
                      }
                    >
                      Upload file
                    </button>
                  </section>
                </div>
              }
            />
            <section>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-full shadow w-64 sm:w-80 cursor-pointer">
                <Link to={`/mypets/${name}/statistics`}>
                  View {name}'s Statistics
                </Link>
              </button>
            </section>
          </div>
        </section>
      </article>
      {showPopup ? (
        <Popup
          onClose={closePopup}
          content={popupContent}
          background={background}
        />
      ) : null}
    </div>
  );
}

export default PetDetails;
