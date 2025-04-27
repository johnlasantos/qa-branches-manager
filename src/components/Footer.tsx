
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-6 py-4 px-6 text-sm text-gray-600 text-center border-t border-gray-200">
      <div>Copyright © {currentYear} Scriptcase</div>
      <div>All rights reserved to QA Scriptcase</div>
    </footer>
  );
};

export default Footer;
