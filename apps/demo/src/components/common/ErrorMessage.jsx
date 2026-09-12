import { useTexte } from '../../i18n';

const ErrorMessage = ({ error, retry }) => {
  const t = useTexte();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 font-semibold mb-2">
        {t('gemeinsam.fehlerTitel')}
      </div>
      <div className="text-red-500 text-sm mb-4">
        {error?.message || t('gemeinsam.fehlerUnbekannt')}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="btn-primary"
        >
          {t('gemeinsam.erneutVersuchen')}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
