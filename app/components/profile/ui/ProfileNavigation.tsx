"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaUser,
  FaCalendarAlt,
  FaMoneyCheckAlt,
  FaFileAlt,
  FaBan,
  FaAward,
} from "react-icons/fa";
import { SiBaremetrics } from "react-icons/si";
import { GiTargeting, GiThreeFriends } from "react-icons/gi";
import { GoGoal } from "react-icons/go";
import { MdMeetingRoom } from "react-icons/md";

interface NavigationItem {
  href: string;
  text: string;
  icon: React.ReactNode;
}

interface NavigationConfig {
  [key: string]: NavigationItem[];
}

const navigationConfig: NavigationConfig = {
  CANDIDATE: [
    { href: "/profile", text: "Profile", icon: <FaUser size={16} /> },
    { href: "/profile/match", text: "Match", icon: <GiTargeting size={16} /> },
    {
      href: "/profile/connections",
      text: "Connections",
      icon: <GiThreeFriends size={16} />,
    },
    { href: "/profile/awards", text: "Awards", icon: <FaAward size={16} /> },
    { href: "/profile/goal", text: "Goal", icon: <GoGoal size={16} /> },
    {
      href: "/profile/dashboard",
      text: "Dashboard",
      icon: <SiBaremetrics size={16} />,
    },
    { href: "/profile/resume", text: "Resume", icon: <FaFileAlt size={16} /> },
    {
      href: "/profile/meetings",
      text: "Meetings",
      icon: <MdMeetingRoom size={16} />,
    },
    {
      href: "/profile/interviews",
      text: "Interviews",
      icon: <FaCalendarAlt size={16} />,
    },
    {
      href: "/profile/offers",
      text: "Offers",
      icon: <FaMoneyCheckAlt size={16} />,
    },
    {
      href: "/profile/rejections",
      text: "Rejections",
      icon: <FaBan size={16} />,
    },
  ],
  CLIENT: [
    { href: "/profile", text: "Profile", icon: <FaUser size={16} /> },
    {
      href: "/profile/connections",
      text: "Connections",
      icon: <GiThreeFriends size={16} />,
    },
    {
      href: "/profile/dashboard",
      text: "Dashboard",
      icon: <SiBaremetrics size={16} />,
    },
    {
      href: "/profile/interviews",
      text: "Interviews",
      icon: <FaCalendarAlt size={16} />,
    },
    {
      href: "/profile/meetings",
      text: "Meetings",
      icon: <MdMeetingRoom size={16} />,
    },
  ],
};

interface ProfileNavigationProps {
  userRole?: string;
}

export default function ProfileNavigation({
  userRole = "CANDIDATE",
}: ProfileNavigationProps) {
  const pathname = usePathname();
  const navigationItems =
    navigationConfig[userRole] || navigationConfig.CANDIDATE;

  return (
    <nav className="fixed top-0 left-0 h-screen w-12 z-50 bg-zinc-900 border-r border-zinc-800 lg:block hidden">
      <ul className="py-4">
        {navigationItems.map((item, index) => (
          <li key={index} className="relative group">
            <Link
              href={item.href}
              className={`flex items-center justify-center px-4 py-3 text-sm transition-colors duration-200 rounded-full mx-2
                ${
                  pathname === item.href
                    ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
            </Link>
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 hidden group-hover:block bg-zinc-800 text-zinc-100 text-sm font-medium rounded-md py-2 px-3 whitespace-nowrap z-10">
              {item.text}
              <div
                className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-800"
                data-popper-arrow
              />
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}