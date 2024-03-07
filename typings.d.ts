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
  workLocation: string | null;
  postUrl: string;
  salary: string | null;
  status: string;
  interviews?: Interview[];
  offer?: Offer[];
  rejection?: Rejection[];
  jobSkills?: JobSkill[];
  createdAt: Date;
  updatedAt: Date;
}
