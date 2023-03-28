import React from "react";

export default function Error() {
  return (
    <div className="bg-gradient-to-b from-slate-900  to-slate-700 flex justify-evenly items-center flex-col-reverse sm:flex-col pt-24 min-h-screen">
      <h1 className=" text-6xl text-slate-200">
        Error 404 <br />
        This wasn't supposed to happen
      </h1>
      <a
        className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-full shadow w-64 sm:w-96 cursor-pointer text-center"
        href="/home"
      >
        Take me Home
      </a>
      <div className="sm:h-full sm:flex sm:items-center justify-center top-40 sm:static">
        <svg
          className=" absolute right-64 bottom-64 w-20 h-20 scale-150 sm:scale-300 md:scale-400 lg:scale-400 xl:animate-wiggle"
          fill="black"
          fillRule="evenodd"
        >
          <path
            d="M27,55.25a31.24,31.24,0,0,0-2.1,3.8A18.46,18.46,0,0,0,23.1,65.7a10.22,10.22,0,0,0,.1,2.55,5.18,5.18,0,0,0,.35.95q1.7,3,9.05,5.25a30.21,30.21,0,0,1,.9-7.55l-1,2.3q-1.3,2.1-2.7,1.05a7.56,7.56,0,0,1-.45-1.75,14.13,14.13,0,0,1,.45-5.5,16.16,16.16,0,0,1,2.9-6.75,17.48,17.48,0,0,1,13.5-7.9q-8.3-2.55-14.6,2a15.05,15.05,0,0,0-4.6,4.9m28.2-9v.1a19.94,19.94,0,0,1,8.1-.7q9,1.05,13.5,9.5L78.1,57.6q.9,2.5-1.4,2.55a5.8,5.8,0,0,1-2.3-1.55l3.55,5.5a23.12,23.12,0,0,0,3.7-4q3.25-4.35,1.6-7.2a28.65,28.65,0,0,0-5.6-6.15q-6.4-5.3-13-5.3a7.34,7.34,0,0,0-3.9,1,18.61,18.61,0,0,0-5.6,3.85m-.6,28.1a2,2,0,0,1-1.1-1.45.94.94,0,0,1,.85-1,5.65,5.65,0,0,0-2.4.9q-.8.45-.3,2.05A3.15,3.15,0,0,0,54,77.05a5.91,5.91,0,0,0,3.1.3,8.23,8.23,0,0,0,2.8-1.7A3.22,3.22,0,0,0,61,72.2q-.75-1.7-4.15-.75,2.25-.1,1.55,1.5a3,3,0,0,1-1.7,1.8,3,3,0,0,1-2.2-.4m-5.7-6.95a2.78,2.78,0,0,0-.5-1.1q-.6-.7-1.1-.6a1.2,1.2,0,0,0-.85.85,3.63,3.63,0,0,0-.15,2,3.29,3.29,0,0,0,.7,1.7q.55.7,1.1.6t.9-.95a4.05,4.05,0,0,0,0-1.8,1.11,1.11,0,0,0,0-.35,2.2,2.2,0,0,1-.2.9.91.91,0,0,1-.7.6,1.1,1.1,0,0,1-.85-.35,1.68,1.68,0,0,1-.5-.9,3.16,3.16,0,0,1,.1-1.15,1.29,1.29,0,0,1,.8-.4.76.76,0,0,1,.85.25,1.5,1.5,0,0,1,.45.7M63.3,64.8a3.12,3.12,0,0,0-.7-1.8q-.55-.7-1-.6a1.32,1.32,0,0,0-.9.85,4.13,4.13,0,0,0-.1,1.3,2.55,2.55,0,0,1,.15-.9.91.91,0,0,1,.7-.45,1.06,1.06,0,0,1,.9.25,1.75,1.75,0,0,1,.45,1,2.44,2.44,0,0,1-.1,1,1.31,1.31,0,0,1-.75.55.82.82,0,0,1-.85-.35,1.52,1.52,0,0,1-.5-.9,1.64,1.64,0,0,0,0,.4,3.46,3.46,0,0,0,.65,1.8,1.32,1.32,0,0,0,1.1.65q.55-.1.85-.95a3.35,3.35,0,0,0,.1-1.85m3.75-43q0-1.6-2.55-3.3-3.25-2.35-8-.45a2.62,2.62,0,0,1,1.8-2.5l-1.4-.05a9.37,9.37,0,0,0-2.95.75q-4.25,2.15-3.65,8.8l-2.4-2.5Q45.7,21.7,47.4,30A2.81,2.81,0,0,0,48,30l5-.2,1.7.2a24.24,24.24,0,0,1,5.15-5.75Q64,21.15,67.05,21.75Z"
            transform="translate(-18.23 -14.95)"
          ></path>
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M44.74,88.53a2.89,2.89,0,0,1-1.61-.84,21.1,21.1,0,0,1-1.9-2,25.52,25.52,0,0,1-4.49-6.95,4.31,4.31,0,0,1-1,1.34,1.84,1.84,0,0,1-1.65.49c-.58-.16-1-.68-1.35-1.59l-.17-.58-4.35,1.48c-3.71,1.09-5.83,1.14-6.69.16a11.44,11.44,0,0,1-2-3.44c-1.12-2.91-1.48-4.94-1.12-6.23a3.39,3.39,0,0,1,1.44-2.15,5.37,5.37,0,0,1,2.81-.61,12.4,12.4,0,0,1,0-2A18.91,18.91,0,0,1,24.33,59C22.49,45.87,26.77,36.89,37,32.29a36.65,36.65,0,0,1,9.76-2.67c-1.1-5.64-.59-6.94,0-7.43A1.16,1.16,0,0,1,48,22a.51.51,0,0,1,.19.12l1.47,1.53c-.06-3.89,1.28-6.56,4-7.93A9.9,9.9,0,0,1,56.8,15l1.46,0a.5.5,0,0,1,.12,1,1.84,1.84,0,0,0-1.25,1.24c3-1,5.56-.7,7.66.82,1.81,1.23,2.72,2.44,2.76,3.69a.5.5,0,0,1-.18.4.51.51,0,0,1-.42.11c-1.85-.37-4.16.44-6.86,2.41a22,22,0,0,0-4.55,5c8.31,1.17,14.59,4.23,18.69,9.12a16.44,16.44,0,0,1,3.89,7.76,29.06,29.06,0,0,1,5.55,6.14c1.22,2.1.67,4.71-1.62,7.77a23.53,23.53,0,0,1-3.47,3.81l.32.62c2.89-1,5-1.11,6.52-.27a4.39,4.39,0,0,1,2.07,3.2,17.07,17.07,0,0,1,0,6c-.48,2.94-2.7,4.35-6.56,4.22A18,18,0,0,1,76,77.1a12.61,12.61,0,0,1-.55,1.78,10.89,10.89,0,0,1-2.26,3.32.93.93,0,0,1-1.36-.1A3.09,3.09,0,0,1,71.36,80L68.5,83.8c-1.87,2-3.21,2.74-4.26,2.42a2.18,2.18,0,0,1-1.35-1.69L60,85.71a13.36,13.36,0,0,1-5.19,1,.48.48,0,0,1,0,.11,1.79,1.79,0,0,1-1,1.49c-1.44.61-4.07-.18-8.22-2.45a6,6,0,0,1,.16,1.45,1.17,1.17,0,0,1-.59,1.15A.9.9,0,0,1,44.74,88.53Zm-.09-1Zm-8-10.82a.5.5,0,0,1,.48.35,23,23,0,0,0,4.8,8,20,20,0,0,0,1.81,1.85,2.77,2.77,0,0,0,.89.59,1.08,1.08,0,0,0,0-.23,2.71,2.71,0,0,0-1-2.46.5.5,0,0,1,.52-.85c5.94,3.49,8.23,3.78,9.1,3.42a.75.75,0,0,0,.43-.62l-.13-.56a.5.5,0,0,1,.13-.47.49.49,0,0,1,.47-.13c1.2.28,3,0,5.37-.83l3.43-1.39a.5.5,0,0,1,.43,0,.5.5,0,0,1,.25.35c.1.61.33,1.36.78,1.5.29.08,1.18,0,3.21-2.11L71.6,78a.5.5,0,0,1,.9.36c-.28,2.25-.07,2.89,0,3.05a9.89,9.89,0,0,0,2-2.92,12.33,12.33,0,0,0,.62-2.14,22.5,22.5,0,0,0,.24-4.74l-.3-2.3a.5.5,0,0,1,.21-.48.49.49,0,0,1,.52,0c2.32,1.25,2.91,1,3,1a.91.91,0,0,0,.38-1.12.44.44,0,0,1,0-.07,8.75,8.75,0,0,0-1-2.92h0q-.29-.63-.67-1.3L74,58.87a.5.5,0,0,1,.82-.57,5.19,5.19,0,0,0,2,1.35,1.23,1.23,0,0,0,.94-.35c.19-.28.15-.8-.1-1.52l-1.32-2.38c-2.88-5.46-7.29-8.57-13.12-9.25a19.52,19.52,0,0,0-7.89.68.5.5,0,0,1-.65-.48v-.1s0,0,0,0a.49.49,0,0,1,0-.16h0l0-.09h0l0,0c1.6-1.8,2.44-3.37,2.48-4.65-.77,0-1.86.59-3.11,1.84a13.92,13.92,0,0,0-2,2.33.5.5,0,0,1-.89-.13c-1-3.07-2.17-5-3.39-5.78a1.73,1.73,0,0,0-1.21-.35c-.8.85-.78,2.18.08,4.07A12.21,12.21,0,0,0,48.34,46a.5.5,0,0,1-.66.73,11.07,11.07,0,0,0-5-2,3,3,0,0,0-1.24.16c0,.71.77,1.41,2.19,2.09l2.69.93h0a.5.5,0,0,1,.24.22h0a.53.53,0,0,1,0,.12.49.49,0,0,1,0,.24.52.52,0,0,1,0,.1.5.5,0,0,1-.17.19l-.14.07-.1,0a17.07,17.07,0,0,0-13.12,7.68,15.76,15.76,0,0,0-2.82,6.55,13.86,13.86,0,0,0-.45,5.35,8.16,8.16,0,0,0,.36,1.5.89.89,0,0,0,.65.16c.38-.07.8-.47,1.22-1.15l1-2.24A.5.5,0,0,1,34,67a29.82,29.82,0,0,0-.88,7.41.42.42,0,0,1,0,.06,10.49,10.49,0,0,0,.29,3.17h0l.3,1c.27.72.54.9.67.94s.52-.12.74-.29a3.84,3.84,0,0,0,1.12-2.2.5.5,0,0,1,.46-.41ZM22.25,68.64a4.37,4.37,0,0,0-2,.5,2.48,2.48,0,0,0-.94,1.54c-.3,1.05.06,2.93,1.09,5.58a10.46,10.46,0,0,0,1.85,3.14c.26.3,1.31.83,5.64-.44l4.4-1.5a11.53,11.53,0,0,1-.23-2.66c-4.85-1.53-7.79-3.28-9-5.37a5.31,5.31,0,0,1-.31-.76A3.73,3.73,0,0,0,22.25,68.64Zm53.92,7.47a17.06,17.06,0,0,0,4.75.88c3.33.14,5.15-1,5.54-3.38a16.08,16.08,0,0,0,.05-5.68,3.4,3.4,0,0,0-1.57-2.52c-1.2-.67-3.08-.57-5.6.31a8.73,8.73,0,0,1,.81,2.74,1.89,1.89,0,0,1-.82,2.15c-.62.39-1.61.24-3.16-.5l.18,1.41A25.42,25.42,0,0,1,76.16,76.12Zm-52.48-8A4.65,4.65,0,0,0,24,69c1,1.77,3.74,3.39,8.12,4.8,0-1.28.12-2.49.26-3.61a2.42,2.42,0,0,1-1.38.91,1.9,1.9,0,0,1-1.54-.42.51.51,0,0,1-.15-.19,7.91,7.91,0,0,1-.49-1.87,14.69,14.69,0,0,1,.46-5.71,16.64,16.64,0,0,1,3-6.91,17.66,17.66,0,0,1,11.38-7.72,14.78,14.78,0,0,0-11.78,2.52,14.63,14.63,0,0,0-4.45,4.73,31.13,31.13,0,0,0-2.08,3.77,18.06,18.06,0,0,0-1.71,6.47A9.86,9.86,0,0,0,23.69,68.14Zm52.52-7.66,1.85,2.87a22.53,22.53,0,0,0,3.19-3.53c2-2.72,2.56-5,1.57-6.66a28.3,28.3,0,0,0-5.49-6C73.18,43.69,68.91,42,64.65,42a6.9,6.9,0,0,0-3.66.89,20.46,20.46,0,0,0-4.18,2.57,21.91,21.91,0,0,1,6.5-.25c6.19.72,10.86,4,13.89,9.76l1.34,2.44a2.68,2.68,0,0,1,0,2.5,2.15,2.15,0,0,1-1.85.79.58.58,0,0,1-.21,0ZM47.43,30.55a35.94,35.94,0,0,0-10,2.66C28,37.42,23.89,45.54,25.14,57.34c.41-.78.88-1.57,1.39-2.36a15.56,15.56,0,0,1,4.73-5,15.47,15.47,0,0,1,10.49-3,2.62,2.62,0,0,1-1.29-2.52.5.5,0,0,1,.22-.34,3.36,3.36,0,0,1,2-.43,9.74,9.74,0,0,1,3.64,1.1c-.2-.37-.39-.76-.57-1.15-1.06-2.33-1-4.1.21-5.26a.51.51,0,0,1,.14-.09,2.39,2.39,0,0,1,2.21.37c1.32.83,2.47,2.6,3.51,5.43a15.07,15.07,0,0,1,1.6-1.71c1.75-1.75,3.21-2.41,4.44-2a.5.5,0,0,1,.34.43,5.22,5.22,0,0,1-.6,2.75,23.49,23.49,0,0,1,2.89-1.61,7.84,7.84,0,0,1,4.14-1h0c4.1,0,8.21,1.53,12.21,4.56a16.83,16.83,0,0,0-3.42-6.14c-4.06-4.84-10.41-7.83-18.87-8.87l-1.7-.2L48,30.5A2.59,2.59,0,0,1,47.43,30.55Zm.08-7.62-.07,0c-.19.16-.71,1.11.37,6.57h0l5.08-.21,1.48.17a23.77,23.77,0,0,1,5.1-5.63c2.6-1.9,4.92-2.8,6.91-2.67a5.64,5.64,0,0,0-2.2-2.3c-2-1.48-4.53-1.61-7.58-.4a.5.5,0,0,1-.68-.52,3.88,3.88,0,0,1,.74-2,8.87,8.87,0,0,0-2.59.69C51.47,18,50.36,20.71,50.75,25a.5.5,0,0,1-.86.39l-2.31-2.41Zm8.78,55a8.22,8.22,0,0,1-2.38-.42A3.62,3.62,0,0,1,51.12,75c-.41-1.3-.23-2.19.54-2.62a6.06,6.06,0,0,1,2.55-1h.14L56.78,71c2.52-.7,4.11-.35,4.72,1a3.72,3.72,0,0,1-1.23,4,8.59,8.59,0,0,1-3,1.8A3.92,3.92,0,0,1,56.29,78ZM53,72.84a3.84,3.84,0,0,0-.76.42c-.42.24-.29.94-.12,1.5a2.66,2.66,0,0,0,2.11,1.82,5.53,5.53,0,0,0,2.84.3,7.83,7.83,0,0,0,2.6-1.6,2.73,2.73,0,0,0,.94-3c-.22-.49-.77-.73-1.64-.71a1.56,1.56,0,0,1,0,1.55,3.5,3.5,0,0,1-2,2.08h0a3.47,3.47,0,0,1-2.56-.45A2.43,2.43,0,0,1,53,72.93S53,72.87,53,72.84Zm3.8,1.91h0Zm-2.38-2.3c-.39.1-.42.27-.42.45s.31.68.86,1a2.46,2.46,0,0,0,1.81.34A2.6,2.6,0,0,0,58,72.74c.14-.32.14-.51.09-.58s-.42-.24-1.13-.21l-2.51.49Zm-6.51-1.08a1.77,1.77,0,0,1-1.3-.81,3.78,3.78,0,0,1-.8-1.94,4.12,4.12,0,0,1,.18-2.25,1.66,1.66,0,0,1,1.23-1.16,1.68,1.68,0,0,1,1.57.77,3.3,3.3,0,0,1,.61,1.31h0a1.4,1.4,0,0,1,0,.17.51.51,0,0,1,0,.12v.1a1.69,1.69,0,0,1,.05.42,4.24,4.24,0,0,1,0,1.94c-.32.88-.79,1.31-1.38,1.31ZM47,69.44a2.24,2.24,0,0,0,.31.49c.18.23.42.47.63.43s.36-.2.52-.63l0-.13a1.5,1.5,0,0,1-.41.15A1.47,1.47,0,0,1,47,69.44Zm.17-2.31a2.85,2.85,0,0,0,0,.83,1.17,1.17,0,0,0,.33.56.72.72,0,0,0,.46.23.41.41,0,0,0,.3-.29,1.73,1.73,0,0,0,.16-.71v-.12l0-.08h0a1,1,0,0,0-.29-.47c-.16-.18-.24-.2-.39-.16l-.14,0A.67.67,0,0,0,47.19,67.13ZM53,70.65a.5.5,0,0,1-.34-.87A4,4,0,0,1,54.51,69l-.29-.22a1.24,1.24,0,0,0-.7.17.5.5,0,0,1-.55-.83,2.24,2.24,0,0,1,1.43-.33,12.5,12.5,0,0,1,1.58,0l1.7.25a.5.5,0,0,1-.15,1l-1.63-.25.2.15a.5.5,0,0,1-.3.9,6.3,6.3,0,0,0-.87.09,3.28,3.28,0,0,0-1.59.63A.5.5,0,0,1,53,70.65Zm9.29-2.55a1.84,1.84,0,0,1-1.44-.84,3.88,3.88,0,0,1-.75-2,2.15,2.15,0,0,1-.06-.49v-.18a4.61,4.61,0,0,1,.12-1.44,1.83,1.83,0,0,1,1.3-1.22,1.6,1.6,0,0,1,1.53.78,3.61,3.61,0,0,1,.8,2.06,3.76,3.76,0,0,1-.13,2.08,1.68,1.68,0,0,1-1.23,1.26Zm-.75-1.59.09.12c.15.19.45.5.67.47s.35-.4.43-.62a2.07,2.07,0,0,0,.13-.51,1.54,1.54,0,0,1-.89.52A1.24,1.24,0,0,1,61.54,66.51ZM61,64.69a1,1,0,0,0,.33.58c.21.26.32.25.42.24s.17,0,.4-.3a2,2,0,0,0,.05-.71,1.24,1.24,0,0,0-.31-.69.51.51,0,0,0-.44-.12.46.46,0,0,0-.38.23,2.52,2.52,0,0,0-.08.63v.1S61,64.68,61,64.69Z"
            transform="translate(-18.23 -14.95)"
          ></path>
        </svg>
      </div>
    </div>
  );
}
