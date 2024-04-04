import ImageCarousel from "./components/landing/ImageCarousel";
import Reveal from "./components/landing/Reveal";
import MockJobDeck from "./components/landing/MockJobDeck";
import Tool from "./components/landing/Tool";
import WhyHoneYourCraft from "./components/landing/WhyHoneYourCraft";
import GetReadyToHoneYourCraft from "./components/landing/GetReadyToHoneYourCraft";
import Section from "./components/common/Section";
import Pricing from "./components/landing/Pricing";
import TheWeekAhead from "./components/landing/TheWeekAhead";
import Testimonials from "./components/landing/Testimonials";
import { Suspense } from "react";

const words = ["vue", "kubernetes", "angular", "react", "docker"];

const testimonials = [
  {
    name: "Anthony C.",
    testimonial:
      "Who created this? This is as helpful as an iPhone cable for my old android.",
    rating: 0.1,
  },
  {
    name: "Louis H.",
    testimonial:
      "This app is like a puzzle with missing pieces - confusing, frustrating, and ultimately, not worth the effort.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <main>
      <Section bg={Section.Colors.Dark}>
        <GetReadyToHoneYourCraft />
      </Section>
      <Section bg={Section.Colors.Light}>
        <Tool />
      </Section>
      <Section bg={Section.Colors.Dark} className="!py-16">
        <TheWeekAhead />
      </Section>
      <Section bg={Section.Colors.Light}>
        <Pricing />
      </Section>
      <Section bg={Section.Colors.Dark} className="!py-16">
        <ImageCarousel />
      </Section>
      <Section bg={Section.Colors.Light}>
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
      </Section>
      <div className="flex items-center justify-center h-[44rem] lg:h-[55rem] relative bg-gray-800">
        <MockJobDeck />
      </div>
      <Section bg={Section.Colors.Light} className="!py-16">
        <Testimonials hasShowMore={true} testimonials={testimonials} />
      </Section>
    </main>
  );
}
