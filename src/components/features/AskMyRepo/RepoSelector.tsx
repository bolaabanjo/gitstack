import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { fetchGitHubRepos } from '../../../lib/githubClient';

const RepoSelector = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');

  useEffect(() => {
    const loadRepos = async () => {
      if (user) {
        const fetchedRepos = await fetchGitHubRepos(user.accessToken);
        setRepos(fetchedRepos);
      }
    };
    loadRepos();
  }, [user]);

  const handleRepoChange = (event) => {
    setSelectedRepo(event.target.value);
  };

  return (
    <div className="p-4">
      <label htmlFor="repo-selector" className="block text-sm font-medium text-gray-700">
        Select a Repository
      </label>
      <select
        id="repo-selector"
        value={selectedRepo}
        onChange={handleRepoChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="" disabled>Select a repository</option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.full_name}>
            {repo.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RepoSelector;