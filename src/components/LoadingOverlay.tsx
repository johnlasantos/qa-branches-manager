
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
};

export default LoadingOverlay;
