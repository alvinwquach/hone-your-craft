import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";

interface Job {
  company: string;
  title: string;
}

interface JobOffer {
  job: Job;
  id: string;
  offerDate: Date;
  offerDeadline: Date;
  salary: string;
}

interface JobOffersProps {
  jobOffers: JobOffer[];
  onDeleteOffer: (offerId: string) => void;
}

function JobOffers({ jobOffers, onDeleteOffer }: JobOffersProps) {
  jobOffers.sort((a, b) => {
    return (
      new Date(a.offerDeadline).getTime() - new Date(b.offerDeadline).getTime()
    );
  });

  if (jobOffers.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-200">
          <thead className="text-xs uppercase bg-zinc-900 text-gray-200">
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
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-zinc-700 border-gray-700">
              <td className="px-6 py-4">N/A</td>
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
      <table className="w-full text-sm text-left rtl:text-right text-gray-200">
        <thead className="text-xs uppercase bg-zinc-900 text-gray-200">
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
            <th scope="col" className="px-6 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {jobOffers.map((offer) => (
            <tr className="border-b bg-gray-800 border-gray-700" key={offer.id}>
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
              <td className="px-6 py-4">
                <button
                  onClick={() => onDeleteOffer(offer.id)}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobOffers;
