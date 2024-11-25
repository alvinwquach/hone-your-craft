"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, Fragment } from "react";
import useSWR, { mutate } from "swr";
import { Menu, Transition } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  FaCalendarAlt,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCoins,
  FaBriefcase,
  FaToolbox,
  FaWrench,
  FaUserClock,
  FaArrowAltCircleUp,
  FaLevelUpAlt,
} from "react-icons/fa";
import { PiPencilLineFill, PiUsersFour } from "react-icons/pi";

const companySizeLabels = {
  Tiny_1_10: "1 - 10 employees",
  Small_11_50: "11 - 50 employees",
  Medium_51_200: "51 - 200 employees",
  Large_201_500: "201 - 500 employees",
  XLarge_501_1000: "501 - 1000 employees",
  XXLarge_1001_5000: "1001 - 5000 employees",
  Enterprise_5000plus: "5000+ employees",
};

const experienceLabels = {
  LESS_THAN_1_YEAR: "< 1 year",
  ONE_YEAR: "1 year",
  TWO_YEARS: "2 years",
  THREE_YEARS: "3 years",
  FOUR_YEARS: "4 years",
  FIVE_YEARS: "5 years",
  SIX_YEARS: "6 years",
  SEVEN_YEARS: "7 years",
  EIGHT_YEARS: "8 years",
  NINE_YEARS: "9 years",
  TEN_YEARS: "10 years",
  TEN_PLUS_YEARS: "10+ years",
};

const degreeTypeLabels = {
  HIGH_SCHOOL_DIPLOMA: "High School Diploma",
  BACHELORS_DEGREE: "Bachelor's Degree",
  MASTERS_DEGREE: "Master's Degree",
  ASSOCIATES_DEGREE: "Associate's Degree",
  MASTER_OF_BUSINESS_ADMINISTRATION: "Master of Business Administration",
  DOCTOR_OF_LAW: "Doctor of Law",
};

const experienceLevelLabels = {
  INTERN: "Intern",
  TRAINEE: "Trainee",
  JUNIOR: "Junior",
  ASSOCIATE: "Associate",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  VP: "Vice President",
  EXECUTIVE: "Executive",
  C_LEVEL: "C-Level",
};

const paymentTypeLabels = {
  SALARY: "Salary",
  ONE_TIME_PAYMENT: "One-time payment",
};

const jobTypeLabels = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
  FREELANCE: "Freelance",
};

const workLocationLabels = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

enum JobPostingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  FILLED = "FILLED",
  COMPLETED = "COMPLETED",
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  return data.jobPostings || [];
};

