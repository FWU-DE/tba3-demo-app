const Card = ({ children, title, className = '', testid }) => {
  return (
    <div className={`card ${className}`} data-testid={testid}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
