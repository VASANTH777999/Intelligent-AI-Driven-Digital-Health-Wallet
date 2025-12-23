import './FlashCard.css';

const FlashCard = ({ title, icon, color, front, back }) => {
  return (
    <div className="flash-card-container">
      <div className={`flash-card color-${color}`}>
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <div className="card-content">
          <div className="content-section">
            <h4>Summary</h4>
            {front}
          </div>
          <div className="content-divider"></div>
          <div className="content-section">
            <h4>Details</h4>
            {back}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
