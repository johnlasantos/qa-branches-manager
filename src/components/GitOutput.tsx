
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
      // For lines indicating file changes with +/- summary at end
      if (line.includes('|') && /\s[+-]+$/.test(line)) {
        return processFileChangeLine(line, index);
      }
      // For summary lines like "X insertions(+), Y deletions(-)"
      else if (line.includes('insertions(+)') || line.includes('deletions(-)')) {
        return processSummaryLine(line, index);
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
    // Replace insertions(+) with highlighted version
    let processedLine = line;
    let parts = [];
    
    // Split the line into segments to process separately
    const insertionMatch = line.match(/(\d+)\s+insertions?\(\+\)/);
    const deletionMatch = line.match(/(\d+)\s+deletions?\(-\)/);
    
    let lastIndex = 0;
    
    // Process the line in order
    if (insertionMatch && deletionMatch) {
      const insertionIndex = line.indexOf(insertionMatch[0]);
      const deletionIndex = line.indexOf(deletionMatch[0]);
      
      if (insertionIndex < deletionIndex) {
        // Insertion comes first
        parts.push(
          <span key={`${index}-1`}>{line.substring(0, insertionIndex)}</span>,
          <span key={`${index}-2`} className="text-[#F2FCE2]">{insertionMatch[0]}</span>,
          <span key={`${index}-3`}>{line.substring(insertionIndex + insertionMatch[0].length, deletionIndex)}</span>,
          <span key={`${index}-4`} className="text-[#ea384c]">{deletionMatch[0]}</span>,
          <span key={`${index}-5`}>{line.substring(deletionIndex + deletionMatch[0].length)}</span>
        );
      } else {
        // Deletion comes first
        parts.push(
          <span key={`${index}-1`}>{line.substring(0, deletionIndex)}</span>,
          <span key={`${index}-2`} className="text-[#ea384c]">{deletionMatch[0]}</span>,
          <span key={`${index}-3`}>{line.substring(deletionIndex + deletionMatch[0].length, insertionIndex)}</span>,
          <span key={`${index}-4`} className="text-[#F2FCE2]">{insertionMatch[0]}</span>,
          <span key={`${index}-5`}>{line.substring(insertionIndex + insertionMatch[0].length)}</span>
        );
      }
    } else if (insertionMatch) {
      const insertionIndex = line.indexOf(insertionMatch[0]);
      parts.push(
        <span key={`${index}-1`}>{line.substring(0, insertionIndex)}</span>,
        <span key={`${index}-2`} className="text-[#F2FCE2]">{insertionMatch[0]}</span>,
        <span key={`${index}-3`}>{line.substring(insertionIndex + insertionMatch[0].length)}</span>
      );
    } else if (deletionMatch) {
      const deletionIndex = line.indexOf(deletionMatch[0]);
      parts.push(
        <span key={`${index}-1`}>{line.substring(0, deletionIndex)}</span>,
        <span key={`${index}-2`} className="text-[#ea384c]">{deletionMatch[0]}</span>,
        <span key={`${index}-3`}>{line.substring(deletionIndex + deletionMatch[0].length)}</span>
      );
    } else {
      parts.push(<span key={index}>{line}</span>);
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
