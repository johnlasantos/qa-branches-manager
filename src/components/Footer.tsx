
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 px-6 text-sm text-gray-600 text-center">
      <div>Copyright © {currentYear} Scriptcase</div>
      <div>All rights reserved to QA Scriptcase</div>
    </footer>
  );
};

export default Footer;
