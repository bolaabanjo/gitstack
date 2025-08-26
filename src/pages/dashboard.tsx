import React from 'react';
import AppShell from '../components/layout/AppShell';
import CodingAssistant from '../components/features/CodingAssistant/SplitEditor';
import RegexLab from '../components/features/RegexLab/RegexTester';
import AskMyRepo from '../components/features/AskMyRepo/RepoQAWorkspace';

const Dashboard: React.FC = () => {
  return (
    <AppShell>
      <div className="flex flex-col space-y-4 p-4">
        <h1 className="text-2xl font-bold">Developer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">Coding Assistant</h2>
            <CodingAssistant />
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">Regex Lab</h2>
            <RegexLab />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold">Ask My Repo</h2>
          <AskMyRepo />
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;