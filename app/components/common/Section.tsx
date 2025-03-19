import React from "react";
import cn from "clsx";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  bg?: string;
  wrapperStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const Colors = {
  Light: "bg-slate-700",
  Dark: "bg-slate-800",
};

function Section({
  children,
  className,
  bg = "",
  wrapperStyle,
  style,
}: SectionProps) {
  return (
    <div className={bg} style={wrapperStyle}>
      <div
        style={style}
        className={cn(
          "max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

Section.Colors = Colors;

export default Section;
