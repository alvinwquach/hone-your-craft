import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoClose } from "react-icons/io5";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 101 }, (_, i) => currentYear - i);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const educationSchema = z.object({
  school: z.string().min(1, { message: "School name is required" }),
  major: z.string().optional(),
  minor: z.string().optional(),
  startMonth: z.string().optional(),
  startYear: z.string().min(1, { message: "Start year is required" }),
  endMonth: z.string().optional(),
  endYear: z.string().min(1, { message: "End year is required" }),
  gpa: z.string().min(0).max(4).optional(),
  activities: z.string().optional(),
  societies: z.string().optional(),
  description: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

interface AddEducationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  addEducation: (newEducation: any) => void;
}

function AddEducationModal({
  isOpen,
  closeModal,
  addEducation,
}: AddEducationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
  });

  const onSubmit = async (data: EducationFormValues) => {
    try {
      const startDateMonth =
        data.startMonth && months.indexOf(data.startMonth) + 1;
      const endDateMonth = data.endMonth && months.indexOf(data.endMonth) + 1;

      const response = await fetch("/api/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school: data.school,
          majors: data.major ? [data.major] : [],
          minor: data.minor,
          startDateMonth: startDateMonth || undefined,
          startDateYear: parseInt(data.startYear),
          endDateMonth: endDateMonth || undefined,
          endDateYear: parseInt(data.endYear),
          gpa: data.gpa ? parseFloat(data.gpa) : undefined,
          activities: data.activities,
          societies: data.societies,
          description: data.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit education");
      }

      const newEducation = await response.json();
      addEducation(newEducation);

      reset();
      closeModal();
    } catch (error) {
      console.error("Error submitting education:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={closeModal}>
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 text-black" />
      <Dialog.Panel className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-hidden">
        <div className="relative bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Education
            </h3>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            >
              <IoClose className="w-5 h-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 md:p-5 space-y-4 max-h-[65vh] overflow-y-auto"
          >
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-gray-900"
              >
                School
              </label>
              <input
                id="school"
                type="text"
                {...register("school")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {errors.school && (
                <p className="text-sm text-red-500">{errors.school.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="major"
                className="block text-sm font-medium text-gray-900"
              >
                Major
              </label>
              <input
                id="major"
                type="text"
                {...register("major")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {errors.major && (
                <p className="text-sm text-red-500">{errors.major.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="minor"
                className="block text-sm font-medium text-gray-900"
              >
                Minor
              </label>
              <input
                id="minor"
                type="text"
                {...register("minor")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {errors.minor && (
                <p className="text-sm text-red-500">{errors.minor.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startMonth"
                  className="block text-sm font-medium text-gray-900"
                >
                  Start Month
                </label>
                <select
                  id="startMonth"
                  {...register("startMonth")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                {errors.startMonth && (
                  <p className="text-sm text-red-500">
                    {errors.startMonth.message}
                  </p>
                )}
              </div>
              <div className="mt-5">
                <label
                  htmlFor="startYear"
                  className="block sr-only text-sm font-medium text-gray-900"
                >
                  Start Year
                </label>
                <select
                  id="startYear"
                  {...register("startYear")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.startYear && (
                  <p className="text-sm text-red-500">
                    {errors.startYear.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="endMonth"
                  className="block text-sm font-medium text-gray-900"
                >
                  End Month
                </label>
                <select
                  id="endMonth"
                  {...register("endMonth")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                {errors.endMonth && (
                  <p className="text-sm text-red-500">
                    {errors.endMonth.message}
                  </p>
                )}
              </div>
              <div className="mt-5">
                <label
                  htmlFor="endYear"
                  className="block sr-only text-sm font-medium text-gray-900"
                >
                  End Year
                </label>
                <select
                  id="endYear"
                  {...register("endYear")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.endYear && (
                  <p className="text-sm text-red-500">
                    {errors.endYear.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="gpa"
                className="block text-sm font-medium text-gray-900"
              >
                GPA
              </label>
              <input
                id="gpa"
                type="number"
                {...register("gpa")}
                min={0}
                max={4}
                step={0.01}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {errors.gpa && (
                <p className="text-sm text-red-500">{errors.gpa.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="activities"
                className="block text-sm font-medium text-gray-900"
              >
                Activities
              </label>
              <textarea
                id="activities"
                {...register("activities")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
              {errors.activities && (
                <p className="text-sm text-red-500">
                  {errors.activities.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="societies"
                className="block text-sm font-medium text-gray-900"
              >
                Societies
              </label>
              <textarea
                id="societies"
                {...register("societies")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
              {errors.societies && (
                <p className="text-sm text-red-500">
                  {errors.societies.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

export default AddEducationModal;
