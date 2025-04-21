import { MdPersonOutline } from "react-icons/md";

interface JobTitleSearchFormProps {
  titleSearchString: string;
  setTitleSearchString: (searchString: string) => void;
}

function JobTitleSearchForm({
  titleSearchString,
  setTitleSearchString,
}: JobTitleSearchFormProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearchString(event.target.value);
  };

  return (
    <form className="mx-auto relative lg:w-full w-2/3 mt-5">
      <label
        htmlFor="job-title-search"
        className="mb-2 text-sm font-medium text-gray-400 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MdPersonOutline className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="search"
          id="job-title-search"
          className="block w-full p-4 pl-10 text-slate-700 border rounded-lg bg-zinc-800 border-slate-200 text-white focus:ring-blue-500 focus:border-blue-500 border-zinc-700 placeholder-gray-400"
          placeholder="Search a job title"
          value={titleSearchString}
          onChange={handleInputChange}
          required
        />
      </div>
    </form>
  );
}

export default JobTitleSearchForm;
