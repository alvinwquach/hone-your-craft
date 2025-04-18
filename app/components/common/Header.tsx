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
  FiMessageCircle,
  FiClipboard,
} from "react-icons/fi";
import { FaBriefcase } from "react-icons/fa";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";
import { usePathname } from "next/navigation";
import ProfileNavigation from "../profile/ui/ProfileNavigation";

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
    { href: "/jobs", text: "Jobs", icon: FaBriefcase },
  ],
  CANDIDATE: [
    { href: "/", text: "Home", icon: AiOutlineHome },
    { href: "/profile", text: "Profile", icon: FiUser },
    { href: "/messages", text: "Messages", icon: FiMessageCircle },
    { href: "/track", text: "Track", icon: FiClipboard },
    { href: "/calendar", text: "Calendar", icon: FiCalendar },
    { href: "/jobs", text: "Jobs", icon: FaBriefcase },
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
        className={`
          group flex items-center rounded-full transition-all duration-200
          ${
            isActive
              ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              : "hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
          }
        `}
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <Icon
            className={`
              w-6 h-6 transition-colors duration-200
              ${
                isActive
                  ? "text-zinc-100 hover:text-zinc-50"
                  : "text-zinc-300 group-hover:text-zinc-100"
              }
            `}
          />
        </div>
        <span className="absolute left-full ml-3 whitespace-nowrap opacity-0 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition-opacity duration-200 group-hover:opacity-100">
          {text}
          <div
            className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-800"
            data-popper-arrow
          />
        </span>
      </Link>
    </li>
  );
}

function Sidebar({ navigation }: { navigation: NavigationItem[] }) {
  return (
    <aside
      className="fixed top-0 left-0 z-40 w-16 h-screen pt-20 transition-transform bg-zinc-900 border-r border-zinc-800 lg:block hidden"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <ul className="space-y-3 font-medium">
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
            className="flex text-sm bg-zinc-900 rounded-full focus:ring-4 focus:ring-zinc-700 hover:bg-zinc-800 transition-colors duration-200"
            aria-expanded="false"
          >
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
              <HiOutlineChevronDown className="w-4 h-4 ml-1 text-zinc-400" />
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
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-zinc-900 ring-1 ring-zinc-700 focus:outline-none">
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
                    <span className="text-sm text-zinc-100 font-semibold">
                      {session?.user?.name}
                    </span>
                  </div>
                </Menu.Item>

                <hr className="my-1 border-zinc-600 w-4/5 mx-auto" />

                <div className="ml-6 mt-2 text-zinc-400 text-xs">Personal</div>

                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm text-zinc-300 w-full text-left ${
                        active ? "bg-zinc-800 text-zinc-100" : ""
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
                      className={`block px-4 py-2 text-sm text-zinc-300 w-full text-left ${
                        active ? "bg-zinc-800 text-zinc-100" : ""
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
                  className="block px-4 py-2 text-sm text-zinc-300 w-full text-left"
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

function BottomNavigation({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname();
  const gridCols = Math.min(navigation.length, 6);

  return (
    <div
      className="fixed z-50 w-full h-16 max-w-xl -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-full bottom-4 left-1/2 lg:bottom-6"
      style={{ "--grid-cols": gridCols } as React.CSSProperties}
    >
      <div
        className="grid h-full max-w-xl mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const isFirstItem = index === 0;
          const isLastItem = index === navigation.length - 1;

          return (
            <div
              key={index}
              className={`
                inline-flex flex-col items-center justify-center group relative
                ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    : "hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
                }
                ${isFirstItem ? "rounded-l-full" : ""}
                ${isLastItem ? "rounded-r-full" : ""}
              `}
            >
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center justify-center w-full h-full transition-colors duration-200
                  ${
                    isActive
                      ? "text-zinc-100 hover:text-zinc-50"
                      : "text-zinc-300 group-hover:text-zinc-100"
                  }
                `}
              >
                <item.icon
                  className={`
                    w-5 h-5 mb-1 transition-colors duration-200
                    ${
                      isActive
                        ? "text-zinc-100 hover:text-zinc-50"
                        : "text-zinc-300 group-hover:text-zinc-100"
                    }
                  `}
                  aria-hidden="true"
                />
                <span className="sr-only">{item.text}</span>
              </Link>
              <div
                className={`
                  absolute bottom-full mb-2 invisible group-hover:visible inline-block px-3 py-2 text-sm font-medium text-zinc-100 transition-opacity duration-200 bg-zinc-800 rounded-lg shadow-xs opacity-0 group-hover:opacity-100 bg-zinc-800
                  ${isActive ? "visible opacity-100" : ""}
                `}
              >
                {item.text}
                <div
                  className="tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800"
                  data-popper-arrow
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CustomNavigation() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const userRole = session?.user?.userRole!;
  const navigation = getNavigationItems(userRole);
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith("/profile");

  return (
    <>
      <nav className="fixed top-0 right-0 z-50 w-full border-b bg-zinc-900 border border-zinc-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start"></div>
            <div className="flex items-center">
              <ProfileMenu isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <Fragment>
          {isProfilePage && <ProfileNavigation userRole={userRole} />}
          <BottomNavigation navigation={navigation} />
        </Fragment>
      )}
    </>
  );
}