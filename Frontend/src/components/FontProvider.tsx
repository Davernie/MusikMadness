import React from 'react';

interface FontProviderProps {
  children: React.ReactNode;
}

const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  // Font is now handled via Tailwind and index.css, no dynamic injection needed
  return (
    <div className="font-sans">
      {children}
    </div>
  );
};

export default FontProvider;