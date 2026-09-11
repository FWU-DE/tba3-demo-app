const LoadingSkeleton = ({ height = '400px', className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Laden...</div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
