"use client";

import React, { useState } from "react";
import Image from "next/image";

import { StaticImageData } from "next/image";
import { TbConfetti } from "react-icons/tb";
import { BsBriefcase } from "react-icons/bs";
import { FiCalendar } from "react-icons/fi";
import { SiBaremetrics } from "react-icons/si";
import { HiCurrencyDollar } from "react-icons/hi";
import { GiSkills } from "react-icons/gi";

import calendarImage from "../../../public/images/landing/calendar.png";
import jobpostingcardsImage from "../../../public/images/landing/jobpostingcards.png";
import metricsImage from "../../../public/images/landing/metrics.png";
import moneyconfettiImage from "../../../public/images/landing/moneyconfetti.png";
import offerconfettiImage from "../../../public/images/landing/offerconfetti.png";
import trackImage from "../../../public/images/landing/track.png";

interface CarouselItem {
  text: string;
  icon: React.ElementType;
  image: StaticImageData;
  outlineColor: string;
}

const ImageCarousel: React.FC = () => {
  const carouselItem: CarouselItem[] = [
    {
      text: "Job Tracker",
      icon: BsBriefcase,
      image: trackImage,
      outlineColor: "border border-solid border-red-500",
    },
    {
      text: "Calendar",
      icon: FiCalendar,
      image: calendarImage,
      outlineColor: "border border-solid border-green-500",
    },
    {
      text: "Metrics",
      icon: SiBaremetrics,
      image: metricsImage,
      outlineColor: "border border-solid border-blue-500",
    },
    {
      text: "Match",
      icon: GiSkills,
      image: jobpostingcardsImage,
      outlineColor: "border border-solid border-yellow-500",
    },
    {
      text: "Offer",
      icon: TbConfetti,
      image: offerconfettiImage,
      outlineColor: "border border-solid border-purple-500",
    },
    {
      text: "Salary",
      icon: HiCurrencyDollar,
      image: moneyconfettiImage,
      outlineColor: "border border-solid border-orange-500",
    },
  ];

  const [currentImage, setCurrentImage] = useState<CarouselItem>(
    carouselItem[0]
  );

  const handleImageClick = (image: CarouselItem) => {
    setCurrentImage(image);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 md:flex md:flex-row md:justify-center justify-center sm:justify-start">
        {carouselItem.map((item, index) => (
          <button
            key={index}
            className={`px-4 py-1 m-1 rounded-md flex items-center justify-center focus:outline-none ${
              currentImage.text === item.text ? item.outlineColor : ""
            }`}
            onClick={() => handleImageClick(item)}
          >
            {React.createElement(item.icon, { className: "mr-1" })}
            {item.text}
          </button>
        ))}
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="w-full max-w-2xl mx-auto rounded-">
          <Image
            src={currentImage.image}
            alt={currentImage.text}
            width={800}
            height={800}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
