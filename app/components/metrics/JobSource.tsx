import { JobPosting } from "@/app/metrics/page";
import React from "react";

interface JobSourceProps {
  jobPostings: JobPosting[];
}

function JobSource({ jobPostings }: JobSourceProps) {
  if (jobPostings.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Post Url
              </th>
              <th scope="col" className="px-6 py-3">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-400">
        <thead className="text-xs uppercase bg-gray-900 text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Title
            </th>
            <th scope="col" className="px-6 py-3">
              Post URL
            </th>
            <th scope="col" className="px-6 py-3">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {jobPostings.map((jobPosting) => (
            <tr
              key={jobPosting.id}
              className="border-b bg-gray-800 border-gray-700"
            >
              <td className="px-6 py-4">{jobPosting.company}</td>
              <td className="px-6 py-4">{jobPosting.title}</td>
              <td className="px-6 py-4">
                <a
                  href={jobPosting.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View job posting for ${jobPosting.title} at ${jobPosting.company}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {jobPosting.postUrl}
                </a>
              </td>
              <td className="px-6 py-4">{jobPosting.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobSource;
