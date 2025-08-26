import React from 'react';

interface ToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ isChecked, onChange, label }) => {
  return (
    <div className="flex items-center">
      {label && <span className="mr-2">{label}</span>}
      <button
        onClick={() => onChange(!isChecked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${
          isChecked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`transform transition-transform duration-200 ease-in-out block w-5 h-5 rounded-full bg-white ${
            isChecked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;