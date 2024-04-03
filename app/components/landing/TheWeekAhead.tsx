import React from "react";
import upcomingInterviews from "../../../public/images/landing/upcomingInterviews.png";
import Image from "next/image";

function TheWeekAhead() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-white mb-5">A glance at the week ahead.</p>
      <Image
        src={upcomingInterviews}
        alt="Image of upcoming interviews"
        style={{ objectFit: "contain" }}
        width={800}
        height={800}
      />
    </div>
  );
}

export default TheWeekAhead;
