import React from 'react';
import AppShell from '../components/layout/AppShell';

const Home: React.FC = () => {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to the AI-Powered Developer Workspace</h1>
        <p className="text-lg text-center mb-8">
          A seamless environment for coding, regex experimentation, and repository queries, all powered by AI.
        </p>
        <a href="/auth/login" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition">
          Get Started
        </a>
      </div>
    </AppShell>
  );
};

export default Home;