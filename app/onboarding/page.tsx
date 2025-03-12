"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
import { FaArrowRight } from "react-icons/fa";

function Onboarding() {
  const { data: session, status, update } = useSession();
  const [userRole, setUserRole] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const cutoffDate = "2024-12-31T00:00:00Z";
  const userCreatedAt = session?.user?.createdAt;
  const isNewUser = userCreatedAt ? userCreatedAt >= cutoffDate : false;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userRole) {
      toast.error("❌ Please select a role before continuing.");
      return;
    }
    try {
      const response = await fetch(`/api/onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userRole }),
      });

      if (response.ok) {
        toast.success(`🎉 Role updated to "${userRole}" successfully!`);
        await update({ userRole });
        router.push("/profile");
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("❌ Failed to update role. Please try again.");
    }
  };

  useEffect(() => {
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        {showConfetti && <Confetti />}
        <div className="p-6 mt- rounded-lg shadow-lg max-w-md w-full mx-auto bg-zinc-900">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {isNewUser ? `Welcome! 🎊` : `Welcome Back!`}
          </h1>
          <p className="mb-6 text-center text-gray-300">
            {isNewUser
              ? `We're excited to help you get started here at Hone Your Craft.`
              : `Thank you for using Hone Your Craft! We're making some updates to improve your experience.`}
          </p>
          {isNewUser ? (
            <>
              <p className="mb-6 text-center text-gray-300">
                As a Client or Hiring Manager, you can connect with talented
                individuals and streamline your hiring process.
              </p>
              <p className="mb-6 text-center text-gray-300">
                As a Job Seeker, you can explore exciting opportunities and
                showcase your skills to potential employers.
              </p>
            </>
          ) : (
            <>
              <p className="mb-6 text-center text-gray-300">
                We&rsquo;re excited to share our new features! We&rsquo;re now
                connecting clients and hiring managers with talent.
              </p>
            </>
          )}
          <form onSubmit={handleSubmit}>
            <fieldset className="mb-4">
              <legend className="text-gray-200 mb-2 text-center">
                Select Your Role:
              </legend>
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  className={`flex items-center justify-center py-3 px-6 rounded-lg transition duration-200 ease-in-out ${
                    userRole === "CLIENT"
                      ? "bg-zinc-800 text-white transform scale-105"
                      : "bg-zinc-600 text-gray-200 hover:bg-zinc-700"
                  }`}
                  onClick={() =>
                    setUserRole(userRole === "CLIENT" ? "" : "CLIENT")
                  }
                >
                  🤝 Client / Hiring Manager
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center py-3 px-6 rounded-lg transition duration-200 ease-in-out ${
                    userRole === "CANDIDATE"
                      ? "bg-zinc-800 text-white transform scale-105"
                      : "bg-zinc-600 text-gray-200 hover:bg-zinc-700"
                  }`}
                  onClick={() =>
                    setUserRole(userRole === "CANDIDATE" ? "" : "CANDIDATE")
                  }
                >
                  💼 Job Seeker
                </button>
              </div>
            </fieldset>

            <p className="mb-4 text-center text-gray-400">
              Whether you are a job seeker or a hiring manager, we are here to
              support your journey!
            </p>
            <button
              type="submit"
              className="flex items-center justify-center w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 transition duration-150"
            >
              <span className="mr-2">Proceed</span>
              <FaArrowRight />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Onboarding;
