import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { fetchRepoQA } from '../../../services/api';
import RepoSelector from './RepoSelector';

const RepoQAWorkspace = () => {
  const { user } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRepo) {
      // Reset response when repo changes
      setResponse('');
    }
  }, [selectedRepo]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query || !selectedRepo) return;

    setLoading(true);
    try {
      const result = await fetchRepoQA(selectedRepo, query);
      setResponse(result);
    } catch (error) {
      console.error('Error fetching repo Q&A:', error);
      setResponse('Error fetching response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Ask My Repo</h2>
      <RepoSelector selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
      <form onSubmit={handleQuerySubmit} className="mt-4">
        <textarea
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Ask a question about the repository..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="font-semibold">Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default RepoQAWorkspace;