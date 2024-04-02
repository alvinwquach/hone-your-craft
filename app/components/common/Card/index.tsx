import * as React from "react";
import { IconType } from "react-icons";
import Link from "next/link";

import styles from "./styles.module.scss";

interface CardProps {
  src: IconType;
  tooltip: string;
  href: string;
}

export const Card = ({ src, href, tooltip }: CardProps) => (
  <Link href={href}>
    <span className={styles.card}>{src({ size: 36 })}</span>
  </Link>
);
