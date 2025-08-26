import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MagnifyingGlassIcon as SearchIcon, BellIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold">AI Developer Workspace</div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pill-input"
            />
            <SearchIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <BellIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-200" onClick={logout}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">?</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;