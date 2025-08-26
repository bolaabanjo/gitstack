import React, { useState } from 'react';
import { PillInput } from '../../ui/PillInput';
import { Button } from '../../ui/Button';
import { useAIRegex } from '../../../hooks/useAIRegex';

const RegexTester: React.FC = () => {
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const { fetchAISuggestions } = useAIRegex();

  const handleTest = () => {
    try {
      const regexPattern = new RegExp(regex);
      const matchResults = testString.match(regexPattern);
      setMatches(matchResults || []);
    } catch (error) {
      console.error('Invalid regex pattern', error);
      setMatches([]);
    }
  };

  const handleFetchSuggestions = async () => {
    const suggestions = await fetchAISuggestions(regex);
    setAISuggestions(suggestions);
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-lg font-semibold">Regex Tester</h2>
      <PillInput
        value={regex}
        onChange={(e) => setRegex(e.target.value)}
        placeholder="Enter regex pattern"
      />
      <PillInput
        value={testString}
        onChange={(e) => setTestString(e.target.value)}
        placeholder="Enter test string"
      />
      <div className="flex space-x-2 mt-2">
        <Button onClick={handleTest}>Test Regex</Button>
        <Button onClick={handleFetchSuggestions}>Get AI Suggestions</Button>
      </div>
      <div className="mt-4">
        <h3 className="text-md font-medium">Matches:</h3>
        <ul>
          {matches.map((match, index) => (
            <li key={index}>{match}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="text-md font-medium">AI Suggestions:</h3>
        <ul>
          {aiSuggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegexTester;