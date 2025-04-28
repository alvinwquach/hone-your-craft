"use client";

import Link from "next/link";
import { FaLink, FaCalendarCheck, FaCalendarPlus } from "react-icons/fa";
import Legend from "@/app/components/calendar/Legend";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";
import { usePathname } from "next/navigation";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen ">
      <div className="flex flex-wrap">
        {pathname?.includes("/calendar/interviews") && (
          <div className="w-full md:w-1/5 my-4 sm:mt-6 md:mt-0 pr-0 md:pr-4 ">
            <Legend interviewTypes={clientInterviewTypes} />
          </div>
        )}
        <div
          className={`w-full ${
            pathname?.includes("/calendar/interviews")
              ? "md:w-4/5"
              : "md:w-full"
          }`}
        >
          <nav className="relative flex p-2 rounded-lg bg-zinc-900 border border-zinc-700">
            <div className="flex flex-wrap">
              {tabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={`inline-flex items-center justify-center p-4 rounded-t-lg transition-all duration-200 text-white hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-offset-zinc-900
                    ${
                      pathname === `/calendar/${tab.key}`
                        ? "border-b-2 border-zinc-700 bg-zinc-800"
                        : "hover:bg-zinc-700 hover:border-b-2 hover:border-zinc-600"
                    }`}
                >
                  <div className="mr-2 text-white">{tab.icon}</div>
                  <span className="text-sm font-medium">{tab.name}</span>
                </Link>
              ))}
            </div>
          </nav>
          <div className="relative mt-6 p-6 rounded-lg shadow-md border border-zinc-700 bg-zinc-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
