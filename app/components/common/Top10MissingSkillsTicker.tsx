"use client";

import { useEffect, useState, useRef } from "react";
import { getUserJobMissingSkillsAndFrequency } from "@/app/actions/getUserJobMissingSkillsAndFrequency";
import { gsap } from "gsap";
import { FaTimes } from "react-icons/fa";

function Top10MissingSkillsTicker() {
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [missingSkillsFrequency, setMissingSkillsFrequency] = useState<
    number[]
  >([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMissingSkillsData() {
      try {
        const { sortedMissingSkills, sortedMissingFrequencies } =
          await getUserJobMissingSkillsAndFrequency();
        setMissingSkills(sortedMissingSkills);
        setMissingSkillsFrequency(sortedMissingFrequencies);
      } catch (error) {
        console.error("Error fetching missing skills:", error);
      }
    }
    fetchMissingSkillsData();
  }, []);

  useEffect(() => {
    if (missingSkills.length > 0 && tickerRef.current) {
      const tickerElement = tickerRef.current;

      const containerWidth = tickerElement.clientWidth;
      tickerElement.innerHTML += tickerElement.innerHTML;

      const totalWidth = tickerElement.scrollWidth;

      gsap.fromTo(
        tickerElement,
        {
          x: 0,
        },
        {
          x: -totalWidth / 2,
          ease: "none",
          duration: (totalWidth / containerWidth) * 20,
          repeat: -1,
          onRepeat: () => {
            tickerElement.style.transition = "none";
            tickerElement.style.transform = "translateX(0)";
            requestAnimationFrame(() => {
              tickerElement.style.transition = "transform 0s";
            });
          },
        }
      );
    }
  }, [missingSkills]);

  return (
    <div
      className={`pb-1 fixed bottom-12 2xl:bottom-0 left-0 right-0 z-40 bg-black text-white transition-all duration-300`}
    >
      <div className="relative overflow-hidden w-full h-12">
        <div className="flex whitespace-nowrap h-full" ref={tickerRef}>
          {missingSkills.map((skill, index) => (
            <div
              key={skill}
              className="flex items-center  space-x-2 h-full text-xs"
            >
              <span className="font-bold">{skill}</span>
              <span className="ml-2 text-gray-400">
                ({missingSkillsFrequency[index]})
              </span>
              <FaTimes className="w-4 h-4 text-red-400 cursor-pointer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Top10MissingSkillsTicker;
