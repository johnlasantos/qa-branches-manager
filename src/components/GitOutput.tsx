
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
    if (!text) return <span className="text-gray-500 italic">No recent command output</span>;

    return text.split('\n').map((line, index) => {
      // For lines indicating file changes with +/- summary at end
      if (line.includes('|') && /\s[+-]+$/.test(line)) {
        return processFileChangeLine(line, index);
      }
      // For summary lines like "X insertions(+), Y deletions(-)"
      else if (line.includes('insertions(+)') || line.includes('deletions(-)') || line.includes('files changed')) {
        return processSummaryLine(line, index);
      }
      // For file mode changes
      else if (line.includes('new file mode')) {
        return (
          <span key={index} className="block">
            <span className="text-[#F2FCE2]">{line}</span>
          </span>
        );
      }
      else if (line.includes('delete mode')) {
        return (
          <span key={index} className="block">
            <span className="text-[#ea384c]">{line}</span>
          </span>
        );
      }
      // For binary file changes
      else if (line.includes('binary file') && line.includes('changed')) {
        return (
          <span key={index} className="block">
            {line.split('changed').map((part, i) => (
              <React.Fragment key={`bin-${i}`}>
                {part}
                {i === 0 && <span className="text-[#FEF7CD]">changed</span>}
              </React.Fragment>
            ))}
          </span>
        );
      }
      // Standard +/- lines (beginning with + or -)
      else if (line.startsWith('+') || line.includes('+++++')) {
        return (
          <span key={index} className="text-[#F2FCE2] block">
            {line}
          </span>
        );
      }
      else if (line.startsWith('-') || line.includes('-----')) {
        return (
          <span key={index} className="text-[#ea384c] block">
            {line}
          </span>
        );
      }
      // Highlight "Already up to date" message
      else if (line.includes('Already up to date')) {
        return (
          <span key={index} className="text-[#FEF7CD] block font-medium">
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

  // Handle lines like "file.php | 23522 +++++++++----------"
  const processFileChangeLine = (line: string, index: number) => {
    const parts = line.split('|');
    if (parts.length < 2) return <span key={index} className="block">{line}</span>;

    const filePath = parts[0];
    let changes = parts[1];
    
    // Find position where +/- symbols start
    const symbolsStartPos = changes.search(/[+-]/);
    if (symbolsStartPos === -1) return <span key={index} className="block">{line}</span>;
    
    const beforeSymbols = changes.substring(0, symbolsStartPos);
    const symbols = changes.substring(symbolsStartPos);
    
    return (
      <span key={index} className="block">
        {filePath}|{beforeSymbols}
        {highlightPlusMinusSymbols(symbols)}
      </span>
    );
  };

  // Handle summary lines like "8 files changed, 12870 insertions(+), 12711 deletions(-)"
  const processSummaryLine = (line: string, index: number) => {
    let parts = [];
    let currentPos = 0;
    
    // Check for "files changed"
    const changedMatch = line.match(/(\d+)\s+files?\s+changed/);
    if (changedMatch) {
      const changedIndex = line.indexOf(changedMatch[0]);
      parts.push(
        <span key={`${index}-changed-before`}>{line.substring(currentPos, changedIndex)}</span>,
        <span key={`${index}-changed`} className="text-[#FEF7CD]">{changedMatch[0]}</span>
      );
      currentPos = changedIndex + changedMatch[0].length;
    }
    
    // Check for insertions
    const insertionMatch = line.match(/(\d+)\s+insertions?\(\+\)/);
    if (insertionMatch) {
      const insertionIndex = line.indexOf(insertionMatch[0], currentPos);
      parts.push(
        <span key={`${index}-insert-before`}>{line.substring(currentPos, insertionIndex)}</span>,
        <span key={`${index}-insert`} className="text-[#F2FCE2]">{insertionMatch[0]}</span>
      );
      currentPos = insertionIndex + insertionMatch[0].length;
    }
    
    // Check for deletions
    const deletionMatch = line.match(/(\d+)\s+deletions?\(-\)/);
    if (deletionMatch) {
      const deletionIndex = line.indexOf(deletionMatch[0], currentPos);
      parts.push(
        <span key={`${index}-delete-before`}>{line.substring(currentPos, deletionIndex)}</span>,
        <span key={`${index}-delete`} className="text-[#ea384c]">{deletionMatch[0]}</span>
      );
      currentPos = deletionIndex + deletionMatch[0].length;
    }
    
    // Add any remaining text
    if (currentPos < line.length) {
      parts.push(<span key={`${index}-remaining`}>{line.substring(currentPos)}</span>);
    }
    
    // If no matches were found, return the original line
    if (parts.length === 0) {
      return <span key={index} className="block">{line}</span>;
    }
    
    return <span className="block">{parts}</span>;
  };

  // Helper function to highlight +/- symbols
  const highlightPlusMinusSymbols = (text: string) => {
    let result = [];
    let currentType = null; // 'plus', 'minus', or null
    let currentText = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '+') {
        if (currentType !== 'plus') {
          if (currentText) {
            result.push(
              <span key={`sym-${i}`} className={currentType === 'minus' ? "text-[#ea384c]" : ""}>
                {currentText}
              </span>
            );
          }
          currentType = 'plus';
          currentText = char;
        } else {
          currentText += char;
        }
      } else if (char === '-') {
        if (currentType !== 'minus') {
          if (currentText) {
            result.push(
              <span key={`sym-${i}`} className={currentType === 'plus' ? "text-[#F2FCE2]" : ""}>
                {currentText}
              </span>
            );
          }
          currentType = 'minus';
          currentText = char;
        } else {
          currentText += char;
        }
      } else {
        if (currentText) {
          result.push(
            <span 
              key={`sym-${i}`} 
              className={currentType === 'plus' ? "text-[#F2FCE2]" : currentType === 'minus' ? "text-[#ea384c]" : ""}
            >
              {currentText}
            </span>
          );
        }
        currentType = null;
        currentText = char;
      }
    }
    
    // Don't forget the last segment
    if (currentText) {
      result.push(
        <span 
          key="sym-last" 
          className={currentType === 'plus' ? "text-[#F2FCE2]" : currentType === 'minus' ? "text-[#ea384c]" : ""}
        >
          {currentText}
        </span>
      );
    }
    
    return result;
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Command Output</h2>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleCopy} 
          disabled={!output}
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 rounded-md border">
        <pre className="git-output text-sm p-4 whitespace-pre-wrap h-full">
          {processOutput(output)}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default GitOutput;
