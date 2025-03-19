import ImageCarousel from "./components/landing/ImageCarousel";
import Reveal from "./components/landing/Reveal";
import MockJobDeck from "./components/landing/MockJobDeck";
import Tool from "./components/landing/Tool";
import WhyHoneYourCraft from "./components/landing/WhyHoneYourCraft";
import GetReadyToHoneYourCraft from "./components/landing/GetReadyToHoneYourCraft";
import Section from "./components/common/Section";
import Pricing from "./components/landing/Pricing";
import TheWeekAhead from "./components/landing/TheWeekAhead";
import { Suspense } from "react";

const words = ["vue", "kubernetes", "angular", "react", "docker"];

export default function Home() {
  return (
    <main>
      <section className="max-w-screen-xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <GetReadyToHoneYourCraft />
      </section>
      {/* <Section bg={Section.Colors.Dark}> */}
      {/* </Section> */}
      {/* <Section bg={Section.Colors.Light} className="!py-16">
        <TheWeekAhead />
      </Section> */}
      {/* <Section bg={Section.Colors.Dark} className="!py-16">
        <ImageCarousel />
      </Section> */}
      {/* <Section bg={Section.Colors.Light}>
        <p className="text-lg font-semibold text-center">
          Unlock top industry skills below!
        </p>
        {words.map((word, index) => (
          <div key={index}>
            <Suspense fallback={<Reveal word={[]} />}>
              <Reveal word={word} />
            </Suspense>
          </div>
        ))}
      </Section> */}
      {/* <div className="flex items-center justify-center h-[44rem] lg:h-[55rem] relative bg-gray-800">
        <MockJobDeck />
      </div> */}
    </main>
  );
}
