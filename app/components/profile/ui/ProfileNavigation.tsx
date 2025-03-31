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
    { href: "/profile", text: "Profile", icon: <FaUser size={12} /> },
    { href: "/profile/match", text: "Match", icon: <GiTargeting size={12} /> },
    {
      href: "/profile/connections",
      text: "Connections",
      icon: <GiThreeFriends size={12} />,
    },
    { href: "/profile/awards", text: "Awards", icon: <FaAward size={12} /> },
    { href: "/profile/goal", text: "Goal", icon: <GoGoal size={12} /> },
    {
      href: "/profile/dashboard",
      text: "Dashboard",
      icon: <SiBaremetrics size={12} />,
    },
    { href: "/profile/resume", text: "Resume", icon: <FaFileAlt size={12} /> },
    {
      href: "/profile/meetings",
      text: "Meetings",
      icon: <MdMeetingRoom size={12} />,
    },
    {
      href: "/profile/interviews",
      text: "Interviews",
      icon: <FaCalendarAlt size={12} />,
    },
    {
      href: "/profile/offers",
      text: "Offers",
      icon: <FaMoneyCheckAlt size={12} />,
    },
    {
      href: "/profile/rejections",
      text: "Rejections",
      icon: <FaBan size={12} />,
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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px justify-start">
            {navigationItems.map((item, index) => (
              <li key={index} className="mr-2">
                <Link
                  href={item.href}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg transition-colors duration-200
                    ${
                      pathname === item.href
                        ? "text-blue-700 font-semibold "
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  <div className="mr-2">{item.icon}</div>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
