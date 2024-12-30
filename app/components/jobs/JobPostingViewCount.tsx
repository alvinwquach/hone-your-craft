import { useState, useEffect, useRef } from "react";

async function incrementViews(id: string): Promise<number> {
  try {
    const response = await fetch(`/api/job-postings/${id}/update/views`, {
      method: "PUT",
    });
    if (!response.ok) {
      throw new Error("Failed to increment views");
    }
    const data = await response.json();
    return data.views;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

type ViewCountProps = {
  initialViews: number;
  jobId: string;
};

export default function JobPostingViewCount({
  initialViews,
  jobId,
}: ViewCountProps) {
  const [views, setViews] = useState(initialViews);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;

    hasMounted.current = true;
    const updateViews = async () => {
      const updatedViews = await incrementViews(jobId);
      setViews(updatedViews);
    };

    updateViews();
  }, []);

  return <p>Total Views: {views}</p>;
}
