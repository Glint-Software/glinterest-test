import PinCard from '../PinCard/PinCard.jsx';
import './PinGrid.css';

export default function PinGrid({ pins, onUpdate }) {
  if (!pins || pins.length === 0) {
    return (
      <div className="empty-state">
        <h3>No pins yet</h3>
        <p>Pins you create or save will appear here.</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {pins.map(pin => (
        <PinCard key={pin.id} pin={pin} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
