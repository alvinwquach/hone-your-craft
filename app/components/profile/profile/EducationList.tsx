import { getEducation } from "@/app/actions/getEducation";
import EducationClient from "./EducationClient";

export default async function EducationList() {
  const result = await getEducation();

  if (!result.success || !result.data) {
    return <div>Error loading education data: {result.error || "No data"}</div>;
  }

  const educationData = result.data;

  return (
    <div>
      <EducationClient educationData={educationData} />
    </div>
  );
}
