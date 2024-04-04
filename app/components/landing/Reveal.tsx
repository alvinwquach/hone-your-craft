"use client";

import { useRef } from "react";
import { styled } from "@stitches/react";
import { useTrail, animated } from "@react-spring/web";

interface RevealProps {
  word: string | string[];
}

const Container = styled("div", {
  display: "flex",
  gap: 10,
  marginBottom: 40,
  marginTop: 10,
  justifyContent: "center",
  alignItems: "center",
});

const Box = styled("div", {
  position: "relative",
  height: 50,
  width: 50,
});

const SharedStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Helvetica",
  fontWeight: 800,
  backfaceVisibility: "hidden",
};

const FrontBox = styled(animated.div, {
  ...SharedStyles,
  backgroundColor: "#fafafa",
  border: "solid 2px #1a1a1a",
  color: "#000",
});

const BackBox = styled(animated.div, {
  ...SharedStyles,
  backgroundColor: "#1f2937",
  color: "#fafafa",
});

export default function Reveal({ word }: RevealProps) {
  const items = Array.isArray(word)
    ? word.map((w) => w.toUpperCase())
    : word.toUpperCase();

  const [trail, api] = useTrail(items.length, () => ({
    rotateX: 0,
  }));

  const isFlipped = useRef(false);

  const handleClick = () => {
    if (isFlipped.current) {
      api.start({
        rotateX: 0,
      });
      isFlipped.current = false;
    } else {
      api.start({
        rotateX: 180,
      });
      isFlipped.current = true;
    }
  };

  return (
    <Container onClick={handleClick}>
      {trail.map(({ rotateX }, i) => (
        <Box key={i}>
          <FrontBox
            key={items[i]}
            style={{
              transform: rotateX.to(
                (val) => `perspective(600px) rotateX(${val}deg)`
              ),
              transformStyle: "preserve-3d",
            }}
          >
            {"?"}
          </FrontBox>
          <BackBox
            style={{
              transform: rotateX.to(
                (val) => `perspective(600px) rotateX(${180 - val}deg)`
              ),
              transformStyle: "preserve-3d",
            }}
          >
            {items[i]}
          </BackBox>
        </Box>
      ))}
    </Container>
  );
}
