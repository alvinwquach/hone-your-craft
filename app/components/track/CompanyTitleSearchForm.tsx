import { MdBusiness } from "react-icons/md";

interface CompanyTitleSearchFormProps {
  companySearchString: string;
  setCompanySearchString: (searchString: string) => void;
}

function CompanyTitleSearchForm({
  companySearchString,
  setCompanySearchString,
}: CompanyTitleSearchFormProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanySearchString(event.target.value);
  };

  return (
    <form className="mx-auto relative lg:w-full w-2/3 mt-5">
      <label
        htmlFor="company-title-search"
        className="mb-2 text-sm font-medium text-gray-400 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MdBusiness className="w-5 h-5 text-gray-300" />
        </div>
        <input
          type="search"
          id="company-title-search"
          className="block w-full p-4 pl-10 text-xs lg:text-sm text-gray-200 border rounded-lg bg-zinc-700 border-zinc-600 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="Search a company name"
          value={companySearchString}
          onChange={handleInputChange}
          required
        />
      </div>
    </form>
  );
}

export default CompanyTitleSearchForm;
