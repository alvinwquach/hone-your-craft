import { BsBriefcase } from "react-icons/bs";
import { FiCalendar } from "react-icons/fi";
import { SiBaremetrics } from "react-icons/si";
import { GiStoneCrafting } from "react-icons/gi";
import { GiSkills } from "react-icons/gi";
import { MdAddCircleOutline } from "react-icons/md";

function Tool() {
  return (
    <>
      <h2 className="text-2xl sm:text-3xl uppercase font-title text-slate-200 text-center mb-12">
        <strong>Choose Your Tool</strong>
      </h2>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
          <div className="flex flex-col items-center">
            <BsBriefcase className="w-12 h-12 text-white" />
            <p className="text-center mt-2 text-gray-400">Track</p>
          </div>
          <div className="flex flex-col items-center">
            <FiCalendar className="w-12 h-12 text-white" />
            <p className="text-center mt-2 text-gray-400">Calendar</p>
          </div>
          <div className="flex flex-col items-center">
            <SiBaremetrics className="w-12 h-12 text-white" />
            <p className="text-center mt-2 text-gray-400">Metrics</p>
          </div>
          <div className="flex flex-col items-center">
            <GiStoneCrafting className="w-12 h-12 text-white" />
            <p className="text-center mt-2 text-gray-400">Skills</p>
          </div>
          <div className="flex flex-col items-center">
            <GiSkills className="w-12 h-12 text-white" />
            <p className="text-center mt-2 text-gray-400">Match</p>
          </div>
          <div className="flex flex-col items-center">
            <MdAddCircleOutline className="w-12 h-12 stroke-gray-400 text-white" />
            <p className="text-center mt-2 text-gray-400">& More!</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Tool;
