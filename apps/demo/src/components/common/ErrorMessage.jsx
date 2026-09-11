const ErrorMessage = ({ error, retry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 font-semibold mb-2">
        Fehler beim Laden der Daten
      </div>
      <div className="text-red-500 text-sm mb-4">
        {error?.message || 'Ein unbekannter Fehler ist aufgetreten'}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="btn-primary"
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
