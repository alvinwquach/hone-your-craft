import ImageCarousel from "./components/landing/ImageCarousel";
import Reveal from "./components/landing/Reveal";
import MockJobDeck from "./components/landing/MockJobDeck";

const words = ["angular", "react", "vue"];

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <ImageCarousel />

      {words.map((word, index) => (
        <div key={index}>
          <Reveal word={word} />
        </div>
      ))}
      <MockJobDeck />
    </main>
  );
}
