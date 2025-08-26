import { useState } from 'react';

const useEditorState = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateCode = (newCode) => {
    setCode(newCode);
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const saveCode = async () => {
    setIsSaving(true);
    try {
      // Logic to save code (e.g., API call)
      // await api.saveCode(code, language);
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    code,
    language,
    isSaving,
    error,
    updateCode,
    updateLanguage,
    saveCode,
  };
};

export default useEditorState;