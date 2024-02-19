"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";
import { IconType } from "react-icons";
import {
  FiUser,
  FiCalendar,
  FiBarChart2,
  FiLogIn,
  FiColumns,
} from "react-icons/fi";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", text: "Home", icon: AiOutlineHome },
  { href: "/profile", text: "Profile", icon: FiUser },
  { href: "/jobs", text: "Jobs", icon: FiColumns },
  { href: "/calendar", text: "Calendar", icon: FiCalendar },
  { href: "/metrics", text: "Metrics", icon: FiBarChart2 },
];

interface NavigationItemProps {
  href: string;
  text: string;
  icon: IconType;
  isActive: boolean;
}

const NavigationItem = ({
  href,
  text,
  icon: Icon,
  isActive,
}: NavigationItemProps) => (
  <Link href={href} passHref>
    <button
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
    </button>
  </Link>
);

const useNavigation = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  return { user, pathname };
};

const Sidebar = ({ pathname }: { pathname: string }) => {
  const { user } = useNavigation();

  return (
    <nav className="fixed inset-y-0 left-0 flex z-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-800 z-40 overflow-y-auto">
        <div className="px-4 py-8">
          <ul className="space-y-4">
            {navigation.map((item, index) => (
              <NavigationItem
                key={index}
                href={item.href}
                text={item.text}
                icon={item.icon}
                isActive={pathname === item.href}
              />
            ))}
            {!user && (
              <li>
                <button
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
        </div>
      </div>
    </nav>
  );
};

const BottomNavigation = ({ pathname }: { pathname: string }) => (
  <div className="fixed bottom-0 left-0 z-50 w-full bg-gray-50 dark:bg-gray-800  0">
    <div className="flex justify-around items-center h-16 max-w-lg mx-auto font-medium">
      {navigation.map((item, index) => (
        <NavigationItem
          key={index}
          href={item.href}
          text={item.text}
          icon={item.icon}
          isActive={pathname === item.href}
        />
      ))}
    </div>
  </div>
);

export default function Navigation() {
  const { pathname } = useNavigation();

  return (
    <>
      <div className="lg:hidden">
        <BottomNavigation pathname={pathname} />
      </div>
      <div className="hidden lg:block">
        <Sidebar pathname={pathname} />
      </div>
    </>
  );
}

// {user && (
//   <div className="mt-6">
//     <div className="flex items-center space-x-4">
//       <Image
//         src={user?.image || ""}
//         alt={`Profile picture for ${user.name}` || ""}
//         width={40}
//         height={40}
//         className="w-10 h-10 rounded-full"
//       />
//       <span className="text-gray-900 dark:text-gray-300">
//         {user.name}
//       </span>
//     </div>
//     <div className="mt-4">
//       <button
//         onClick={() => signOut({ callbackUrl: "/" })}
//         className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
//       >
//         Sign Out
//       </button>
//     </div>
//   </div>
// )}
