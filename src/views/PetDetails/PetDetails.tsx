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
        setPopupContent(<p>Could not update pet information</p>);
        setTimeout(closePopup, 1000);
      }
    });
  };

  const handleImageUpload = async (name: string) => {
    const user = auth.currentUser;

    if (!selectedImage || !user) {
      setPopupContent(<p>Please select an image to upload</p>);
      triggerPopup("");

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

      const imageRef = ref(imagesFolderRef, selectedImage.name);

      await uploadBytesResumable(imageRef, selectedImage, {
        contentType: selectedImage.type,
      });

      const imageUrl = await getDownloadURL(imageRef);
      const userRef = doc(db, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User document does not exist!");
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const petIndex = await pets.findIndex(
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

  const handleFileUpload = async (
    name: string,
    onUploadComplete: () => void
  ) => {
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
      console.log("Uploaded file URL:", fileUrl);
      const userRef = doc(db, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User document does not exist!");
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const petIndex = await pets.findIndex(
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
      console.log("Updated data in Firestore:", (await getDoc(userRef)).data());
      setSelectedFile(null);
      setSelectedImage(null);
      onUploadComplete();
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
          setPopupContent(<p>Please sign in to view this page</p>);
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
      console.error("User document does not exist!");
      return null;
    }

    const pets = (await userDoc.data()?.pets) ?? [];
    const pet = await pets.find(
      (pet: { name: string }) => pet.name === petName
    );

    if (!pet) {
      console.error(`Pet with name ${petName} not found!`);
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
      } catch (error) {
        console.error(error);
      }
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
      console.log("File URL from Firestore:", fileUrl);
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
      } catch (error) {
        console.error(error);
      }
    }
    return result;
  }

  async function getImageDownloadUrls(
    petName: string,
    imageUrl: string,
    imageName: string
  ) {
    console.log("getImageDownloadUrls");
    const userUid = getAuth().currentUser!.uid;

    if (userUid !== null || userUid !== undefined) {
      const userRef = doc(db, `users/${userUid}`);

      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error("User document does not exist!");
        return;
      }

      const pets = (await userDoc.data()?.pets) ?? [];
      const pet = await pets.find(
        (pet: { name: string }) => pet.name === petName
      );

      if (!pet) {
        console.error(`Pet with name ${petName} not found!`);
        return;
      }

      const imageUrls = pet.images ?? [];

      if (imageUrls.includes(imageUrl)) {
        await downloadImage(imageUrl, imageName);
      } else {
        console.error(`Image URL ${imageUrl} not found in the pet's images!`);
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
    } catch (error) {
      console.error(error);
    }
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
    } catch (error) {
      console.error(error);
    }
  }

  const deleteImage = async (petName: string, imageUrl: string) => {
    try {
      // Update pet document in Firestore
      setPopupContent(<p>Deleting image...</p>);
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
        setPopupContent(<p>Image deleted sucessfully</p>);
        setTimeout(() => {
          closePopup();
        }, 1000);
      }
      // Close the popup
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFile = async (petName: string, fileUrl: string) => {
    try {
      console.log("deleteFile");
      triggerPopup("");
      setPopupContent(<p>Deleting file...</p>);
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

      setPopupContent(<p>File deleted!</p>);
      setTimeout(() => {
        closePopup();
      }, 1000);
      setFileChanged(!fileChanged);
    } catch (error) {
      console.error(error);
    }
  };

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && name) {
        getImageUrls(user.uid, name).then((urls) => setImageObject(urls));
        getFileUrls(user.uid, name).then((urls) => setFileObject(urls));
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
              <img
                className="h-32 w-96 rounded-lg object-cover my-4"
                src={imageObject.length > 0 ? imageObject[0].url : ""}
                alt="pet-image"
              />
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
                              <article className="max-w-3/4 max-h-3/4 w-full flex flex-col">
                                <img
                                  className=" object-contain max-w-xs max-h-xs w-full h-full rounded-lg shadow-md my-2 mx-2"
                                  src={image.url}
                                />
                                <section className="flex justify-between w-full">
                                  <button
                                    className="bg-red-500 text-slate-100 rounded-md px-4 py-3 mt-2"
                                    title="This will delete the image from your account. There is no way to undo this action."
                                    onClick={() =>
                                      deleteImage(pet.name, image.url)
                                    }
                                  >
                                    Delete image
                                  </button>
                                  <button
                                    className="bg-slate-800 text-slate-100 rounded-md px-4 py-3 mt-2"
                                    title="This will open a new tab where you can download the image by right clicking and selecting 'Save image as...'"
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
                      onChange={(e) => setSelectedImage(e.target.files?.[0])}
                    />
                    <label
                      className="inline-block px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600  w-48 text-center"
                      htmlFor="img-input"
                    >
                      Choose an Image
                    </label>
                    <span className="text-sm text-slate-100 sm:self-center sm:text-center py-4 p-1">
                      {selectedImage?.name}
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
                  {fileObject.length === 0 || isFetching ? (
                    <p className="p-4">No files found</p>
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
                          <span className="text-sm w-36 text-slate-100">
                            {file.name}
                          </span>
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
                  <section className="flex flex-col xl:flex-row p-2 items-center sm:justify-between border-2 border-slate-700 rounded-md">
                    <p className="text-slate-100"> Upload a new file:</p>
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
                    <span className="text-md text-slate-100  self-center text-center my-2 p-1 border rounded-md">
                      {selectedFile?.name}
                    </span>
                    <button
                      className="bg-slate-800 text-slate-200 rounded-md px-2 py-2 m-1 w-48"
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
              <button className="inline-block px-8 py-4 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600 w-76 text-center">
                <Link to={`/mypets/${name}/weightstatistics`}>
                  Start tracking {name}'s weight.
                </Link>
              </button>
            </section>
          </div>
        </section>
      </article>
      {showPopup ? <Popup onClose={closePopup} content={popupContent} /> : null}
    </div>
  );
}

export default PetDetails;
