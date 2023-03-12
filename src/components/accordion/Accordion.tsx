import React, { useState } from "react";

type AccordionProps = {
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ title, content, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <article className="border rounded shadow bg-white transition duration-500 ease-in-out overflow-hidden mb-2 py-4">
      <div
        className="w-full py-2 px-4 text-gray-700 cursor-pointer text-2xl flex justify-between items-center"
        onClick={toggleAccordion}
      >
        {title}
        {icon}
      </div>
      {isOpen && <div className="px-4 pb-2 h-44">{content}</div>}
    </article>
  );
};

export default Accordion;
