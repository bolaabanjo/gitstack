import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="relative inline-block">
      {children}
      <div className="absolute z-10 hidden w-32 p-2 text-sm text-white bg-black rounded-lg tooltip-content group-hover:block">
        {content}
      </div>
    </div>
  );
};

export default Tooltip;