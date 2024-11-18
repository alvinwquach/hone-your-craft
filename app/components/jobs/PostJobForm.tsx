"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import {
  WorkLocation,
  YearsOfExperience,
  ExperienceLevel,
  JobType,
  PaymentType,
  DegreeType,
  SalaryType,
  Frequency,
} from "@prisma/client";
import { skillKeywords } from "@/app/lib/skillKeywords";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  industry: z.array(z.string()).optional(),
  workLocation: z.nativeEnum(WorkLocation),
  location: z.string().min(1, "Location is required"),
  url: z.optional(z.string().url("Invalid URL format")),
  deadline: z.date().optional(),
  experienceLevels: z.array(z.string()).optional(),
  jobType: z.nativeEnum(JobType),
  paymentType: z.nativeEnum(PaymentType),
  description: z.string().min(1, "Job description is required"),
  yearsOfExperience: z.nativeEnum(YearsOfExperience).optional(),
  requiredSkills: z.array(
    z.object({
      skill: z.string(),
      yearsOfExperience: z.number().optional(),
      isRequired: z.boolean().nullable(),
    })
  ),
  bonusSkills: z.array(
    z.object({
      skill: z.string().optional(),
      yearsOfExperience: z.number().optional().nullable(),
      isRequired: z.boolean().nullable(),
    })
  ),
  requiredDegree: z
    .object({
      degree: z.nativeEnum(DegreeType).nullable().optional(),
      isRequired: z.boolean(),
    })
    .optional(),
  salary: z.object({
    amount: z.number().nullable(),
    salaryType: z.nativeEnum(SalaryType),
    rangeMin: z.number().nullable(),
    rangeMax: z.number().nullable(),
    frequency: z.string().nullable(),
  }),
});

type JobFormData = z.infer<typeof jobSchema>;

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

const salaryTypeLabels = {
  RANGE: "Range",
  STARTING_AT: "Starting at",
  UP_TO: "Up to",
  EXACT: "Exact",
};

const frequencyLabels = {
  PER_YEAR: "Per year",
  PER_MONTH: "Per month",
  PER_HOUR: "Per hour",
};

const workLocationLabels = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

interface SkillOption {
  value: string;
  label: string;
}

interface ExperienceLevelOption {
  value: string;
  label: string;
}

