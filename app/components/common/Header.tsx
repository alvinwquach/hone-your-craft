"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IconType } from "react-icons";
import { AiOutlineHome } from "react-icons/ai";
import { FiCalendar, FiBarChart2, FiColumns } from "react-icons/fi";
import { HiOutlineChevronDown } from "react-icons/hi";
import { MdAssignmentInd } from "react-icons/md";

const navigation = [
  { href: "/", text: "Home", icon: AiOutlineHome },
  { href: "/track", text: "Track", icon: FiColumns },
  { href: "/calendar", text: "Calendar", icon: FiCalendar },
  { href: "/metrics", text: "Metrics", icon: FiBarChart2 },
  { href: "/roles", text: "Roles", icon: MdAssignmentInd },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CustomNavigation() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <header className="fixed top-0 right-0 bg-white dark:bg-gray-800 w-full p-4 h-20 flex justify-end items-center">
        <div>
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <div className="flex justify-between items-end space-x-4">
              <button
                onClick={() => signIn()}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg"
              >
                Sign in
              </button>

              <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg">
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </>
  );
}

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userId?: number | null;
}

interface ProfileMenuProps {
  user: User;
}

function ProfileMenu({ user }: ProfileMenuProps) {
  return (
    <div className="flex items-center space-x-4">
      <Menu as="div" className="relative">
        <div>
          <Menu.Button className="rounded-lg px-2 py-3 hover:bg-gray-200 dark:hover:bg-gray-700">
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center">
              <Image
                src={user?.image || ""}
                alt={`${user?.name}'s profile picture`}
                height={40}
                width={40}
                className="rounded-full"
                priority
              />
              <HiOutlineChevronDown className="w-6 h-6 ml-1 text-gray-500 transition-colors group-hover:text-gray-700" />
            </div>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            {user ? (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-4 py-2 flex items-center space-x-2">
                      <Image
                        src={user?.image || ""}
                        alt={`${user?.name}'s profile picture`}
                        height={40}
                        width={40}
                        className="rounded-full"
                      />
                      <span className="text-sm text-gray-700 mb-3 font-semibold ">
                        {user.name}
                      </span>
                    </div>
                  )}
                </Menu.Item>
                <hr className="my-1 border-gray-200 w-4/5 mx-auto" />
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile/"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700 text-left"
                      )}
                    >
                      Edit Profile
                    </Link>
                  )}
                </Menu.Item>
                <hr className="my-1 border-gray-200 w-4/5 mx-auto" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700 w-full text-left"
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </>
            ) : null}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

function Sidebar() {
  return (
    <nav className="fixed inset-y-0 left-0 flex z-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-800 z-40 overflow-y-auto">
        <div className="px-4 py-8 mt-12">
          <ul className="space-y-4">
            {navigation.map((item, index) => (
              <SidebarItem
                key={index}
                href={item.href}
                text={item.text}
                icon={item.icon}
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

interface SidebarItemProps {
  href: string;
  text: string;
  icon: IconType;
}

function SidebarItem({ href, text, icon: Icon }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center p-3 rounded-lg ${
          isActive
            ? "bg-gray-200 dark:bg-gray-700"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <Icon
          className={`w-6 h-6 ${
            isActive ? "text-blue-500" : "text-gray-900 dark:text-gray-300"
          }`}
        />
        <span
          className={`ml-3 ${
            isActive ? "text-blue-500" : "text-gray-900 dark:text-gray-300"
          }`}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto font-medium">
        {navigation.map((item, index) => (
          <BottomNavigationItem
            key={index}
            href={item.href}
            text={item.text}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

interface BottomNavigationItemProps {
  href: string;
  text: string;
  icon: IconType;
}

function BottomNavigationItem({
  href,
  text,
  icon: Icon,
}: BottomNavigationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <button
        className={`inline-flex flex-col items-center justify-center px-6 rounded-lg group ${
          isActive
            ? "bg-gray-200 dark:bg-gray-700 "
            : "hover:bg-gray-200 dark:hover:bg-gray-700 "
        }`}
      >
        <Icon
          className={`w-5 h-5 my-1 ${
            isActive
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        />
        <span
          className={`text-xs mb-1 ${
            isActive
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {text}
        </span>
      </button>
    </Link>
  );
}


