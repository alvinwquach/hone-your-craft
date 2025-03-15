"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, Suspense } from "react";
import { IconType } from "react-icons";
import { AiOutlineHome } from "react-icons/ai";
import { HiOutlineChevronDown } from "react-icons/hi";
import {
  FiCalendar,
  FiUser,
  FiClipboard,
  FiMessageCircle,
} from "react-icons/fi";
import { MdAssignmentInd } from "react-icons/md";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";
import { usePathname } from "next/navigation";

interface NavigationItem {
  href: string;
  text: string;
  icon: IconType;
}

interface NavigationConfig {
  [key: string]: NavigationItem[];
}

const navigationConfig: NavigationConfig = {
  CLIENT: [
    { href: "/", text: "Home", icon: AiOutlineHome },
    { href: "/profile", text: "Profile", icon: FiUser },
    { href: "/messages", text: "Messages", icon: FiMessageCircle },
    { href: "/calendar", text: "Calendar", icon: FiCalendar },
    { href: "/jobs", text: "Jobs", icon: MdAssignmentInd },
  ],
  CANDIDATE: [
    { href: "/", text: "Home", icon: AiOutlineHome },
    { href: "/profile", text: "Profile", icon: FiUser },
    { href: "/messages", text: "Messages", icon: FiMessageCircle },
    { href: "/track", text: "Track", icon: FiClipboard },
    { href: "/calendar", text: "Calendar", icon: FiCalendar },
    { href: "/jobs", text: "Jobs", icon: MdAssignmentInd },
  ],
};

function getNavigationItems(userRole?: string): NavigationItem[] {
  return navigationConfig[userRole || "CLIENT"] || navigationConfig.CLIENT;
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
        className={`flex items-center p-2 text-zinc-400 rounded-lg ${
          isActive ? "bg-zinc-700" : "hover:bg-zinc-700"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-zinc-300"}`}
        />
        <span
          className={`ms-3 ${isActive ? "text-blue-500" : "text-zinc-300"}`}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}

function Sidebar({ navigation }: { navigation: NavigationItem[] }) {
  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-zinc-900 border-r border-gray-200 b dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
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
    </aside>
  );
}

function ProfileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { data: session } = useSession();

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative">
        <div>
          <Menu.Button
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            aria-expanded="false"
          >
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center">
              <Suspense fallback={<p>Loading user...</p>}>
                <Image
                  src={session?.user?.image || defaultPfp}
                  alt={
                    session?.user?.name
                      ? `${session?.user?.name}'s profile picture`
                      : "A default profile picture"
                  }
                  height={32}
                  width={32}
                  className="rounded-full"
                  priority
                />
              </Suspense>
              <HiOutlineChevronDown className="w-4 h-4 ml-1 text-gray-500" />
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
            {isAuthenticated ? (
              <>
                <Menu.Item>
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <Image
                      src={session?.user?.image || ""}
                      alt={`${session?.user?.name}'s profile picture`}
                      height={40}
                      width={40}
                      className="rounded-full"
                    />
                    <span className="text-sm text-gray-700 font-semibold">
                      {session?.user?.name}
                    </span>
                  </div>
                </Menu.Item>
                <hr className="my-1 border-zinc-200 w-4/5 mx-auto" />
                <div className="ml-6 mt-2 text-gray-400 text-xs">Personal</div>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm text-zinc-700 w-full text-left ${
                        active ? "bg-zinc-100" : ""
                      }`}
                    >
                      Edit Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={`block px-4 py-2 text-sm text-zinc-700 w-full text-left ${
                        active ? "bg-zinc-100" : ""
                      }`}
                    >
                      Log out
                    </button>
                  )}
                </Menu.Item>
              </>
            ) : (
              <Menu.Item>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-zinc-700 w-full text-left"
                >
                  Log in
                </Link>
              </Menu.Item>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

export default function CustomNavigation() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const userRole = session?.user?.userRole;
  const navigation = getNavigationItems(userRole ?? "");

  return (
    <>
      <nav className="fixed top-0 right-0 z-50 w-full  border-b  bg-zinc-900 border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <span className="text-2xl font-semibold whitespace-nowrap">
                Hone Your Craft
              </span>
            </div>
            <div className="flex items-center">
              <ProfileMenu isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && <Sidebar navigation={navigation} />}
    </>
  );
}
