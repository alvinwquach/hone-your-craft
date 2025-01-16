"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import {
  CompanySize,
  WorkLocation,
  YearsOfExperience,
  ExperienceLevel,
  JobType,
  PaymentType,
  DegreeType,
  SalaryType,
  Frequency,
} from "@prisma/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams, useRouter } from "next/navigation";
import { industryKeywords } from "@/app/lib/industryKeywords";
import { skillKeywords } from "@/app/lib/skillKeywords";
import { AiOutlineClose } from "react-icons/ai";

interface JobFormData {
  title: string;
  description: string;
  salary: {
    amount: number;
    salaryType: "EXACT" | "RANGE" | "STARTING_AT" | "UP_TO";
    rangeMin: number | null;
    rangeMax: number | null;
    frequency: "PER_YEAR" | "PER_MONTH" | "PER_HOUR";
  };
  company: string;
  companySize: CompanySize;
  location: string;
  workLocation: WorkLocation;
  experienceLevels: ExperienceLevel[];
  requiredSkills: {
    skill: string;
    yearsOfExperience: number;
    isRequired: boolean | null;
  }[];
  bonusSkills: {
    skill: string;
    yearsOfExperience: number | null;
    isRequired: boolean | null;
  }[];
  jobType: JobType;
  deadline: Date | undefined;
  url: string;
  industry: string[];
  yearsOfExperience: YearsOfExperience | undefined;
  paymentType: PaymentType | undefined;
  requiredDegree: {
    degree: DegreeType | null;
    isRequired: boolean;
  };
}

