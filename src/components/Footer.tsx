
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 text-sm text-gray-600 text-center">
      <div>Copyright © {currentYear} Scriptcase</div>
      <div>All rights reserved to QA Scriptcase</div>
    </footer>
  );
};

export default Footer;
