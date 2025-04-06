import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardIcon, ClipboardCheckIcon, Code2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language: string;
  isDarkMode: boolean;
}

export default function CodeBlock({ code, language, isDarkMode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Get a display name for the language (for UI)
  const displayLanguage = () => {
    if (!language) return 'plain text';
    // Map of language IDs to display names
    const languageNames: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'csharp': 'C#',
      'c': 'C',
      'cpp': 'C++',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sql': 'SQL',
      'json': 'JSON',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'bash': 'Bash',
      'shell': 'Shell',
      'powershell': 'PowerShell',
      'jsx': 'JSX',
      'tsx': 'TSX',
    };
    
    return languageNames[language] || language;
  };
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Code snippet has been copied",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy code: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="relative group mt-4 mb-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-full">
      {/* Header with language label and copy button */}
      <div className={`flex items-center justify-between px-3 py-1.5 ${isDarkMode ? 'bg-gray-800 text-gray-300 border-b border-gray-700' : 'bg-gray-100 text-gray-700 border-b border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Code2Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{displayLanguage()}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-7 w-7 rounded-md ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100' 
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          onClick={copyToClipboard}
          title="Copy code"
        >
          {copied ? 
            <ClipboardCheckIcon className="h-3.5 w-3.5 text-green-500" /> : 
            <ClipboardIcon className="h-3.5 w-3.5" />
          }
        </Button>
      </div>
      
      {/* Code content with syntax highlighting */}
      <div className="max-h-[500px] overflow-auto">
        <SyntaxHighlighter 
          language={language || 'text'} 
          style={isDarkMode ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            backgroundColor: isDarkMode ? '#1e1e2e' : '#f8f9fa',
            overflowX: 'auto',
            maxWidth: '100%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            WebkitOverflowScrolling: 'touch', // Better scrolling on iOS
          }}
          codeTagProps={{
            style: {
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            }
          }}
          showLineNumbers={code.split('\n').length > 3}
          wrapLongLines={true} // Enable line wrapping for mobile
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}