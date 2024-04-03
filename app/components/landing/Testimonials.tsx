"use client";

import React, { useState } from "react";
import cn from "clsx";

import Rating from "./Rating";

interface TestimonialCardProps {
  testimonial: string;
  name: string;
  rating: number;
}

function TestimonialCard({ testimonial, name, rating }: TestimonialCardProps) {
  return (
    <figure className="group inline-flex gap-4 p-6 mb-4 w-full relative flex-col-reverse bg-gray-800 highlight-white/5 rounded-lg">
      <blockquote>
        <p className="text-gray-400">{testimonial}</p>
      </blockquote>
      {rating && (
        <div className="mt-2 flex gap-x-1 items-center">
          <Rating value={rating} />
          <span className="font-light text-sm text-gray-400">{rating} / 5</span>
        </div>
      )}
      <figcaption className="flex items-center space-x-4">
        <div className="flex-auto">
          <div className="text-base text-slate-50 font-semibold">
            <div>{name}</div>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

interface TestimonialsProps {
  hasShowMore?: boolean;
  testimonials: TestimonialCardProps[];
}

function Testimonials({ hasShowMore, testimonials }: TestimonialsProps) {
  const [showMore, setShowMore] = useState(!hasShowMore);
  return (
    <div className="relative mb-24">
      <div className="flex pb-12 flex-col items-center justify-center">
        <p className="mx-auto font-bold mt-3 max-w-2xl text-3xl text-white sm:mt-4 text-center">
          Job seekers love Hone Your Craft!
        </p>
      </div>
      <div className="columns-1 gap-x-4 md:columns-2 lg:columns-3">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            testimonial={testimonial.testimonial}
            rating={testimonial.rating}
          />
        ))}
      </div>
      {hasShowMore && (
        <div
          className={cn("inset-x-0 flex justify-center absolute", {
            ["pt-32"]: !showMore,
            ["bg-gradient-to-t bottom-0 pb-0 pointer-events-none from-black"]:
              !showMore,
          })}
        >
          {!showMore && (
            <button
              type="button"
              onClick={() => {
                setShowMore(!showMore);
              }}
              className="relative focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 text-sm text-white font-semibold h-12 px-6 rounded-lg flex items-center bg-zinc-700 hover:bg-zinc-500 pointer-events-auto"
            >
              Show More...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Testimonials;
