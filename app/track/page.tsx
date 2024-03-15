"use client";

import { useBoardStore } from "@/store/BoardStore";
import JobTitleSearchForm from "../components/track/JobTitleSearchForm";
import Board from "../components/track/Board";

function Track() {
  const [titleSearchString, setTitleSearchString] = useBoardStore((state) => [
    state.titleSearchString,
    state.setTitleSearchString,
  ]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full mt-5">
        <JobTitleSearchForm
          titleSearchString={titleSearchString}
          setTitleSearchString={setTitleSearchString}
        />
      </div>
      <div className="mt-8">
        <Board />
      </div>
    </div>
  );
}

export default Track;
