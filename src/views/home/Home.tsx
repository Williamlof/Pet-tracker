import React from "react";

export default function Home() {
  return (
    <div className=" bg-gray-800 flex justify-center items-center">
      <div className="h-full w-5/6 bg-slate-600 rounded-lg p-6 m-6 mt-24">
        <h1 className="text-slate-100 text-2xl">
          Welcome to PetFolio, the ultimate tool for keeping track of your
          animals' vital information!
        </h1>
        <br />
        <p className="text-slate-100 text-xl tracking-wide ">
          With PetFolio, you can easily manage your animals' health records,
          feeding schedules, and more. Whether you have a furry (or non-furry)
          friend at home or run a large-scale breeding operation, our app makes
          it easy to stay organized and informed about your animals. Record your
          animal's weight, store veterinary records, upload images and notes,
          track feeding schedules, set reminders, and more. Our app is easy to
          use and navigate, and you can access your animals' records from
          anywhere, at any time, using your desktop computer, tablet, or
          smartphone.
        </p>
        <p className="text-slate-100 text-xl tracking-wide ">
          <br />
          Try PetFolio today and see how easy it is to keep track of your
          animals' information!
        </p>

        <section className="w-full flex justify-between items-center flex-col h-32">
          <button
            className="w-3/4
              bg-slate-800  text-slate-100  p-4 pr-10 pl-10 rounded-lg mt-4 text-xl"
            onClick={() => (window.location.href = "/register")}
          >
            Register now
          </button>
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="/login"
          >
            Or click here to sign in with google
          </a>
        </section>
      </div>
    </div>
  );
}