const PostJobForm = () => {
  const [selectedRequiredSkills, setSelectedRequiredSkills] = useState<
    SkillOption[]
  >([]);

  const [selectedBonusSkills, setSelectedBonusSkills] = useState<SkillOption[]>(
    []
  );
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    ExperienceLevelOption[]
  >([]);
  const [isDegreeCardVisible, setIsDegreeCardVisible] = useState(true);
  const [hiddenSkills, setHiddenSkills] = useState<{ [key: number]: boolean }>(
    {}
  );

  const router = useRouter();

  const { control, handleSubmit, watch, setValue } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      workLocation: WorkLocation.ONSITE,
      location: "",
      url: "",
      deadline: undefined,
      yearsOfExperience: undefined,
      experienceLevels: [],
      jobType: JobType.FULL_TIME,
      paymentType: undefined,
      description: "",
      requiredSkills: [
        {
          skill: "",
          yearsOfExperience: 0,
          isRequired: false,
        },
      ],
      bonusSkills: [
        {
          skill: "",
          yearsOfExperience: 0,
          isRequired: null,
        },
      ],
      salary: {
        amount: 0,
        salaryType: "EXACT",
        rangeMin: null,
        rangeMax: null,
        frequency: Frequency.PER_YEAR,
      },
      requiredDegree: {
        degree: null,
        isRequired: false,
      },
    },
  });

  const {
    fields: requiredSkillFields,
    append: appendRequiredSkill,
    remove: removeRequiredSkill,
  } = useFieldArray({
    control,
    name: "requiredSkills",
  });

  const selectedDegree = watch("requiredDegree.degree");
  const salaryType = watch("salary.salaryType");
  const alphabeticalSkillKeywords = skillKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const availableBonusSkills = alphabeticalSkillKeywords.filter(
    (keyword) =>
      !selectedRequiredSkills.some((skill) => skill.value === keyword)
  );

  const handleHideSkill = (index: number) => {
    // Get the current requiredSkills array from the form state
    const updatedSkills = [...watch("requiredSkills")];

    // Update the skill at the given index
    updatedSkills[index] = {
      ...updatedSkills[index],
      yearsOfExperience: 0, // Set yearsOfExperience to 0
      isRequired: null, // Set isRequired to false
    };

    // Update the form state with the modified skills array
    setValue("requiredSkills", updatedSkills);

    // Update the hiddenSkills state to hide the card
    setHiddenSkills((prevState) => ({
      ...prevState,
      [index]: true, // Mark the skill as hidden
    }));
  };

  const handleExperienceLevelChange = (selected: any) => {
    setSelectedExperienceLevels(selected || []);
    const experienceLevelValues = selected.map((level: any) => level.value);
    setValue("experienceLevels", experienceLevelValues);
  };

  const handleYearsOfExperienceChange = (index: number, value: number) => {
    setValue(`requiredSkills.${index}.yearsOfExperience`, value);
  };

  const handleSalaryAmountChange = (value: number) => {
    setValue("salary.amount", value);
  };

  const handleHideDegreeCard = () => {
    setIsDegreeCardVisible(false);
    setValue("requiredDegree", { degree: null, isRequired: false });
  };

  const updateRequiredSkill = (
    index: number,
    isRequired: boolean,
    watch: any,
    setValue: any
  ) => {
    const updatedSkills = [...watch("requiredSkills")];
    updatedSkills[index].isRequired = isRequired;
    setValue("requiredSkills", updatedSkills);
  };

  const handleRequiredSkillChange = (selected: any) => {
    setSelectedRequiredSkills(selected || []);
  };

  const handleBonusSkillsChange = (selected: any) => {
    setSelectedBonusSkills(selected || []);
  };

  useEffect(() => {
    const selectedSkillValues = selectedRequiredSkills.map(
      (skill) => skill.value
    );
    requiredSkillFields.forEach((field, index) => {
      if (!selectedSkillValues.includes(field.skill)) {
        removeRequiredSkill(index);
      }
    });
    selectedRequiredSkills.forEach((skill) => {
      if (!requiredSkillFields.some((field) => field.skill === skill.value)) {
        appendRequiredSkill({
          skill: skill.value,
          yearsOfExperience: 1,
          isRequired: false,
        });
      }
    });
  }, [
    selectedRequiredSkills,
    appendRequiredSkill,
    requiredSkillFields,
    removeRequiredSkill,
  ]);

  useEffect(() => {
    if (salaryType !== SalaryType.RANGE) {
      setValue("salary.rangeMin", null);
      setValue("salary.rangeMax", null);
    }
  }, [salaryType, setValue]);

  useEffect(() => {
    setValue(
      "bonusSkills",
      selectedBonusSkills.map((skill) => ({
        skill: skill.value,
        yearsOfExperience: null,
        isRequired: null,
      }))
    );
  }, [selectedBonusSkills, setValue]);

  useEffect(() => {
    if (watch("paymentType") === PaymentType.ONE_TIME_PAYMENT) {
      setValue("salary.frequency", null);
    }
  }, [watch("paymentType"), setValue]);

  const customSelectStyles = {
    control: (styles: any) => ({
      ...styles,
      backgroundColor: "#171717",
      borderColor: "#333",
      color: "#fff",
      borderRadius: "0.375rem",
      padding: "0.5rem",
    }),
    option: (styles: any) => ({
      ...styles,
      backgroundColor: "#2c2c2c",
      color: "#eee",
      ":hover": {
        backgroundColor: "#444",
      },
    }),
  };

  const onSubmit = async (data: JobFormData) => {
    console.log("Form Data Submitted", data);

    try {
      const response = await fetch("/api/job-posting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(data), 
      });

      if (response.ok) {
        const responseData = await response.json(); 
        console.log("Success:", responseData);

        toast.success("Job posted successfully!");
        setTimeout(() => {
          router.push("/jobs"); 
        }, 1500);
      } else {
        console.error("Error: ", response.statusText);

        toast.error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Request failed", error);
      toast.error("Failed to post job. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 max-w-7xl mx-auto  rounded-lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-gray-300"
          >
            Job Title
          </label>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter job title"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              />
            )}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="company"
            className="text-sm font-semibold text-gray-300"
          >
            Company
          </label>
          <Controller
            control={control}
            name="company"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter company name"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label
            htmlFor="workLocation"
            className="text-sm font-semibold text-gray-300"
          >
            Work Location
          </label>
          <Controller
            control={control}
            name="workLocation"
            render={({ field }) => (
              <select
                {...field}
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              >
                {Object.values(WorkLocation).map((location) => (
                  <option key={location} value={location}>
                    {workLocationLabels[location]}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="location"
            className="text-sm font-semibold text-gray-300"
          >
            Location
          </label>
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
                placeholder="Enter job location"
              />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="url" className="text-sm font-semibold text-gray-300">
            Job URL
          </label>
          <Controller
            control={control}
            name="url"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
                placeholder="Enter job url"
              />
            )}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="deadline"
            className="text-sm font-semibold text-gray-300 "
          >
            Application Deadline
          </label>
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => {
              const formatDateForInput = (date: Date | undefined): string => {
                if (!date) return "";
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                return `${year}-${month}-${day}T${hours}:${minutes}`;
              };

              return (
                <input
                  {...field}
                  type="datetime-local"
                  className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  style={{
                    backgroundColor: "#171717",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  placeholder="Enter application deadline"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              );
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label
            htmlFor="yearsOfExperience"
            className="text-sm font-semibold text-gray-300"
          >
            Years of Experience
          </label>
          <Controller
            control={control}
            name="yearsOfExperience"
            render={({ field }) => (
              <select
                {...field}
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              >
                <option value="">Select experience</option>
                {Object.values(YearsOfExperience).map((experience) => (
                  <option key={experience} value={experience}>
                    {experienceLabels[experience]}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="experienceLevels"
            className="text-sm font-semibold text-gray-300 mt-2 "
          >
            Experience Levels
          </label>
          <Select
            isMulti
            options={Object.values(ExperienceLevel).map((level) => ({
              label: experienceLevelLabels[level],
              value: level,
            }))}
            onChange={handleExperienceLevelChange}
            value={selectedExperienceLevels}
            styles={customSelectStyles}
            placeholder="Select experience levels"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label
            htmlFor="jobType"
            className="text-sm font-semibold text-gray-300"
          >
            Job Type
          </label>
          <Controller
            control={control}
            name="jobType"
            render={({ field }) => (
              <select
                {...field}
                className="mt-2 p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              >
                {Object.values(JobType).map((type) => (
                  <option key={type} value={type}>
                    {jobTypeLabels[type]}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="paymentType"
            className="text-sm font-semibold text-gray-300 mt-2"
          >
            Payment Type
          </label>
          <Controller
            control={control}
            name="paymentType"
            render={({ field }) => (
              <select
                {...field}
                className="p-3 border border-gray-300 rounded-md bg-neutral-900 text-white"
                value={field.value || ""}
                style={{
                  backgroundColor: "#171717",
                  borderColor: "#333",
                  color: "#fff",
                }}
              >
                <option value="" disabled>
                  Select a payment type
                </option>
                {Object.values(PaymentType).map((type) => (
                  <option key={type} value={type}>
                    {paymentTypeLabels[type]}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="description"
          className="text-sm font-semibold text-gray-300"
        >
          Job Description
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              {...field}
              className="mt-2 p-3 border border-gray-300 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter job description"
              rows={6}
              style={{
                backgroundColor: "#171717",
                borderColor: "#333",
                color: "#fff",
              }}
            />
          )}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="requiredSkills"
          className="text-sm font-semibold text-gray-300"
        >
          Required Skills
        </label>
        <Select
          isMulti
          options={alphabeticalSkillKeywords.map((skill) => ({
            label: skill,
            value: skill,
          }))}
          onChange={handleRequiredSkillChange}
          value={selectedRequiredSkills}
          styles={customSelectStyles}
          placeholder="Select skills"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="bonusSkills"
          className="text-sm font-semibold text-gray-300"
        >
          Bonus Skills
        </label>
        <Select
          isMulti
          options={availableBonusSkills.map((skill) => ({
            label: skill,
            value: skill,
          }))}
          onChange={handleBonusSkillsChange}
          value={selectedBonusSkills}
          styles={customSelectStyles}
          placeholder="Select bonus skills"
        />
      </div>
      <div className="flex flex-col space-y-4">
        <label
          htmlFor="salary.salaryType"
          className="text-sm font-semibold text-gray-300"
        >
          Salary Type
        </label>
        <Controller
          control={control}
          name="salary.salaryType"
          render={({ field }) => (
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              {Object.values(SalaryType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    {...field}
                    type="radio"
                    id={type}
                    value={type}
                    checked={field.value === type}
                    onChange={() => field.onChange(type)}
                    className="h-5 w-5 text-indigo-600"
                  />
                  <label htmlFor={type} className="text-sm text-gray-300">
                    {salaryTypeLabels[type]}
                  </label>
                </div>
              ))}
            </div>
          )}
        />
      </div>
      {watch("paymentType") !== PaymentType.ONE_TIME_PAYMENT && (
        <div>
          {(watch("salary.salaryType") === SalaryType.EXACT ||
            watch("salary.salaryType") === SalaryType.STARTING_AT ||
            watch("salary.salaryType") === SalaryType.UP_TO) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor="salary.amount"
                  className="text-sm font-semibold text-gray-300"
                >
                  Amount
                </label>
                <Controller
                  control={control}
                  name="salary.amount"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="p-3 border border-gray-300 rounded-md bg-neutral-900 text-white"
                      placeholder="Enter salary amount"
                      style={{
                        backgroundColor: "#171717",
                        borderColor: "#333",
                        color: "#fff",
                      }}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        handleSalaryAmountChange(parseFloat(e.target.value))
                      }
                    />
                  )}
                />
              </div>
              {watch("paymentType") !== PaymentType.ONE_TIME_PAYMENT && (
                <div className="flex flex-col">
                  <label
                    htmlFor="salary.frequency"
                    className="text-sm font-semibold text-gray-300"
                  >
                    Frequency
                  </label>
                  <Controller
                    control={control}
                    name="salary.frequency"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={field.value ?? Frequency.PER_YEAR}
                        style={{
                          backgroundColor: "#171717",
                          borderColor: "#333",
                          color: "#fff",
                        }}
                      >
                        {Object.values(Frequency).map((type) => (
                          <option key={type} value={type}>
                            {frequencyLabels[type]}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              )}
            </div>
          )}
          {watch("salary.salaryType") === SalaryType.RANGE && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor="salary.rangeMin"
                  className="text-sm font-semibold text-gray-300"
                >
                  Min Range
                </label>
                <Controller
                  control={control}
                  name="salary.rangeMin"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="p-3 border border-gray-300 rounded-md bg-neutral-900 text-white"
                      placeholder="Min salary range"
                      value={field.value ?? ""}
                      style={{
                        backgroundColor: "#171717",
                        borderColor: "#333",
                        color: "#fff",
                      }}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        setValue("salary.rangeMin", value);
                      }}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="salary.rangeMax"
                  className="text-sm font-semibold text-gray-300"
                >
                  Max Range
                </label>
                <Controller
                  control={control}
                  name="salary.rangeMax"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="p-3 border border-gray-300 rounded-md bg-neutral-900 text-white"
                      placeholder="Max salary range"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        setValue("salary.rangeMax", value);
                      }}
                      style={{
                        backgroundColor: "#171717",
                        borderColor: "#333",
                        color: "#fff",
                      }}
                    />
                  )}
                />
              </div>
              {watch("paymentType") !== PaymentType.ONE_TIME_PAYMENT && (
                <div className="flex flex-col">
                  <label
                    htmlFor="salary.frequency"
                    className="text-sm font-semibold text-gray-300"
                  >
                    Frequency
                  </label>
                  <Controller
                    control={control}
                    name="salary.frequency"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={field.value ?? Frequency.PER_YEAR}
                        style={{
                          backgroundColor: "#171717",
                          borderColor: "#333",
                          color: "#fff",
                        }}
                      >
                        {Object.values(Frequency).map((type) => (
                          <option key={type} value={type}>
                            {frequencyLabels[type]}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {watch("paymentType") === PaymentType.ONE_TIME_PAYMENT && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="salary.amount"
                className="text-sm font-semibold text-gray-300"
              >
                Amount
              </label>
              <Controller
                control={control}
                name="salary.amount"
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="p-3 border border-gray-300 rounded-md bg-neutral-900 text-white"
                    placeholder="Enter salary amount"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      handleSalaryAmountChange(parseFloat(e.target.value))
                    }
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}
      {isDegreeCardVisible && (
        <div className="bg-zinc-700 bg-opacity-80 p-8 rounded-lg shadow-md relative">
          <button
            type="button"
            onClick={handleHideDegreeCard}
            className="absolute top-4 right-2 text-white text-2xl"
          >
            <AiOutlineClose />
          </button>
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="requiredDegree.degree"
              className="text-sm font-semibold text-gray-300"
            >
              Have you completed the following level of education:{" "}
              <span>
                <span className="text-indigo-400">
                  {selectedDegree
                    ? degreeTypeLabels[selectedDegree]
                    : "[Degree]"}
                </span>
              </span>
              ?
              <span className="bg-blue-500 ml-2 p-1 rounded-lg">
                Recommended
              </span>
            </label>
            <div className="border-t border-gray-500 my-4 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col">
              <label
                htmlFor="requiredDegree.degree"
                className="text-sm font-semibold text-gray-300"
              >
                Degree
              </label>
              <Controller
                control={control}
                name="requiredDegree.degree"
                render={({ field }) => (
                  <select
                    {...field}
                    className="p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={field.value || ""}
                    style={{
                      backgroundColor: "#171717",
                      borderColor: "#333",
                      color: "#fff",
                    }}
                  >
                    <option value="" disabled>
                      Select a degree
                    </option>
                    {Object.values(DegreeType).map((type) => (
                      <option key={type} value={type}>
                        {degreeTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0">
              <div className="flex flex-col">
                <label
                  htmlFor="idealAnswer"
                  className="text-sm font-semibold text-gray-300"
                >
                  Ideal Answer
                </label>
                <span className="text-sm text-gray-300 mt-2">Yes</span>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={watch("requiredDegree.isRequired")}
                  onChange={(e) =>
                    setValue("requiredDegree.isRequired", e.target.checked)
                  }
                  className="h-5 w-5 text-indigo-600"
                />
                <span className="text-sm text-gray-300">
                  Must-have Qualification
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {requiredSkillFields.map((item, index) => {
        if (hiddenSkills[index]) return null;
        return (
          <div
            key={index}
            className="space-y-6 p-6 bg-zinc-700 bg-opacity-70 rounded-lg shadow-md relative"
          >
            <div className="flex justify-between items-center  w-full">
              <div className="flex flex-col">
                <label
                  htmlFor={`requiredSkills.${index}.yearsOfExperience`}
                  className="text-sm font-semibold text-gray-300"
                >
                  How many years of experience do you have with {item.skill}?*
                  <span className="bg-blue-500 ml-2 p-1 rounded-lg text-xs">
                    Recommended
                  </span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => handleHideSkill(index)}
                className="absolute top-4 right-2 text-white text-2xl"
              >
                <AiOutlineClose />
              </button>
            </div>
            <div className="border-t border-gray-500 my-4 w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor={`requiredSkills.${index}.skill`}
                  className="text-sm font-semibold text-gray-300"
                >
                  Skill*
                </label>
                <div
                  style={{
                    backgroundColor: "#171717",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  className="p-3 border border-gray-700 rounded-md bg-neutral-900 text-white"
                >
                  {item.skill}
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0">
                <div className="flex flex-col">
                  <label
                    htmlFor={`requiredSkills.${index}.yearsOfExperience`}
                    className="text-sm font-semibold text-gray-300"
                  >
                    Ideal answer (minimum):
                  </label>
                  <Controller
                    control={control}
                    name={`requiredSkills.${index}.yearsOfExperience`}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        style={{
                          backgroundColor: "#171717",
                          borderColor: "#333",
                          color: "#fff",
                        }}
                        className="p-3 border border-gray-700 rounded-md bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter years of experience"
                        onChange={(e) =>
                          handleYearsOfExperienceChange(
                            index,
                            Number(e.target.value)
                          )
                        }
                      />
                    )}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <input
                    type="checkbox"
                    id={`isRequired-${index}`}
                    checked={item.isRequired || false}
                    onChange={(e) =>
                      updateRequiredSkill(
                        index,
                        e.target.checked,
                        watch,
                        setValue
                      )
                    }
                    className="h-5 w-5 text-indigo-600"
                  />
                  <span className="text-sm text-gray-300">
                    Must-have qualification
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-zinc-600 text-white p-3 rounded-full hover:bg-zinc-700 w-48"
        >
          Post Job
        </button>
      </div>
    </form>
  );
};

export default PostJobForm;
