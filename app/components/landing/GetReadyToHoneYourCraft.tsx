import Image from "next/image";
import suggestedSkillsImage from "../../../public/images/landing/suggestedskills.png";
import { rubik_scribble } from "@/utils/fonts";

function GetReadyToHoneYourCraft() {
  return (
    <section className="max-w-5xl mx-auto  sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24   !px-0">
      <div className="grid grid-cols-1 items-center gap-y-2 sm:gap-y-6 lg:grid-cols-12 lg:pt-0">
        <div className="px-5 flex flex-col pb-4 lg:-mt-[1rem] lg:col-span-5 items-center lg:items-start animate-fade-in-up overflow-visible">
          <h1
            className={`${rubik_scribble.className} text-4xl sm:text-6xl text-white uppercase leading-normal sm:leading-none"`}
          >
            {"Get"} <strong className={` font-semibold`}>ready</strong>
          </h1>
          <h2
            className={`${rubik_scribble.className} font-title text-4xl sm:text-6xl text-white uppercase py-4 sm:py-8"`}
          >
            to
          </h2>
          <h1
            className={`${rubik_scribble.className} uppercase text-4xl sm:text-6xl text-white uppercase"`}
          >
            <strong className="font-semibold">hone</strong>
          </h1>
          <h1
            className={`${rubik_scribble.className} text-4xl sm:text-6xl text-white uppercase py-4 sm:py-8"`}
          >
            your
          </h1>
          <h1
            className={` ${rubik_scribble.className} text-4xl sm:text-6xl text-white uppercase`}
          >
            <strong className="font-semibold">craft</strong>
          </h1>
          <h3 className="font-light pt-8 text-xl sm:text-2xl relative">
            Apply. Work smarter, not harder. Get close to your{" "}
            <span className="font-bold text-primary relative">
              <em>dream role.</em>
            </span>
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
