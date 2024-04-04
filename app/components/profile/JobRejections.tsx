import React, { useRef, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";
import { RejectionInitiator } from "@prisma/client";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";

interface Job {
  company: string;
  title: string;
}

interface JobRejection {
  job: Job;
  rejectionId: string;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
}

interface JobRejectionsProps {
  jobRejections: JobRejection[];
}
function JobRejections({ jobRejections }: JobRejectionsProps) {
  if (jobRejections.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rejection Date
              </th>
              <th scope="col" className="px-6 py-3">
                Initiated By
              </th>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">N/A</td>
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
              Rejection Date
            </th>
            <th scope="col" className="px-6 py-3">
              Initiated By
            </th>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Title
            </th>
            <th scope="col" className="px-6 py-3">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {jobRejections.map((rejection) => (
            <tr className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">
                <span className="md:hidden">
                  {format(new Date(rejection.date), "MM/dd/yy h:mm a")}
                </span>
                <span className="hidden md:inline">
                  {format(new Date(rejection.date), "MM/dd/yy @ h:mm a")}
                </span>
              </td>
              <td className="px-6 py-4">
                {convertToSentenceCase(rejection.initiatedBy)}
              </td>
              <td className="px-6 py-4">{rejection.job.company}</td>
              <td className="px-6 py-4">{rejection.job.title}</td>
              <td className="px-6 py-4">{rejection.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobRejections;
