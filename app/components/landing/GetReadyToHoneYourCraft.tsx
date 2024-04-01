import Image from "next/image";
import suggestedSkillsImage from "../../../public/images/landing/suggestedskills.png";
import { rubik_scribble } from "@/utils/fonts";

function GetReadyToHoneYourCraft() {
  return (
    <section className="max-w-5xl mx-auto  sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24   !px-0">
      <div className="grid grid-cols-1 items-center gap-y-2 sm:gap-y-6 lg:grid-cols-12 lg:pt-0">
        <div className="px-5 flex flex-col pb-4 lg:-mt-[1rem] lg:col-span-5 items-center lg:items-start animate-fade-in-up overflow-visible">
          <div className="flex gap-x-4">
            <h1
              className={`${rubik_scribble.className} text-4xl sm:text-6xl text-white uppercase leading-normal sm:leading-none"`}
            >
              {"Get"}
            </h1>
            <strong className=" text-4xl sm:text-6xl text-white uppercase leading-normal sm:leading-none font-semibold">
              ready
            </strong>
          </div>
          <h2
            className={`${rubik_scribble.className} font-title text-4xl sm:text-6xl text-white uppercase py-4 sm:py-8"`}
          >
            to
          </h2>
          <h1
            className={` uppercase text-4xl sm:text-6xl text-white uppercase"`}
          >
            <strong className="font-semibold">hone</strong>
          </h1>
          <h1
            className={`${rubik_scribble.className} text-4xl sm:text-6xl text-white uppercase py-4 sm:py-8"`}
          >
            your
          </h1>
          <h1 className={` text-4xl sm:text-6xl text-white uppercase`}>
            <strong className="font-semibold">craft</strong>
          </h1>
          <h3 className="font-light pt-8 text-xl sm:text-2xl relative">
            Apply. Work smarter, not harder. Get closer to your{" "}
            <span className="font-bold text-primary relative">
              <em>dream role.</em>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              className="w-full"
            >
              <path
                d="M 0 40 
       C 100 10 200 50 300 40 
       S 400 70 500 30 
       S 600 60 700 40 
       S 800 20 900 40 
       S 1000 70 1100 50 
       S 1200 40 1300 70"
                stroke="black"
                stroke-width="3"
                fill="none"
              />
            </svg>
          </h3>
        </div>

        <div className="lg:col-span-7 mt-8 lg:-mt-20 flex items-end flex-1 relative h-[670px]">
          <Image
            src={suggestedSkillsImage}
            alt="An image of suggested skills"
            priority={true}
            fill={true}
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default GetReadyToHoneYourCraft;