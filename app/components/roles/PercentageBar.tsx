type PercentageBarProps = {
  percentage: number;
};

function PercentageBar({ percentage }: PercentageBarProps) {
  return (
    <div className="w-full h-4 bg-gray-600 rounded-full mt-2">
      <div
        className="h-full rounded-full bg-gradient-to-r from-gradient-start via-gradient-middle to-gradient-end"
        style={{
          width: `${percentage}%`,
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
    </div>
  );
}

export default PercentageBar;
