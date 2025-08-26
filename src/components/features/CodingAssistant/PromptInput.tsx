import React, { useState } from 'react';

const PromptInput: React.FC<{ onSubmit: (prompt: string) => void }> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter your prompt..."
        className="flex-1 p-2 border rounded-pill shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="p-2 text-white bg-blue-500 rounded-pill hover:bg-blue-600">
        Submit
      </button>
    </form>
  );
};

export default PromptInput;