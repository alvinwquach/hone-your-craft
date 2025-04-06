"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { rubik_scribble } from "@/utils/fonts";

gsap.registerPlugin(TextPlugin);

const roles = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "Technical Program Manager",
  "AI Researcher",
  "Cloud Engineer",
];

function GetReadyToHoneYourCraft() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const timeline = gsap.timeline({ repeat: -1 });

    roles.forEach((role, index) => {
      timeline
        .to(element, {
          duration: role.length * 0.05,
          text: role,
          ease: "none",
        })
        .to(element, {
          duration: 1.5,
        })
        .to(element, {
          duration: 0.8,
          text: "",
          ease: "none",
        })
        .to(element, {
          duration: 0.5,
        });
    });

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <section className="max-w-5xl mx-auto pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-y-6">
        <div className="flex flex-col items-center text-center sm:text-left sm:items-start animate-fade-in-up">
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-2">
            <h1
              className={`${rubik_scribble.className} text-4xl sm:text-6xl text-gray-900 uppercase leading-normal sm:leading-none`}
            >
              Get
            </h1>
            <strong className="text-4xl sm:text-6xl text-gray-900 uppercase leading-normal sm:leading-none font-semibold">
              ready
            </strong>
          </div>
          <h2
            className={`${rubik_scribble.className} text-4xl sm:text-6xl text-gray-900 uppercase py-4 sm:py-8`}
          >
            to
          </h2>
          <h1 className="text-4xl sm:text-6xl text-gray-900 uppercase">
            <strong className="font-semibold">hone</strong>
          </h1>
          <h1
            className={`${rubik_scribble.className} text-4xl sm:text-6xl text-gray-900 uppercase py-4 sm:py-8`}
          >
            your
          </h1>
          <h1 className="text-4xl sm:text-6xl text-gray-900 uppercase">
            <strong className="font-semibold">craft</strong>
          </h1>
          <h3 className="lg:pl-0 pl-8 text-gray-800 pt-8 text-xl sm:text-2xl max-w-2xl mx-auto sm:mx-0">
            Apply. Work smarter, not harder. Get closer to your dream role as a{" "}
            <span className="font-bold text-primary inline-block min-w-[220px] sm:min-w-[280px]">
              <em>
                <span ref={textRef} className="inline-block"></span>
              </em>
            </span>
          </h3>
        </div>
      </div>
    </section>
  );
}

export default GetReadyToHoneYourCraft;
