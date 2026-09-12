import { useTexte } from '../../i18n';

const LoadingSkeleton = ({ height = '400px', className = '' }) => {
  const t = useTexte();

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">{t('gemeinsam.laden')}</div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
