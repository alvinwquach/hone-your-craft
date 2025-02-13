"use client";
export const dynamic = "force-static";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactConfetti from "../../../app/components/common/ReactConfetti";
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExternalLinkAlt,
  FaUser,
} from "react-icons/fa";

function ConfirmationPage() {
  const searchParams = useSearchParams();
  const name = searchParams?.get("name");
  const email = searchParams?.get("email");
  const meetingTime = searchParams?.get("meetingTime");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    meetingTime: "",
  });

  useEffect(() => {
    if (name && email && meetingTime) {
      setUserData({
        name,
        email,
        meetingTime,
      });
    }
  }, [name, email, meetingTime]);

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)] flex items-center">
        <ReactConfetti />

        <div className="flex justify-center w-full">
          <div className="w-full max-w-md bg-zinc-800 shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-6 text-center border-b border-zinc-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaCheckCircle className="text-xl text-green-400" />
                <h2 className="text-xl font-semibold">You are Scheduled!</h2>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                A calendar invitation has been sent to your inbox.
              </p>
              <button className="mt-6 w-full sm:w-auto text-white py-2 px-6 bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center gap-2 mx-auto">
                <FaExternalLinkAlt className="text-white" />
                Open Invitation
              </button>
            </div>
            <div className="p-6 space-y-4 bg-zinc-700  max-w-xl mx-auto">
              <div className="bg-zinc-600 p-4 rounded-lg space-y-4 border border-gray-500">
                <div className="flex items-center gap-3 text-gray-300">
                  <FaClock className="text-xl" />
                  <p className="text-sm">{userData.meetingTime}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaUser className="text-xl" />
                  <p className="text-sm">{userData.name}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaEnvelope className="text-xl" />
                  <p className="text-sm">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
