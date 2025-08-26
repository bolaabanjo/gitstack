import React, { useState } from 'react';
import { CodeBracketIcon, BeakerIcon, BookOpenIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex flex-col h-full bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <button onClick={toggleSidebar} className="p-2">
        {isCollapsed ? '>' : '<'}
      </button>
      <nav className="flex flex-col mt-4">
        <SidebarItem label="Coding Assistant" icon={<CodeBracketIcon />} />
        <SidebarItem label="Regex Lab" icon={<BeakerIcon />} />
        <SidebarItem label="Ask My Repo" icon={<BookOpenIcon />} />
        <SidebarItem label="Settings" icon={<Cog6ToothIcon />} />
      </nav>
      <div className="mt-auto p-4">
        <SidebarItem label="Profile Avatar" icon={<UserCircleIcon />} />
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon }) => {
  return (
    <div className="flex items-center p-2 hover:bg-gray-200 rounded-md">
      <div className="w-6 h-6">{icon}</div>
      <span className="ml-2">{label}</span>
    </div>
  );
};

export default Sidebar;