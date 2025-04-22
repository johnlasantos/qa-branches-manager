
import React from 'react';
import { 
  Bug, 
  Sparkles, 
  Hammer, 
  Rocket, 
  FlaskConical, 
  GitBranch, 
  XCircle,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchIconProps {
  branchName: string;
  hasRemote: boolean;
  className?: string;
}

const BranchIcon: React.FC<BranchIconProps> = ({ branchName, hasRemote, className }) => {
  // Determine the icon based on branch name
  const renderIcon = () => {
    const lowercaseBranch = branchName.toLowerCase();
    
    if (lowercaseBranch.startsWith('bugfix/')) {
      return <Bug size={18} className="text-red-500" />;
    } else if (lowercaseBranch.startsWith('feature/')) {
      return <Sparkles size={18} className="text-purple-500" />;
    } else if (lowercaseBranch === 'develop' || lowercaseBranch.includes('dev')) {
      return <Hammer size={18} className="text-blue-500" />;
    } else if (lowercaseBranch === 'main' || lowercaseBranch === 'master') {
      return <Rocket size={18} className="text-green-600" />;
    } else if (lowercaseBranch === 'staging' || lowercaseBranch.includes('homolog')) {
      return <FlaskConical size={18} className="text-amber-500" />;
    } else {
      return <GitBranch size={18} className="text-gray-500" />;
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      {renderIcon()}
      
      {/* Remote indicator */}
      {hasRemote && (
        <div className="absolute -bottom-1 -right-2">
          <Globe size={10} className="text-blue-500" />
        </div>
      )}
      
      {/* Non-remote indicator */}
      {!hasRemote && (
        <div className="absolute -bottom-1 -right-2">
          <XCircle size={12} className="text-red-500 fill-white" />
        </div>
      )}
    </div>
  );
};

export default BranchIcon;
