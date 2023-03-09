import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className=" bg-gray-800 flex justify-center items-center">
      <div className="h-screen bg-cover bg-center flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-14 text-slate-100">
          Welcome to Pet Folio
        </h1>
        <p className="text-lg mt-0 text-slate-100 m-14">
          Keeping track of your pets has never been easier
        </p>

        <section className="w-full flex justify-between items-center flex-col h-64">
          <button
            onClick={() => navigate("/about")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow w-3/4"
          >
            Read about our features here
          </button>
          <p className=" text-slate-100 text-xl">Or if you feel ready</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow w-3/4"
            onClick={() => (window.location.href = "/register")}
          >
            Register now
          </button>
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline m-4"
            href="/signin"
          >
            Or click here to sign in with google
          </a>
        </section>
      </div>
    </div>
  );
}
