import cn from "clsx";

function WhyHoneYourCraft() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <h2 className="text-xl tracking-widest mb-3 uppercase text-gray-400 font-semibold">
        Why People Choose
      </h2>

      <div className="mt-6 w-16 bg-primary">
        <hr className="border-2 border-primary" />
      </div>
      <div className="mt-6 text-xl text-gray-200 font-light">
        Hone Your Craft is an application tracker designed to empower users
        throughout their job search journey. Here's why users choose us:
      </div>

      <div className="flex">
        <h2
          className={cn(
            "mt-10 font-bold uppercase tracking-wide text-3xl text-gray-400"
          )}
        >
          Our Services
        </h2>
      </div>

      <div className="mt-8 flex items-center">
        <h3 className="text-xl font-bold sm:text-2xl flex-1">
          Application Tracking
        </h3>
      </div>
      <div className="mt-3 sm:mt-4 md:flex">
        <p className="text-xl text-gray-400 font-light">
          Users can organize applications with a drag and drop interface,
          streamlining their job search process.
        </p>
      </div>
      <div className="mt-8 flex items-center">
        <h3 className="text-xl font-bold sm:text-2xl flex-1">
          Interview Logging
        </h3>
      </div>
      <div className="mt-3 sm:mt-4 md:flex">
        <p className="text-xl text-gray-400 font-light">
          Log interviews and view them in a color-coded calendar for easy
          tracking by interview type.
        </p>
      </div>
      <div className="mt-8 flex items-center">
        <h3 className="text-xl font-bold sm:text-2xl flex-1">
          Keyword Extraction
        </h3>
      </div>
      <div className="mt-3 sm:mt-4 md:flex">
        <p className="text-xl text-gray-400 font-light">
          Hone Your Craft extracts keywords from job descriptions.
        </p>
      </div>
      <div className="mt-8 flex items-center">
        <h3 className="text-xl font-bold sm:text-2xl flex-1">Skill Matching</h3>
      </div>
      <div className="mt-3 sm:mt-4 md:flex">
        <p className="text-xl text-gray-400 font-light">
          Users can add skills to their profile, which are then matched against
          job requirements in the job description, displaying match percentage
          and highlighting missing skills.
        </p>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold sm:text-2xl">Metrics Dashboard</h3>
      </div>
      <p className="mt-3 sm:mt-4 text-xl text-gray-400 font-light">
        The dashboard provides insights into the frequency of required skills,
        empowering users to tailor their skill set for better job opportunities.
      </p>

      <h3 className="mt-8 text-xl font-bold sm:text-2xl">
        Enhanced User Experience
      </h3>
      <p className="mt-3 sm:mt-4 text-xl text-gray-400 font-light">
        Hone Your Craft ensures a seamless user experience, enabling users to
        navigate their job search efficiently and effectively.
      </p>

      <h3 className="mt-8 text-xl font-bold sm:text-2xl">Continuous Support</h3>
      <p className="mt-3 sm:mt-4 text-xl text-gray-400 font-light">
        Our platform is committed to supporting users throughout their journey,
        providing tools and resources for success.
      </p>
    </div>
  );
}

export default WhyHoneYourCraft;
