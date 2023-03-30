import React from "react";

interface PopupProps {
  onClose: () => void;
  content: React.ReactNode;
  background?: string;
}

const Popup: React.FC<PopupProps> = ({ onClose, content, background }) => {
  return (
    <div className="fixed inset-0 z-50 flex sm:justify-center sm:items-center h-full bg-slate-900 bg-opacity-90">
      <div
        className={`${background} rounded-lg shadow-lg p-4 pt-0 flex sm:justify-center flex-col w-full m-4 sm:w-2/6 sm:m-0 sm:p-2 h-1/4 sm:h-auto`}
      >
        <section className="self-end mt-2 mr-2">
          <button
            className=" bg-slate-800 text-slate-100 text-4xl h-12 w-12 rounded-lg cursor-pointer"
            onClick={onClose}
          >
            X
          </button>
        </section>
        <section className="self-center text-slate-800 w-96">{content}</section>
      </div>
    </div>
  );
};

export default Popup;
