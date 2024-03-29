import React, { useState } from "react";
import {
  faCaretUp,
  faCaretDown,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
type AccordionProps = {
  title: React.ReactNode;
  icon?: IconDefinition;
  content: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ title, content, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [caret, setCaret] = useState(faCaretDown);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
    isOpen ? setCaret(faCaretDown) : setCaret(faCaretUp);
  };

  return (
    <div className="h-full w-full mb-4 p-6 ">
      <section
        className="flex justify-between toggle-accordion cursor-pointer"
        onClick={toggleAccordion}
      >
        <p className="text-slate-200 text-lg">{title}</p>
        <p className="text-slate-200 text-lg">
          <FontAwesomeIcon icon={caret} />
        </p>
      </section>

      <article
        className="w-full bg-slate-600 overflow-hidden rounded-lg"
        style={{
          height: isOpen ? "auto" : "1px",
          overflow: isOpen ? "visible" : "hidden",
        }}
      >
        <div className="w-full py-2 px-2 text-gray-700 cursor-pointer text-2xl flex justify-between items-center"></div>
        {isOpen && (
          <div className="px-2 pb-2 w-full h-full flex flex-col">{content}</div>
        )}
      </article>
    </div>
  );
};

export default Accordion;
