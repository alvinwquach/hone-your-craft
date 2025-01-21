import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EventTypeCards = () => {
  const { data, error } = useSWR("/api/event-types", fetcher);

  if (!data) return <div>Loading...</div>;
  if (error) return <div>Error fetching event types</div>;

  const formattedDurations = data.durations.map((duration: any) => (
    <div key={duration} className="mb-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <h3 className="font-semibold text-xl mb-2 text-gray-800">
            New Meeting
          </h3>
          <p className="text-sm text-gray-600 mb-2">{duration}</p>
          <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Book Now
          </button>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {formattedDurations}
    </div>
  );
};

export default EventTypeCards;
