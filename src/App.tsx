import React, { useState } from "react";
import "./App.scss";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDQPK4iRVv-o7w9hUoe0G6dxT-6z8Egros",
  authDomain: "pet-tracker-6f201.firebaseapp.com",
  databaseURL:
    "https://pet-tracker-6f201-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pet-tracker-6f201",
  storageBucket: "pet-tracker-6f201.appspot.com",
  messagingSenderId: "199253025739",
  appId: "1:199253025739:web:0f3123376697022f25cc4e",
  measurementId: "G-QW0VRWWCVW",
};

const app = initializeApp(firebaseConfig);

interface Pet {
  name: string;
  age?: Date | undefined;
  activity: string;
  food: string;
  outside: number;
  playtime: number;
  vetCheckupDate?: Date;
}

const App: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<Date | undefined>(undefined);
  const [activity, setActivity] = useState<string>("");
  const [food, setFood] = useState<string>("");
  const [outside, setOutside] = useState<number>(0);
  const [playtime, setPlaytime] = useState<number>(0);
  const [vetCheckupDate, setVetCheckupDate] = useState<Date | undefined>(
    undefined
  );

  const handleAddPet = (): void => {
    const newPet: Pet = {
      name: name,
      age: age,
      activity: activity,
      food: food,
      outside: outside,
      playtime: playtime,
      vetCheckupDate: vetCheckupDate,
    };
    setPets([...pets, newPet]);
    setName("");
    setAge(undefined);
    setActivity("");
    setFood("");
    setOutside(0);
    setPlaytime(0);
    setVetCheckupDate(undefined);
  };

  return (
    <div className="wrapper">
      <h1>Pet Tracker</h1>
      <div className="input_container">
        <label htmlFor="name">Namn:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="input_container">
        <label htmlFor="age">Födelsedatum:</label>
        <input
          id="age"
          type="date"
          value={age?.toISOString().substr(0, 10) || ""}
          onChange={(e) => setAge(new Date(e.target.value))}
        />
      </div>
      <div className="input_container">
        <label htmlFor="activity">Aktivitet (i minuter):</label>
        <input
          id="activity"
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
      </div>
      <div className="input_container">
        <label htmlFor="food">Mat (i gram):</label>
        <input
          id="food"
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />
      </div>
      <div className="input_container">
        <label htmlFor="outside">Utomhustid (i minuter):</label>
        <input
          id="outside"
          type="number"
          value={outside}
          onChange={(e) => setOutside(parseInt(e.target.value))}
        />
      </div>
      <div className="input_container">
        <label htmlFor="playtime">Lektid (i minuter):</label>
        <input
          id="playtime"
          type="number"
          value={playtime}
          onChange={(e) => setPlaytime(parseInt(e.target.value))}
        />
      </div>
      <div className="input_container">
        <label htmlFor="vetCheckupDate">Veterinär besök:</label>
        <input
          id="vetCheckupDate"
          type="date"
          value={vetCheckupDate?.toISOString().substr(0, 10) || ""}
          onChange={(e) => setVetCheckupDate(new Date(e.target.value))}
        />
      </div>
      <button onClick={handleAddPet}>Add Pet</button>
      <table>
        <thead>
          <tr>
            <th>Namn</th>
            <th>Födelsedatum</th>
            <th>Utomhustid</th>
            <th>Mat</th>
            <th>Aktivitet</th>
            <th>Lektid</th>
            <th>Vet Checkup Date</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet, index) => (
            <tr key={index}>
              <td>{pet.name}</td>
              <td>{pet.age?.toLocaleDateString() || "N/A"}</td>
              <td>{pet.activity + " minuter"}</td>
              <td>{pet.food + " gram"}</td>
              <td>{pet.outside + " minuter"}</td>
              <td>{pet.playtime + " minuter"}</td>
              <td>{pet.vetCheckupDate?.toLocaleDateString() || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
