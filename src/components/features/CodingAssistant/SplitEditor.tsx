import React from 'react';
import { useEditorState } from '../../../hooks/useEditorState';
import { Button } from '../../ui/Button';

const SplitEditor: React.FC = () => {
  const { code, setCode, suggestions } = useEditorState();

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCode((prevCode) => `${prevCode}\n${suggestion}`);
  };

  return (
    <div className="flex flex-col h-full">
      <textarea
        className="flex-grow p-4 border rounded-lg"
        value={code}
        onChange={handleCodeChange}
        placeholder="Write your code here..."
      />
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Suggestions</h3>
        <div className="flex flex-wrap">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="m-1"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplitEditor;