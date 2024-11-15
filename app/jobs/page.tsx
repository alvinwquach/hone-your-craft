"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { FaTools } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { Menu, Transition } from "@headlessui/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";

const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Bring The Shreds",
    location: "Los Angeles, California, United States",
    workLocation: "On-site",
    status: "draft",
    createdAt: "2024-11-07T08:30:00Z",
    updatedAt: "2024-11-07T08:30:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: 5000,
      salaryType: "EXACT",
      rangeMin: null,
      rangeMax: null,
      frequency: null,
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "JavaScript", yearsOfExperience: 3, isRequired: true },
      { skill: "React", yearsOfExperience: 2, isRequired: true },
      {
        skill: "Adobe Creative Suite",
        yearsOfExperience: 0,
        isRequired: false,
      },
    ],
    bonusSkills: ["CSS", "HTML"],
    experienceLevels: ["MID_LEVEL", "SENIOR_LEVEL"],
    yearsOfExperience: 3,
    deadline: "2024-12-15T23:59:59Z",
    requiredDegree: {
      degree: "BACHELORS_DEGREE",
      isRequired: true,
    },
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "CodeWorks",
    location: "San Francisco, California, United States",
    workLocation: "Hybrid",
    status: "completed",
    createdAt: "2024-11-02T10:15:00Z",
    updatedAt: "2024-11-02T10:15:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: null,
      salaryType: "RANGE",
      rangeMin: 90000,
      rangeMax: 110000,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "Node.js", yearsOfExperience: 4, isRequired: true },
      { skill: "MongoDB", yearsOfExperience: 3, isRequired: true },
      {
        skill: "Adobe Creative Suite",
        yearsOfExperience: 0,
        isRequired: false,
      },
    ],
    requiredDegree: {
      degree: "MASTERS_DEGREE",
      isRequired: true,
    },
    bonusSkills: [],
    experienceLevels: ["MID_LEVEL", "SENIOR_LEVEL"],
    yearsOfExperience: 4,
    deadline: "2024-11-25T23:59:59Z",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "DesignStudio",
    location: "Santa Monica, California, United States",
    workLocation: "On-site",
    status: "draft",
    createdAt: "2024-11-10T11:00:00Z",
    updatedAt: "2024-11-10T11:00:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: 50000,
      salaryType: "UP_TO",
      rangeMin: null,
      rangeMax: null,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "UX Research", yearsOfExperience: 3, isRequired: true },
      { skill: "Figma", yearsOfExperience: 2, isRequired: true },
      {
        skill: "Adobe Creative Suite",
        yearsOfExperience: 0,
        isRequired: false,
      },
    ],
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
    bonusSkills: [],
    experienceLevels: ["ENTRY_LEVEL", "MID_LEVEL"],
    yearsOfExperience: 3,
    deadline: null,
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Techify",
    location: "Austin, Texas, United States",
    workLocation: "Remote",
    status: "completed",
    createdAt: "2024-11-01T14:15:00Z",
    updatedAt: "2024-11-01T14:15:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: 70000,
      salaryType: "STARTING_AT",
      rangeMin: null,
      rangeMax: null,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "Agile", yearsOfExperience: 4, isRequired: true },
      { skill: "Project Management", yearsOfExperience: 3, isRequired: true },
    ],
    bonusSkills: ["Scrum", "Jira"],
    experienceLevels: ["MID_LEVEL", "SENIOR_LEVEL"],
    yearsOfExperience: 4,
    deadline: "2024-12-01T23:59:59Z",
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 5,
    title: "Freelance Full Stack Developer",
    company: "WebTech Solutions",
    location: "Remote",
    workLocation: "Remote",
    status: "draft",
    createdAt: "2024-11-05T09:00:00Z",
    updatedAt: "2024-11-05T09:00:00Z",
    jobType: "FREELANCE",
    salary: {
      amount: 5000,
      salaryType: "EXACT",
      rangeMin: null,
      rangeMax: null,
      frequency: null,
    },
    paymentType: "ONE_TIME_PAYMENT",
    requiredSkills: [
      { skill: "JavaScript", yearsOfExperience: 4, isRequired: true },
      { skill: "React", yearsOfExperience: 3, isRequired: true },
    ],
    bonusSkills: ["Node.js", "TypeScript"],
    experienceLevels: ["MID_LEVEL"],
    yearsOfExperience: 4,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 6,
    title: "Freelance Python Developer",
    company: "DataWorks",
    location: "Remote",
    workLocation: "Remote",
    status: "completed",
    createdAt: "2024-10-29T09:00:00Z",
    updatedAt: "2024-10-29T09:00:00Z",
    jobType: "FREELANCE",
    salary: {
      amount: 8000,
      salaryType: "EXACT",
      rangeMin: null,
      rangeMax: null,
      frequency: null,
    },
    paymentType: "ONE_TIME_PAYMENT",
    requiredSkills: [
      { skill: "Python", yearsOfExperience: 3, isRequired: true },
      { skill: "Django", yearsOfExperience: 2, isRequired: true },
    ],
    bonusSkills: [],
    experienceLevels: ["MID_LEVEL"],
    yearsOfExperience: 3,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 7,
    title: "Software Engineer",
    company: "CodeForge",
    location: "New York, New York, United States",
    workLocation: "On-site",
    status: "completed",
    createdAt: "2024-10-30T08:00:00Z",
    updatedAt: "2024-10-30T08:00:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: 100000,
      salaryType: "EXACT",
      rangeMin: null,
      rangeMax: null,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "Java", yearsOfExperience: 5, isRequired: true },
      { skill: "Spring Boot", yearsOfExperience: 4, isRequired: true },
    ],
    bonusSkills: [],
    experienceLevels: ["SENIOR_LEVEL"],
    yearsOfExperience: 5,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 8,
    title: "Data Scientist",
    company: "AI Labs",
    location: "San Francisco, California, United States",
    workLocation: "Hybrid",
    status: "draft",
    createdAt: "2024-11-04T12:00:00Z",
    updatedAt: "2024-11-04T12:00:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: null,
      salaryType: "RANGE",
      rangeMin: 120000,
      rangeMax: 150000,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "Python", yearsOfExperience: 4, isRequired: true },
      { skill: "Machine Learning", yearsOfExperience: 3, isRequired: true },
    ],
    bonusSkills: [],
    experienceLevels: ["MID_LEVEL", "SENIOR_LEVEL"],
    yearsOfExperience: 4,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 9,
    title: "Freelance Web Developer",
    company: "Web Innovators",
    location: "Remote",
    workLocation: "Remote",
    status: "draft",
    createdAt: "2024-11-09T10:45:00Z",
    updatedAt: "2024-11-09T10:45:00Z",
    jobType: "FREELANCE",
    salary: {
      amount: 3000,
      salaryType: "STARTING_AT",
      rangeMin: null,
      rangeMax: null,
      frequency: null,
    },
    paymentType: "ONE_TIME_PAYMENT",
    requiredSkills: [
      { skill: "HTML", yearsOfExperience: 3, isRequired: true },
      { skill: "CSS", yearsOfExperience: 3, isRequired: true },
    ],
    bonusSkills: ["JavaScript", "SEO"],
    experienceLevels: ["ENTRY_LEVEL", "MID_LEVEL"],
    yearsOfExperience: 3,
    deadline: "2024-12-10T23:59:59Z",
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 10,
    title: "Freelance Mobile App Developer",
    company: "App Creators",
    location: "Remote",
    workLocation: "Remote",
    status: "draft",
    createdAt: "2024-11-06T13:30:00Z",
    updatedAt: "2024-11-06T13:30:00Z",
    jobType: "FREELANCE",
    salary: {
      amount: 10000,
      salaryType: "UP_TO",
      rangeMin: null,
      rangeMax: null,
      frequency: null,
    },
    paymentType: "ONE_TIME_PAYMENT",
    requiredSkills: [
      { skill: "Swift", yearsOfExperience: 4, isRequired: true },
      { skill: "React Native", yearsOfExperience: 3, isRequired: true },
    ],
    bonusSkills: [],
    experienceLevels: ["MID_LEVEL"],
    yearsOfExperience: 3,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
  {
    id: 11,
    title: "Mobile App Developer",
    company: "App Innovators",
    location: "Seattle, Washington, United States",
    workLocation: "Remote",
    status: "draft",
    createdAt: "2024-11-12T09:00:00Z",
    updatedAt: "2024-11-12T09:00:00Z",
    jobType: "FULL_TIME",
    salary: {
      amount: 95000,
      salaryType: "EXACT",
      rangeMin: null,
      rangeMax: null,
      frequency: "PER_YEAR",
    },
    paymentType: "SALARY",
    requiredSkills: [
      { skill: "Swift", yearsOfExperience: 2, isRequired: true },
      { skill: "React Native", yearsOfExperience: 2, isRequired: true },
      { skill: "UI Design", yearsOfExperience: 0, isRequired: false },
    ],
    bonusSkills: ["JavaScript", "Objective-C"],
    experienceLevels: ["MID_LEVEL"],
    yearsOfExperience: 3,
    deadline: null,
    requiredDegree: {
      degree: null,
      isRequired: false,
    },
  },
];

