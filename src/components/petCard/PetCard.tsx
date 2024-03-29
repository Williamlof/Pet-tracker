import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
type petCardProps = {
  title: React.ReactNode;
  icon: any;
  image?: any;
  action?: any;
  petName: string;
};

const PetCard: React.FC<petCardProps> = ({
  title,
  icon,
  image,
  action,
  petName,
}) => {
  const navigate = useNavigate();
  return (
    <article
      className="w-full h-full mb-0 flex cursor-pointer justify-between"
      onClick={() => {
        navigate(`/mypets/${petName}/`);
      }}
    >
      <section className="flex self-start w-36 h-full">{image}</section>

      {title}
      {action}
    </article>
  );
};

export default PetCard;
