"use client";

import * as React from "react";
import { useRef, useState, useEffect } from "react";
import {
  animated,
  useIsomorphicLayoutEffect,
  useSpringValue,
} from "@react-spring/web";

import { useMousePosition } from "@/app/hooks/useMousePosition";
import { useWindowResize } from "@/app/hooks/useWindowResize";

import { useDock } from "../Dock/DockContext";

import styles from "./styles.module.scss";

interface DockCardProps {
  children: React.ReactNode;
}

const INITIAL_WIDTH = 48;

export const DockCard = ({ children }: DockCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null!);
  /**
   * This doesn't need to be real time, think of it as a static
   * value of where the card should go to at the end.
   */
  const [elCenterX, setElCenterX] = useState<number>(0);

  const size = useSpringValue(INITIAL_WIDTH, {
    config: {
      mass: 0.1,
      tension: 320,
    },
  });

  const opacity = useSpringValue(0);
  const y = useSpringValue(0, {
    config: {
      friction: 29,
      tension: 238,
    },
  });

  const dock = useDock();

  /**
   * This is just an abstraction around a `useSpring` hook, if you wanted you could do this
   * in the hook above, but these abstractions are useful to demonstrate!
   */
  useMousePosition(
    {
      onChange: ({ value }) => {
        const mouseX = value.x;

        if (dock.width > 0) {
          const transformedValue =
            INITIAL_WIDTH +
            36 *
              Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) **
                12;

          if (dock.hovered) {
            size.start(transformedValue);
          }
        }
      },
    },
    [elCenterX, dock]
  );

  useIsomorphicLayoutEffect(() => {
    if (!dock.hovered) {
      size.start(INITIAL_WIDTH);
    }
  }, [dock.hovered]);

  useWindowResize(() => {
    const { x } = cardRef.current.getBoundingClientRect();

    setElCenterX(x + INITIAL_WIDTH / 2);
  });

  const timesLooped = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isAnimating = useRef(false);

  const handleClick = () => {
    if (!isAnimating.current) {
      isAnimating.current = true;
      opacity.start(0.5);

      timesLooped.current = 0;

      y.start(-INITIAL_WIDTH / 2, {
        loop: () => {
          if (3 === timesLooped.current++) {
            timeoutRef.current = setTimeout(() => {
              opacity.start(0);
              y.set(0);
              isAnimating.current = false;
              timeoutRef.current = undefined;
            }, 2000);
            y.stop();
          }
          return { reverse: true };
        },
      });
    } else {
      /**
       * Allow premature exit of animation
       * on a second click if we're currently animating
       */
      clearTimeout(timeoutRef.current);
      opacity.start(0);
      y.start(0);
      isAnimating.current = false;
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className={styles["dock-card-container"]}>
      <animated.button
        ref={cardRef}
        className={styles["dock-card"]}
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          y,
        }}
      >
        {children}
      </animated.button>
      <animated.div className={styles["dock-dot"]} style={{ opacity }} />
    </div>
  );
};
