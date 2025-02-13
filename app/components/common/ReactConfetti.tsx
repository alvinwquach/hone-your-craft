"use client";

import { useState, useEffect } from "react";
import Confetti from "react-confetti";

function ReactConfetti() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={200}
    />
  );
}

export default ReactConfetti;
