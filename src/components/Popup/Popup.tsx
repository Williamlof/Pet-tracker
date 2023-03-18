import React from "react";

interface PopupProps {
  onClose: () => void;
  content: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ onClose, content }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-full bg-slate-900 bg-opacity-90">
      <div className="bg-white rounded-lg shadow-lg p-4 pt-0 max-h-screen flex justify-center flex-col">
        <section className="self-end">
          <button
            className=" p-1 my-2 bg-slate-800 text-slate-100 text-4xl h-12 w-12 rounded-lg cursor-pointer"
            onClick={onClose}
          >
            X
          </button>
        </section>

        {content}
      </div>
    </div>
  );
};

export default Popup;
