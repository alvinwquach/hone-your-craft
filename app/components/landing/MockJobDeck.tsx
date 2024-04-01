"use client";

import React, { useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import PercentageBar from "../metrics/PercentageBar";
import styles from "../landing/styles.module.css";

const mockJobPostings = [
  {
    company: "Bookface",
    title: "Web Engineer",
    skills: ["TypeScript", "React", "Next.js"],
    matchingSkills: ["TypeScript", "React", "Next.js", "Sanity.io"],
    missingSkills: [],
  },
  {
    company: "Digital Nomads",
    title: "Senior Software Engineer",
    skills: ["JavaScript", "Angular", "Node.js", "PostgreSQL", "GraphQL"],
    matchingSkills: ["JavaScript", "Angular", "Node.js", "GraphQL"],
    missingSkills: ["PostgreSQL"],
  },
  {
    company: "Tech Innovations",
    title: "Data Scientist",
    skills: ["R", "Python", "SQL", "JavaScript", "GraphQL"],
    matchingSkills: ["R", "Python", "SQL"],
    missingSkills: ["JavaScript", "GraphQL"],
  },
  {
    company: "Tech Genius",
    title: "Mobile App Developer",
    skills: ["JavaScript", "Vue", "Node.js", "MongoDB"],
    matchingSkills: ["JavaScript", "Vue"],
    missingSkills: ["React Native", "Node.js"],
  },
  {
    company: "Codecrafters",
    title: "DevOps Engineer",
    skills: ["Linux", "Bash", "AWS", "Docker", "Kubernetes"],
    matchingSkills: ["Linux", "Bash"],
    missingSkills: ["AWS", "Docker", "Kubernetes"],
  },
];

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1, y: 0 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(0deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

export default function MockJobDeck() {
  const [gone] = useState(() => new Set());
  const [props, api] = useSprings(mockJobPostings.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above

  const bind: any = useDrag(
    ({
      args: [index],
      down,
      movement: [mx, my],
      direction: [xDir],
      velocity,
    }) => {
      const xVelocity = velocity;
      const trigger = Math.abs(mx) > 1 || Math.abs(my) > 1; // If you flick hard enough it should trigger the card to fly out
      const dir = -1; // -1 direction is only left and 1 is direction right (xDir gives the direction)
      if (trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out

      api.start((i) => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth / 2) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? dir * 10 * xVelocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = down ? 1.1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      if (!down && gone.size === mockJobPostings.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );

  return (
    <div className={styles.container}>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          <animated.div
            {...bind(i)}
            className="md:w-[366px] md:h-[549px] w-[292px] h-[452px]"
            style={{
              transform: interpolate([rot, scale], trans),
            }}
          >
            <MockJobCard {...mockJobPostings[i]} />
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
}

interface MockJobCardProps {
  company: string;
  title: string;
  skills: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

function MockJobCard({
  company,
  title,
  skills,
  matchingSkills,
  missingSkills,
}: MockJobCardProps) {
  const matchedSkillsCount = matchingSkills.filter((skill) =>
    skills.includes(skill)
  ).length;
  const matchPercentage = Math.round(
    (matchedSkillsCount / skills.length) * 100
  );

  const renderSkills = (skills: string[]) => {
    return skills.map((skill, index) => (
      <span
        key={index}
        className="bg-gray-600 text-white rounded-lg px-3 py-1 text-sm font-semibold mr-2 mb-2"
      >
        {skill}
      </span>
    ));
  };

  return (
    <div
      className="group relative overflow-hidden border border-gray-700 bg-gray-800 shadow-lg rounded-lg p-4 mb-4 max-w-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:bg-gray-900"
      style={{ height: "350px" }}
    >
      <h2 className="text-base font-bold mb-2 text-gray-200">{title}</h2>
      <p className="text-gray-400 mt-2 mb-4 text-lg font-bold">{company}</p>
      <div className="mb-4">
        <p className="text-gray-400 mb-2">
          Match Percentage:{" "}
          <span
            className={`font-semibold ${
              matchPercentage >= 80
                ? "text-green-500"
                : matchPercentage >= 50
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {isNaN(matchPercentage) ? "0%" : `${matchPercentage}%`}
          </span>
        </p>
        <PercentageBar matchPercentage={matchPercentage} />
      </div>
      <div>
        <p className="text-gray-400 mb-2">Matching Skills:</p>
        <div className="flex flex-wrap items">
          {renderSkills(matchingSkills)}
        </div>
      </div>
      {missingSkills.length > 0 && (
        <div>
          <p className="text-gray-400 mb-2">Missing Skills:</p>
          <div className="flex flex-wrap items">
            {renderSkills(missingSkills)}
          </div>
        </div>
      )}
    </div>
  );
}
