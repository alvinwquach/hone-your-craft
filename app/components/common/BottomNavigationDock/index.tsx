import * as React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsBriefcase } from "react-icons/bs";
import { FiCalendar, FiUser } from "react-icons/fi";
import { SiBaremetrics } from "react-icons/si";
import { MdAssignmentInd } from "react-icons/md";

import { Card } from "../Card";
import { Dock } from "../Dock";
import { DockCard } from "../DockCard";
import { DockDivider } from "../DockDivider";

import styles from "./styles.module.scss";

const navigation = [
  { href: "/", tooltip: "Home", icon: AiOutlineHome },
  { href: "/profile", tooltip: "Profile", icon: FiUser },
  { href: "/track", tooltip: "Track", icon: BsBriefcase },
  { href: "/calendar", tooltip: "Calendar", icon: FiCalendar },
  { href: "/metrics", tooltip: "Metrics", icon: SiBaremetrics },
];

export default function BottomNavigationDock() {
  return (
    <div className={styles.body}>
      <Dock>
        {navigation.map(({ href, tooltip, icon }, index) =>
          href ? (
            <DockCard key={href}>
              <Card src={icon} tooltip={tooltip} href={href} />
            </DockCard>
          ) : (
            <DockDivider key={index} />
          )
        )}
      </Dock>
    </div>
  );
}
