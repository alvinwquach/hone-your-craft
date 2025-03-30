import { getRejections } from "@/app/actions/getRejections";

export default async function Rejections() {
  const groupedRejections = await getRejections();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Rejections</h1>
        <div className="w-full max-w-3xl mx-auto mt-6">
          {Object.entries(groupedRejections).length > 0 ? (
            Object.entries(groupedRejections).map(([date, rejections]) => (
              <div key={date} className="w-full">
                <h2 className="text-lg font-semibold text-gray-100 my-4">
                  {date === "No Date"
                    ? "No Date Specified"
                    : new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </h2>
                {rejections.map((rejection) => (
                  <div
                    key={rejection.id}
                    className="p-4 mb-4 rounded-lg border border-gray-600 bg-zinc-800 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-sm text-gray-300">
                          {rejection.date
                            ? new Date(rejection.date).toLocaleString()
                            : "Date TBD"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-200">
                          {rejection.job?.title || "Unknown Job"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {rejection.job?.company || "Unknown Company"}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">
                          Initiated by: {rejection.initiatedBy.toLowerCase()}
                        </p>
                        {rejection.notes && (
                          <p className="text-sm text-gray-400 mt-1">
                            Notes: {rejection.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center p-8">
              No rejections found
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
