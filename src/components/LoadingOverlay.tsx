
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
        <Loader className="w-5 h-5 text-primary animate-spin" />
        <span className="text-sm font-medium">Processing...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
