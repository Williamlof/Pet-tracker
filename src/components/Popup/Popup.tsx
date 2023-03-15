import React from "react";

interface PopupProps {
  onClose: () => void;
  content: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ onClose, content }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-slate-900 bg-opacity-90">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <button
          className="relative bottom-4 left-80 m-3 text-gray-600 text-xl hover:text-gray-800"
          onClick={onClose}
        >
          X
        </button>
        {content}
      </div>
    </div>
  );
};

export default Popup;