function Jobs() {
  const { data: session } = useSession();
  const userType = session?.user?.userType;
  const [jobs, setJobs] = useState(mockJobs);
  const [filter, setFilter] = useState<"all" | "drafts" | "posted">("all");

  useEffect(() => {
    setJobs(
      mockJobs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (filter === "drafts") return job.status === "draft";
    if (filter === "posted") return job.status === "completed";
    return true;
  });

  const postedJobsCount = jobs.filter(
    (job) => job.status === "completed"
  ).length;
  const draftJobsCount = jobs.filter((job) => job.status === "draft").length;

  if (userType !== "CLIENT") {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen">
        <FaTools className="text-6xl text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          We&rsquo;re Building Something Great!
        </h2>
        <p className="text-center text-gray-500">
          This page is currently in development. We can&rsquo;t wait to share it
          with you! Please check back soon for updates.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 mt-4">
        <div className="w-full lg:w-1/4">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
            <div className="text-xl font-semibold mb-4 text-blue-500">
              My Jobs
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg text-white">
                <span>Posted Jobs</span>
                <span className="text-blue-500">{postedJobsCount}</span>
              </div>
              <div className="flex justify-between items-center text-lg text-white">
                <span>Drafts</span>
                <span className="text-blue-500">{draftJobsCount}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 rounded-lg shadow-lg border border-zinc-700">
          <div className="bg-zinc-900 p-6 ">
            <div className="text-xl font-semibold text-blue-500">
              Posted Jobs
            </div>
            {filteredJobs.length > 0 && (
              <div className="flex justify-start items-center gap-4 mt-4">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-full ${
                    filter === "all" ? "bg-blue-500" : "bg-zinc-700"
                  } text-white`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setFilter("drafts")}
                  className={`px-4 py-2 rounded-full ${
                    filter === "drafts" ? "bg-blue-500" : "bg-zinc-700"
                  } text-white`}
                >
                  Drafts
                </button>
                <button
                  onClick={() => setFilter("posted")}
                  className={`px-4 py-2 rounded-full ${
                    filter === "posted" ? "bg-blue-500" : "bg-zinc-700"
                  } text-white`}
                >
                  Posted
                </button>
              </div>
            )}
          </div>
          {filteredJobs.length > 0 && (
            <div className="border-t border-zinc-700" />
          )}
          {filteredJobs.length === 0 ? (
            <div className="bg-zinc-900 p-6 shadow-lg flex flex-col items-center border-b border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                No jobs under this category yet.
              </h3>
              <p className="text-gray-400 text-sm">
                Jobs that you post will show up here.
              </p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className={`bg-zinc-900 p-6 shadow-lg flex flex-col border-b border-zinc-700 ${
                  index === filteredJobs.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xl font-semibold text-blue-500">
                      {job.title}
                    </div>
                    <div className="text-lg text-gray-400">{job.company}</div>
                    <div className="text-sm text-gray-500">
                      {job.location} ({job.workLocation})
                    </div>
                  </div>
                  <Menu as="div" className="relative">
                    <Menu.Button className="text-gray-400 hover:text-blue-500 mt-2">
                      <FiMoreHorizontal size={20} />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {job.status === "draft" && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() => alert(`Editing job ${job.id}`)}
                              >
                                Edit Job
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() => alert(`Deleting job ${job.id}`)}
                              >
                                Delete Draft
                              </button>
                            </Menu.Item>
                          </div>
                        )}
                        {job.status === "completed" && (
                          <Menu.Item>
                            <button
                              className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                              onClick={() => alert(`Editing job ${job.id}`)}
                            >
                              Edit Job
                            </button>
                          </Menu.Item>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex justify-start items-center mt-2">
                  <div className="flex flex-col">
                    {job.status === "draft" ? (
                      <>
                        <div className="flex items-center">
                          <span className="rounded-full text-xs font-bold">
                            Draft
                          </span>
                          <span className="text-xs text-gray-400 mx-2">
                            • Created{" "}
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-blue-500 mt-1">
                          Complete Draft
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <span className="text-xs font-bold">Posted</span>
                          <span className="text-xs text-gray-400 mx-2">
                            • Created{" "}
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="w-full lg:w-1/4">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 flex flex-col items-center">
            <Link href="/post-job">
              <button className="bg-zinc-700 text-white px-4 py-2 rounded-full flex items-center justify-center w-full sm:w-auto">
                <IoIosAddCircleOutline className="mr-2" size={20} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Jobs;
