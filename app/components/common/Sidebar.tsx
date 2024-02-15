"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { AiOutlineMenu, AiOutlineSearch } from "react-icons/ai";
import { IconType } from "react-icons";
import {
  FiTool,
  FiUser,
  FiCalendar,
  FiBarChart2,
  FiLogIn,
  FiX,
  FiColumns,
} from "react-icons/fi";
import Image from "next/image";

const sidebarItems = [
  { href: "/", text: "Hone Your Craft", icon: FiTool },
  { href: "/profile", text: "Profile", icon: FiUser },
  { href: "/job-search", text: "Job Search", icon: AiOutlineSearch },
  { href: "/board", text: "Board", icon: FiColumns },
  { href: "/calendar", text: "Calendar", icon: FiCalendar },
  { href: "/metrics", text: "Metrics", icon: FiBarChart2 },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Disclosure as="nav" className="fixed inset-y-0 left-0 flex z-50 ">
      {({ open }) => (
        <>
          <Disclosure.Button className="fixed top-4 left-4 z-50 bg-gray-900 bg-opacity-50 text-gray-50 p-2 rounded-full focus:outline-none">
            {open ? (
              <FiX className="w-6 h-6" />
            ) : (
              <AiOutlineMenu className="w-6 h-6" />
            )}
          </Disclosure.Button>

          <Disclosure.Panel className="fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-800 z-40 overflow-y-auto">
            <div className="px-4 py-8">
              <ul className="space-y-4">
                {sidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    href={item.href}
                    text={item.text}
                    icon={item.icon}
                  />
                ))}
                {!user && (
                  <li>
                    <button
                      className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      onClick={() => signIn()}
                    >
                      <div className="flex items-center">
                        <FiLogIn className="w-6 h-6" />
                        <span className="ml-3">Sign In</span>
                      </div>
                    </button>
                  </li>
                )}
              </ul>
              {user && (
                <div className="mt-6">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={user?.image || ""}
                      alt={`Profile picture for ${user.name}` || ""}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-gray-900 dark:text-gray-300">
                      {user.name}
                    </span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function SidebarItem({
  href,
  text,
  icon: Icon,
}: {
  href: string;
  text: string;
  icon: IconType;
}) {
  return (
    <li>
      <Link
        href={href}
        passHref
        className="flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon className="w-6 h-6 text-gray-900 dark:text-gray-300" />
        <span className="ml-3 text-gray-900 dark:text-gray-300">{text}</span>
      </Link>
    </li>
  );
}
