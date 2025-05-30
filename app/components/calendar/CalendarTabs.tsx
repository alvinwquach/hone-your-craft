"use client";

import Link from "next/link";
import { FaLink, FaCalendarCheck, FaCalendarPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function CalendarTabs() {
  const pathname = usePathname();
  const tabs = [
    {
      name: "Event Types",
      href: "/calendar/event-types",
      icon: <FaLink />,
      key: "event-types",
    },
    {
      name: "Meetings",
      href: "/calendar/interviews",
      icon: <FaCalendarCheck />,
      key: "interviews",
    },
    {
      name: "Availability",
      href: "/calendar/availability",
      icon: <FaCalendarPlus />,
      key: "availability",
    },
  ];

  return (
    <nav className="relative flex bg-neutral-900 border border-zinc-700">
      <div className="flex flex-wrap w-full">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`
              inline-flex items-center justify-center p-4  transition-all duration-200 text-white
              hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none
              focus-visible:ring-offset-zinc-900
              ${
                pathname === `/calendar/${tab.key}`
                  ? "border-neutral-700 bg-neutral-800"
                  : "hover:bg-neutral-700 hover:border-neutral-600"
              }
              flex-1 min-w-[120px] md:min-w-[140px]
            `}
          >
            <div className="mr-2 text-white">{tab.icon}</div>
            <span className="text-sm font-medium">{tab.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
