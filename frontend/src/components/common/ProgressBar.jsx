import './ProgressBar.css';

const ProgressBar = ({ value = 0, label, color = 'var(--accent)', showPercent = true }) => (
  <div className="progress-container">
    {(label || showPercent) && (
      <div className="progress-info">
        {label && <span className="progress-label">{label}</span>}
        {showPercent && <span className="progress-percent">{Math.round(value)}%</span>}
      </div>
    )}
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  </div>
);

export default ProgressBar;