function Jobs() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;
  const [filter, setFilter] = useState<"all" | "drafts" | "posted">("all");

  const jobPostingsUrl =
    userRole === "CANDIDATE" ? "/api/job-postings" : "/api/client-jobs";

  const {
    data: jobPostings,
    isLoading: jobPostingsLoading,
    error,
  } = useSWR<JobPosting[]>(jobPostingsUrl, fetcher);

  const getSalaryDisplay = (salary: Salary) => {
    if (!salary) return null;

    let displayText = "";

    const numberFormatter = new Intl.NumberFormat();

    if (salary.salaryType === "STARTING_AT" && salary.amount) {
      displayText += `Starting at $${numberFormatter.format(salary.amount)}`;
    }

    if (salary.salaryType === "UP_TO" && salary.amount) {
      displayText += `Up to $${numberFormatter.format(salary.amount)}`;
    }

    if (salary.salaryType === "RANGE" && salary.rangeMin && salary.rangeMax) {
      displayText += `$${numberFormatter.format(
        salary.rangeMin
      )} - ${numberFormatter.format(salary.rangeMax)}`;
    }

    if (salary.salaryType === "EXACT" && salary.amount) {
      displayText += `$${numberFormatter.format(salary.amount)}`;
    }

    if (salary.frequency) {
      displayText += ` ${
        salary.frequency === "PER_YEAR"
          ? "per year"
          : salary.frequency.replace("_", " ").toLowerCase()
      }`;
    }

    return displayText;
  };

  if (userRole === "CANDIDATE") {
    return (
      <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        {jobPostings?.length === 0 ? (
          <div className="text-center text-xl font-semibold text-gray-600">
            No job postings available.
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-screen-lg mx-auto">
            {jobPostings?.map((jobPosting) => (
              <div
                key={jobPosting.id}
                className="bg-zinc-900 p-6 shadow-lg rounded-lg border-2 border-zinc-700 hover:shadow-xl transition duration-300 my-6"
              >
                <div className="lg:flex space-y-4 lg:space-y-0 lg:space-x-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-semibold text-blue-600">
                          {jobPosting.title}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xl font-medium text-white">
                          {jobPosting.company}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          jobTypeLabels[
                            jobPosting.jobType as keyof typeof jobTypeLabels
                          ]
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {jobTypeLabels[
                          jobPosting.jobType as keyof typeof jobTypeLabels
                        ] || jobPosting.jobType}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 mb-2">
                      <FaCoins className="mr-2 text-white" />
                      <span className="text-lg font-semibold">
                        {getSalaryDisplay(jobPosting.salary)}
                        {jobPosting.paymentType && (
                          <span className="ml-2 text-gray-400">
                            (
                            {paymentTypeLabels[
                              jobPosting.paymentType as keyof typeof paymentTypeLabels
                            ] || jobPosting.paymentType}
                            )
                          </span>
                        )}
                      </span>
                    </div>
                    {jobPosting.requiredDegree?.length > 0 && (
                      <div className="flex items-center text-gray-500 mb-4">
                        <FaGraduationCap className="mr-2 text-white" />{" "}
                        <h4 className="font-semibold text-gray-400 mr-2">
                          Required Education:
                        </h4>
                        <p className="text-gray-600">
                          {jobPosting.requiredDegree.map((degree) => (
                            <span key={degree.id} className="mr-2">
                              {degreeTypeLabels[
                                degree.degreeType as keyof typeof degreeTypeLabels
                              ] || degree.degreeType}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}
                    {jobPosting.deadline && (
                      <div className="flex items-center text-gray-500 mb-4">
                        <FaCalendarAlt className="mr-2 text-white" />{" "}
                        <span className="font-medium text-gray-400">
                          Deadline:{" "}
                          <span className="text-gray-600">
                            {new Date(jobPosting.deadline).toLocaleString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: true,
                                timeZone: "America/Los_Angeles",
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 mb-4">
                      <FaToolbox className="mr-2 text-white" />{" "}
                      <h4 className="font-semibold text-gray-400">
                        Required Skills:
                      </h4>
                    </div>
                    <div className="max-h-40 flex flex-wrap gap-2">
                      {jobPosting.requiredSkills
                        .filter((skill) => skill.yearsOfExperience >= 1)
                        .map((skill) => (
                          <div key={skill.id} className="flex items-center">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                              {skill.skill.name}
                            </span>
                            {skill.yearsOfExperience > 0 && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({skill.yearsOfExperience} yr
                                {skill.yearsOfExperience > 1 ? "s" : ""})
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    {jobPosting.bonusSkills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center text-gray-500">
                          <FaWrench className="mr-2 text-white" />{" "}
                          <h4 className="font-semibold text-gray-400">
                            Bonus Skills:
                          </h4>
                        </div>
                        <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
                          {jobPosting.bonusSkills.map((skill) => (
                            <div key={skill.id} className="flex items-center">
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                                {skill.skill.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaArrowAltCircleUp className="mr-2 text-white" />{" "}
                      <span className="font-medium text-gray-400">
                        {jobPosting.experienceLevels?.length > 0
                          ? jobPosting.experienceLevels
                              .map(
                                (level) =>
                                  experienceLevelLabels[
                                    level as keyof typeof experienceLevelLabels
                                  ] || level
                              )
                              .join(", ")
                          : "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-2">
                      <FaLevelUpAlt className="mr-2 text-white" />{" "}
                      <span className="font-medium text-gray-400">
                        {experienceLabels[
                          jobPosting.yearsOfExperience as keyof typeof experienceLabels
                        ] || jobPosting.yearsOfExperience}
                      </span>
                    </div>
                  </div>
                  <div className="lg:hidden border-t-2 border-gray-700 my-4"></div>
                  <div className="lg:block border-l-2 border-gray-700 mx-4"></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center text-gray-500 mb-4">
                      <PiUsersFour className="mr-2 text-white" />{" "}
                      <span className="font-medium text-gray-400">
                        {companySizeLabels[
                          jobPosting.companySize as keyof typeof companySizeLabels
                        ] || jobPosting.companySize}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4">
                      <FaBriefcase className="mr-2 text-white" />{" "}
                      <p className="font-medium text-gray-400">
                        {jobPosting.industry.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4">
                      <FaMapMarkerAlt className="mr-2 text-white" />
                      <span className="font-medium text-gray-400">
                        {jobPosting.location} (
                        {workLocationLabels[
                          jobPosting.workLocation as keyof typeof workLocationLabels
                        ] || jobPosting.workLocation}
                        )
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4">
                      <span className="text-xs text-gray-400 mx-2">
                        Posted{" "}
                        {formatDistanceToNow(new Date(jobPosting.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <a
                    href={jobPosting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-200"
                    aria-label={`Open link to apply to job at ${jobPosting.url}`}
                    role="button"
                  >
                    <PiPencilLineFill className="inline-block mr-2" />
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (jobPostingsLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading job postings</div>;
  }

  const handleDeleteJobPosting = async (jobId: string) => {
    const updatedJobs = jobPostings?.filter((job) => job.id !== jobId) ?? [];
    mutate("/api/job-postings", updatedJobs, false);
    try {
      const response = await fetch(`/api/job-posting/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete job posting");
      }
      toast.success("Job posting deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      mutate("/api/job-postings", jobPostings, false);
      toast.error("An error occurred while deleting the job posting.");
    }
  };

  const filteredJobs = jobPostings?.filter((job) => {
    if (filter === "drafts") return job.status === JobPostingStatus.DRAFT;
    if (filter === "posted") return job.status === JobPostingStatus.OPEN;
    return true;
  });

  const postedJobsCount = jobPostings?.filter(
    (job) => job.status === JobPostingStatus.OPEN
  ).length;
  const draftJobsCount = jobPostings?.filter(
    (job) => job.status === JobPostingStatus.DRAFT
  ).length;

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
          </div>
          {filteredJobs?.length === 0 ? (
            <div className="bg-zinc-900 p-6 shadow-lg flex flex-col items-center border-b border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                No jobs under this category yet.
              </h3>
              <p className="text-gray-400 text-sm">
                Jobs that you post will show up here.
              </p>
            </div>
          ) : (
            filteredJobs?.map((job, index) => (
              <div
                key={job.id}
                className={`bg-zinc-900 p-6 shadow-lg flex flex-col border-b border-zinc-700 ${
                  index === filteredJobs?.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xl font-semibold text-blue-500">
                      {job.title}
                    </div>
                    <div className="text-lg text-gray-400">{job.company}</div>
                    <div className="text-sm text-gray-500">
                      {job.location} (
                      {
                        workLocationLabels[
                          job.workLocation as keyof typeof workLocationLabels
                        ]
                      }
                      )
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
                        {job.status === JobPostingStatus.DRAFT && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Editing draft job ${job.id}`)
                                }
                              >
                                Edit Draft
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Deleting draft job ${job.id}`)
                                }
                              >
                                Delete Draft
                              </button>
                            </Menu.Item>
                          </div>
                        )}
                        {job.status === JobPostingStatus.OPEN && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Editing posted job ${job.id}`)
                                }
                              >
                                Edit Job
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() => handleDeleteJobPosting(job.id)}
                              >
                                Delete Job
                              </button>
                            </Menu.Item>
                          </div>
                        )}
                        {job.status === JobPostingStatus.COMPLETED && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Editing completed job ${job.id}`)
                                }
                              >
                                Edit Job
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Deleting completed job ${job.id}`)
                                }
                              >
                                Delete Job
                              </button>
                            </Menu.Item>
                          </div>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex justify-start items-center mt-2">
                  <div className="flex flex-col">
                    {job.status === JobPostingStatus.DRAFT ? (
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
