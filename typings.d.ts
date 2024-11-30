interface Board {
  columns: Map<TypedColumn, Column>;
}

// type TypedColumn = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

interface Column {
  id: TypedColumn;
  jobs: Job[];
}

interface Job {
  id: string;
  userId: string;
  company: string;
  description: string;
  title: string;
  industry: string | null;
  location: string | null;
  workLocation: WorkLocation | null;
  postUrl: string;
  salary: string | null;
  status: ApplicationStatus;
  interviews?: Interview[];
  offer?: Offer[];
  rejection?: Rejection[];
  jobSkills?: JobSkill[];
  createdAt: Date;
  updatedAt: Date;
}

interface JobSkill {
  id: string;
  jobId: string;
  skill: string;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Salary {
  id: string;
  jobPostingId: string;
  amount: number;
  rangeMin: number | null;
  rangeMax: number | null;
  salaryType: string;
  frequency: string | null;
  negotiable: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface RequiredSkill {
  id: string;
  jobPostingId: string;
  skillId: string;
  isRequired: boolean;
  yearsOfExperience: number;
  skill: {
    id: string;
    name: string;
  };
}

interface BonusSkill {
  id: string;
  jobPostingId: string;
  skillId: string;
  isRequired: boolean;
  yearsOfExperience: number;
  skill: {
    id: string;
    name: string;
  };
}

enum JobPostingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  FILLED = "FILLED",
  COMPLETED = "COMPLETED",
}

interface JobPosting {
  id: string;
  userId: string;
  company: string;
  companySize: string;
  industry: string[];
  title: string;
  jobType: string;
  url: string;
  deadline: string;
  experienceLevels: string[];
  yearsOfExperience: string;
  description: string;
  responsibilities: string[];
  location: string;
  workLocation: string;
  paymentType: string;
  status: JobPostingStatus;
  interviewProcess: string[];
  views: number;
  applicationsReceived: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  salary: Salary;
  requiredSkills: RequiredSkill[];
  bonusSkills: BonusSkill[];
  requiredDegree: RequiredDegree[];
  applications: Application[];
}

interface RequiredDegree {
  id: string;
  degreeType: string;
  jobPostingId: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

