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
  heading: string;
  description: string;
}

function ImageCarousel() {
  const carouselItems: CarouselItem[] = [
    {
      text: "Tracker",
      icon: BsBriefcase,
      image: trackImage,
      outlineColor: "border border-solid border-red-500",
      heading: "Built For The Job Search",
      description:
        "Seamlessly manage your job applications with ease using our intuitive tracker feature, ensuring you never miss an opportunity.",
    },
    {
      text: "Calendar",
      icon: FiCalendar,
      image: calendarImage,
      outlineColor: "border border-solid border-green-500",
      heading: "Color Coded Calendar",
      description:
        "Effortlessly plan and prepare for upcoming interviews by visualizing them with color-coded clarity, helping you manage your schedule with ease.",
    },
    {
      text: "Metrics",
      icon: SiBaremetrics,
      image: metricsImage,
      outlineColor: "border border-solid border-blue-500",
      description:
        "Analyze skills demand and application trends to understand market requirements to better hone your craft.",
      heading: "Unlock The Necessary skills",
    },
    {
      text: "Match",
      icon: GiSkills,
      image: jobpostingcardsImage,
      outlineColor: "border border-solid border-yellow-500",
      description:
        "Evaluate your skill set against job requirements to identify the best-fit opportunities, empowering you to make informed career decisions.",
      heading: "Job Requirement Matching",
    },
    {
      text: "Offer",
      icon: TbConfetti,
      image: offerconfettiImage,
      outlineColor: "border border-solid border-purple-500",
      description:
        "Celebrate the thrilling moment of receiving a job offer with a joyous feature, marking the beginning of your exciting journey.",
      heading: "Celebrate Your Offer!",
    },
    {
      text: "Salary",
      icon: HiCurrencyDollar,
      image: moneyconfettiImage,
      outlineColor: "border border-solid border-orange-500",
      description:
        "Log and celebrate your job offer with a celebratory display, marking the milestone with joy and excitement. Congratulations, you did it!",
      heading: "The Celebration Continues!",
    },
  ];

  const [currentImage, setCurrentImage] = useState<CarouselItem>(
    carouselItems[0]
  );

  const handleImageClick = (item: CarouselItem) => {
    setCurrentImage(item);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 md:flex md:flex-row md:justify-center justify-center sm:justify-start">
        {carouselItems.map((item, index) => (
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
        <div className="w-full max-w-2xl mx-auto rounded">
          <Image
            src={currentImage.image}
            alt={currentImage.text}
            width={800}
            height={800}
          />
        </div>
        <button
          className={`border border-solid rounded-lg px-4 py-3 mt-4 focus:outline-none w-72 ${currentImage.outlineColor}`}
        >
          <p className="font-semibold text-left text-lg text-white">
            {currentImage.heading}
          </p>
          <p className="text-left text-white text-sm">
            {currentImage.description}
          </p>
        </button>
      </div>
    </div>
  );
};

export default ImageCarousel;
