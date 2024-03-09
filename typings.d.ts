interface Board {
  columns: Map<TypedColumn, Column>;
}

type TypedColumn = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

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
  status: ApplicationStatus | null;
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