const companySizeLabels: { [key in keyof typeof CompanySize]: string } = {
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

interface IndustryOption {
  value: string;
  label: string;
}

const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditJobForm = ({ jobData, jobId }: any) => {
  const [isDegreeCardVisible, setIsDegreeCardVisible] = useState(true);

  const [selectedIndustries, setSelectedIndustries] = useState<
    IndustryOption[]
  >([]);

  const [selectedRequiredSkills, setSelectedRequiredSkills] = useState<
    SkillOption[]
  >([]);

  const [selectedBonusSkills, setSelectedBonusSkills] = useState<SkillOption[]>(
    []
  );

  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    ExperienceLevelOption[]
  >([]);

  const [hiddenSkills, setHiddenSkills] = useState<{ [key: number]: boolean }>(
    {}
  );

  const router = useRouter();

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<JobFormData>({
      defaultValues: {
        title: jobData?.title || "",
        description: jobData?.description || "",
        salary: jobData?.salary?.amount || "",
        company: jobData?.company || "",
        companySize: jobData?.companySize || "",
        location: jobData?.location || "",
        workLocation: jobData?.workLocation || "",
        experienceLevels: jobData?.experienceLevels || [],
        requiredSkills:
          jobData?.requiredSkills?.map((skill: any) => ({
            skill: skill.skill.name,
            yearsOfExperience: skill.yearsOfExperience || 0,
            isRequired: skill.isRequired || false,
          })) || [],
        bonusSkills:
          jobData?.bonusSkills?.map((skill: any) => ({
            skill: skill.skill.name || skill,
            yearsOfExperience: skill.yearsOfExperience ?? null,
            isRequired: skill.isRequired ?? null,
          })) || [],
        jobType: jobData?.jobType || "",
        deadline: jobData?.deadline || "",
        url: jobData?.url || "",
        industry: jobData?.industry || [],
        yearsOfExperience: jobData?.yearsOfExperience || "",
        paymentType: jobData?.paymentType || "",
        requiredDegree: jobData?.requiredDegree?.[0] || {
          degreeType: null,
          isRequired: false,
        },
      },
    });

  const selectedDegree = watch("requiredDegree.degree");
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const alphabeticalSkillKeywords = skillKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const availableBonusSkills = alphabeticalSkillKeywords.filter(
    (keyword) =>
      !selectedRequiredSkills.some((skill) => skill.value === keyword)
  );

  const alphabeticalIndustryKeywords = industryKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const handleIndustrySkillChange = (selected: any) => {
    setSelectedIndustries(selected || []);
    setValue(
      "industry",
      selected ? selected.map((item: any) => item.value) : []
    );
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

  interface SkillField {
    id: string;
    skill: string;
    yearsOfExperience: number;
    isRequired: boolean;
  }

  const {
    fields: requiredSkillFields,
    append: appendRequiredSkill,
    remove: removeRequiredSkill,
  } = useFieldArray({
    control,
    name: "requiredSkills",
  });

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

  const handleHideSkill = (index: number) => {
    const updatedSkills = [...watch("requiredSkills")];

    updatedSkills[index] = {
      ...updatedSkills[index],
      yearsOfExperience: 0,
      isRequired: null,
    };

    setValue("requiredSkills", updatedSkills);

    setHiddenSkills((prevState) => ({
      ...prevState,
      [index]: true,
    }));
  };

  const handleRequiredSkillChange = (selected: any) => {
    setSelectedRequiredSkills(selected || []);

    setValue(
      "requiredSkills",
      selected
        ? selected.map((skill: any) => ({
            skill: skill.value,
            yearsOfExperience: 1,
            isRequired: true,
          }))
        : []
    );
  };

  const handleBonusSkillsChange = (selected: any) => {
    setSelectedBonusSkills(selected || []);

    setValue(
      "bonusSkills",
      selected
        ? selected.map((skill: any) => ({
            skill: skill.value,
            yearsOfExperience: false,
            isRequired: null,
          }))
        : []
    );
  };

  useEffect(() => {
    const selectedSkillValues = selectedRequiredSkills.map(
      (skill) => skill.value
    );
    requiredSkillFields.forEach((field, index) => {
      if (!selectedSkillValues.includes(field.skill as any)) {
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
    if (!jobData) return;

    if (jobData.experienceLevels) {
      const selectedExperienceLevelOptions = jobData.experienceLevels.map(
        (level: keyof typeof ExperienceLevel) => ({
          value: level,
          label: experienceLevelLabels[level],
        })
      );
      setSelectedExperienceLevels(selectedExperienceLevelOptions);
      setValue("experienceLevels", selectedExperienceLevelOptions);
    }

    if (jobData.requiredSkills) {
      const requiredSkillsOptions = jobData.requiredSkills.map(
        (skill: any) => ({
          value: skill.skill.name,
          label: skill.skill.name,
        })
      );
      setSelectedRequiredSkills(requiredSkillsOptions);
      setValue("requiredSkills", requiredSkillsOptions);
    }

    if (jobData.bonusSkills) {
      const bonusSkillsOptions = jobData.bonusSkills.map((skill: string) => ({
        value: skill,
        label: skill,
      }));
      setSelectedBonusSkills(bonusSkillsOptions);
      setValue(
        "bonusSkills",
        bonusSkillsOptions.map((skill: any) => ({
          skill: skill.value,
          yearsOfExperience: null,
          isRequired: null,
        }))
      );
    }

    if (jobData.requiredDegree && jobData.requiredDegree.length > 0) {
      setValue("requiredDegree.degree", jobData.requiredDegree[0].degreeType);
      setValue(
        "requiredDegree.isRequired",
        jobData.requiredDegree[0].isRequired
      );
    }

    if (jobData.industry) {
      const selectedIndustryOptions = jobData.industry.map(
        (industry: string) => ({
          value: industry,
          label: industry,
        })
      );
      setSelectedIndustries(selectedIndustryOptions);
      setValue("industry", selectedIndustryOptions);
    }
  }, [jobData, setValue]);

  const customSelectStyles = {
    control: (styles: any) => ({
      ...styles,
      backgroundColor: "#171717",
      borderColor: "#333",
      color: "#fff",
      borderRadius: "0.375rem",
      padding: "0.5rem",
    }),
    input: (styles: any) => ({
      ...styles,
      color: "#fff",
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: "#bbb",
    }),
    option: (styles: any) => ({
      ...styles,
      backgroundColor: "#2c2c2c",
      color: "#eee",
      ":hover": {
        backgroundColor: "#444",
      },
    }),
    multiValue: (styles: any) => ({
      ...styles,
      backgroundColor: "#444",
      color: "#fff",
    }),
    multiValueLabel: (styles: any) => ({
      ...styles,
      color: "#fff",
    }),
    multiValueRemove: (styles: any) => ({
      ...styles,
      color: "#fff",
      ":hover": {
        backgroundColor: "#e11d48",
      },
    }),
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const response = await fetch(`/api/job-posting/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();

        toast.success("Job posting updated successfully!");
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
    <section>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-6 max-w-7xl mx-auto  rounded-lg"
      >
        {/* Job Title */}
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
              htmlFor="companySize"
              className="text-sm font-semibold text-gray-300"
            >
              Company Size
            </label>
            <Controller
              control={control}
              name="companySize"
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
                  {Object.values(CompanySize).map((size) => (
                    <option key={size} value={size}>
                      {companySizeLabels[size]}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="industry"
              className="text-sm font-semibold text-gray-300 mb-2"
            >
              Industry(ies)
            </label>
            <Select
              isMulti
              options={alphabeticalIndustryKeywords.map((industry) => ({
                label: industry,
                value: industry,
              }))}
              onChange={handleIndustrySkillChange}
              value={selectedIndustries}
              styles={customSelectStyles}
              placeholder="Select industry(ies)"
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
            <label
              htmlFor="url"
              className="text-sm font-semibold text-gray-300"
            >
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
              className="text-sm font-semibold text-gray-300 "
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
                htmlFor="requiredDegree.0.degreeType"
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
                  htmlFor="requiredDegree.0.degreeType"
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
        <div className="flex justify-end items-center">
          <button
            type="submit"
            className="bg-zinc-600 text-white p-3 rounded-full hover:bg-zinc-700 w-48"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditJobForm;
