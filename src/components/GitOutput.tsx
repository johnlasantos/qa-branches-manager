
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface GitOutputProps {
  output: string;
  className?: string;
}

const GitOutput: React.FC<GitOutputProps> = ({ output, className }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(output)
      .then(() => {
        toast.success('Output copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy output');
      });
  };

  // Process the output to apply color highlighting
  const processOutput = (text: string) => {
    if (!text) return 'No output to display';

    return text.split('\n').map((line, index) => {
      // Check if line indicates addition (starts with + or contains added)
      if (line.startsWith('+') || line.includes('+++++')) {
        return (
          <span key={index} className="text-[#F2FCE2] block">
            {line}
          </span>
        );
      }
      // Check if line indicates removal (starts with - or contains removed)
      else if (line.startsWith('-') || line.includes('-----')) {
        return (
          <span key={index} className="text-[#ea384c] block">
            {line}
          </span>
        );
      }
      // Return normal line
      return (
        <span key={index} className="block">
          {line}
        </span>
      );
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Command Output</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1" 
          onClick={handleCopy} 
          disabled={!output}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>
      <ScrollArea className="h-[250px] rounded-md border">
        <pre className="git-output text-sm p-4 whitespace-pre-wrap">
          {processOutput(output)}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default GitOutput;
