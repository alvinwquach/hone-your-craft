import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";

interface JobOffer {
  id: string;
  company: string;
  title: string;
  salary: string;
  offerId: string;
  offerDate: Date;
  offerDeadline: Date;
  job: {
    id: string;
    userId: string;
    company: string;
    title: string;
    description: string;
    industry: string | null;
    location: string | null;
    workLocation: string | null;
    updatedAt: string;
    postUrl: string;
    offer: {
      id: string;
      userId: string;
      jobId: string;
      offerDate: Date;
      offerDeadline: Date;
      salary: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

interface JobOffersProps {
  jobOffers: JobOffer[];
}

function JobOffers({ jobOffers }: JobOffersProps) {
  if (jobOffers.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Offer Date
              </th>
              <th scope="col" className="px-6 py-3">
                Offer Deadline
              </th>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3">
                Salary
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
              Offer Date
            </th>
            <th scope="col" className="px-6 py-3">
              Offer Deadline
            </th>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Job Title
            </th>
            <th scope="col" className="px-6 py-3">
              Salary
            </th>
          </tr>
        </thead>
        <tbody>
          {jobOffers.map((offer) => (
            <tr
              className="border-b bg-gray-800 border-gray-700"
              key={offer.offerId}
            >
              <td className="px-6 py-4">
                <span className="hidden md:inline">
                  {format(offer.offerDate, "MM/dd/yy @ h:mm a")}
                </span>
                <span className="md:hidden">
                  {format(offer.offerDate, "MM/dd/yy  h:mm a")}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="hidden md:inline">
                  {format(offer.offerDeadline, "MM/dd/yy @ h:mm a")}
                </span>
                <span className="md:hidden">
                  {format(offer.offerDeadline, "MM/dd/yy  h:mm a")}
                </span>
              </td>
              <td className="px-6 py-4">{offer.job.company}</td>
              <td className="px-6 py-4">{offer.job.title}</td>
              <td className="px-6 py-4">${offer.salary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobOffers;
