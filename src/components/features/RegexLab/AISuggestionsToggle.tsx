import React from 'react';

interface AISuggestionsToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const AISuggestionsToggle: React.FC<AISuggestionsToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center">
      <label className="mr-2 text-sm">AI Suggestions</label>
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={() => onToggle(!isEnabled)}
        className="toggle-checkbox"
      />
      <span className={`toggle-label ${isEnabled ? 'active' : ''}`}></span>
    </div>
  );
};

export default AISuggestionsToggle;