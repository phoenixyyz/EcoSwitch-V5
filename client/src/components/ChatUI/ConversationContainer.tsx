import { useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useChat } from "@/context/ChatContext";
import CodeBlock from "./CodeBlock";
import { MessageType } from "@/lib/types";

interface ConversationContainerProps {
  hasMessages: boolean;
  isLoading: boolean;
}

export default function ConversationContainer({ 
  hasMessages,
  isLoading
}: ConversationContainerProps) {
  const { messages, apiKey, settings } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-1 p-4 relative dark:bg-gray-800 overflow-y-auto"
    >
      {!hasMessages ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium bg-gradient-to-r from-indigo-600 to-cyan-500 text-transparent bg-clip-text mb-4">EcoSwitch AI</h2>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm mb-4 max-w-xl mx-auto border border-gray-200 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              EcoSwitch AI intelligently routes tasks between OpenAI and DeepSeek APIs to optimize costs. Simple queries use DeepSeek's cost-effective solutions, while complex tasks leverage OpenAI's advanced capabilities.
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {apiKey 
              ? "Enter your prompt below to start chatting with the AI."
              : "Enter your API key in the sidebar to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message, index) => (
            <MessageItem
              key={index}
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-start group mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 dark:from-blue-600 dark:to-blue-400 flex items-center justify-center text-white mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              
              <div className="flex flex-col max-w-[85%] md:max-w-xl">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse delay-200"></div>
                    </div>
                    <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">EcoSwitch AI is thinking...</span>
                  </div>
                </div>
                
                <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1 ml-1 text-gray-500 dark:text-gray-400">
                  Just now
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );
}

interface MessageItemProps {
  message: MessageType;
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";
  const { settings } = useChat();
  
  // Helper function to get the model name from the message or settings
  const getModelName = (message: MessageType) => {
    if (isUser) return null;
    
    // Extract model name from full model path if available
    let modelName = message.model || settings.model || "Assistant";
    
    try {
      // Format model name to be more readable
      if (modelName.includes('/')) {
        // For OpenRouter models like "meta-llama/llama-3-8b-instruct"
        const parts = modelName.split('/');
        if (parts.length > 1) {
          // Get just the model name part without vendor prefix
          const modelPart = parts[1];
          
          // Format model names to be more human-readable
          if (modelPart.includes("llama-3")) {
            return "Llama 3";
          } else if (modelPart.includes("gpt-3.5")) {
            return "GPT-3.5";
          } else if (modelPart.includes("deepseek")) {
            return "DeepSeek";
          } else {
            // Use capitalized last part of the model name
            return modelPart.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          }
        }
      } else if (typeof modelName === 'string') {
        if (modelName.startsWith("gpt-4")) {
          return "GPT-4";
        } else if (modelName.startsWith("gpt-3.5")) {
          return "GPT-3.5";
        } else if (modelName.includes("deepseek")) {
          return "DeepSeek";
        }
        
        // For other models, clean up the format
        return modelName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      // Default fallback
      return "Assistant";
    } catch (error) {
      console.error("Error formatting model name:", error, "Model:", modelName);
      return "Assistant";
    }
  };

  // Helper function to get API provider badge
  const getApiProviderBadge = () => {
    if (isUser) return null;
    
    let badgeText = "";
    let badgeColor = "";
    let activityUrl = "";
    
    // Use the message's provider if available, otherwise fall back to the current settings
    const provider = message.provider || settings.apiProvider;
    
    switch (provider) {
      case "openai":
        badgeText = "OpenAI";
        badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
        activityUrl = "https://platform.openai.com/usage";
        break;
      case "deepseek":
        badgeText = "DeepSeek";
        badgeColor = "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
        activityUrl = "https://console.deepseek.com/usage";
        break;
      case "openrouter":
        badgeText = "OpenRouter";
        badgeColor = "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
        activityUrl = "https://openrouter.ai/activity";
        break;
      default:
        return null;
    }
    
    return (
      <a 
        href={activityUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`text-xs px-2 py-0.5 rounded ${badgeColor} ml-2 font-medium hover:opacity-90 transition-opacity`}
        title={`View ${badgeText} Activity`}
      >
        {badgeText}
      </a>
    );
  };
  
  // Function to render content based on its type
  const renderContent = () => {
    const content = message.content;
    
    // Handle string content (regular text)
    if (typeof content === 'string') {
      return formatTextContent(content);
    }
    
    // Handle array of content blocks (mixed text and images)
    if (Array.isArray(content)) {
      return (
        <div className="space-y-3">
          {content.map((item, index) => {
            if (typeof item === 'string') {
              return <div key={index}>{formatTextContent(item)}</div>;
            } else if (item.type === 'text' && item.text) {
              return <div key={index}>{formatTextContent(item.text)}</div>;
            } else if (item.type === 'image_url' && item.image_url?.url) {
              return (
                <div key={index} className="mt-2">
                  <img 
                    src={item.image_url.url} 
                    alt="User uploaded image" 
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    // Handle single object (individual content block)
    if (typeof content === 'object') {
      if (content.type === 'text' && content.text) {
        return formatTextContent(content.text);
      } else if (content.type === 'image_url' && content.image_url?.url) {
        return (
          <div className="mt-2">
            <img 
              src={content.image_url.url} 
              alt="User uploaded image" 
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '300px' }}
            />
          </div>
        );
      }
    }
    
    // Fallback for unexpected content format
    return <p className="text-gray-500">Content format not supported</p>;
  };
  
  // Helper function to detect programming language from code block
  const detectLanguage = (langHint: string): string => {
    if (!langHint) return 'text';
    
    // Clean up the language hint
    const cleanedHint = langHint.toLowerCase().trim();
    
    // Normalize common language names
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'csharp': 'csharp',
      'cs': 'csharp',
      'sh': 'bash',
      'shell': 'bash',
      'bash': 'bash',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'cc': 'cpp',
      'c': 'c',
      'go': 'go',
      'golang': 'go',
      'php': 'php',
      'rust': 'rust',
      'rs': 'rust',
      'sql': 'sql', 
      'mysql': 'sql',
      'postgresql': 'sql',
      'pgsql': 'sql',
      'swift': 'swift',
      'kt': 'kotlin',
      'kotlin': 'kotlin',
      'xml': 'xml',
      'dockerfile': 'dockerfile',
      'docker': 'dockerfile',
      'graphql': 'graphql',
      'gql': 'graphql',
      'typescript': 'typescript',
      'javascript': 'javascript'
    };
    
    return langMap[cleanedHint] || cleanedHint;
  };
  
  // Function to detect and format code blocks in text messages
  const formatTextContent = (content: string) => {
    if (!content || typeof content !== 'string') return null;
    
    try {
      // Handle code with syntax highlighting
      // Use regex to match code blocks more reliably
      const codeBlockRegex = /(```([a-z0-9]*)?[\s\S]*?```)/g;
      const parts = content.split(codeBlockRegex).filter(Boolean);
      
      // Group parts into code blocks and text
      const processedParts: React.ReactNode[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Check if this part is a code block (starts and ends with ```)
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract the code content without the backticks
          const codeBlock = part.slice(3, -3);
          
          // Try to extract language hint from first line
          const firstLineEnd = codeBlock.indexOf('\n');
          
          // Handle both single-line and multi-line code blocks
          if (firstLineEnd === -1) {
            // Single line code with no language specified
            processedParts.push(
              <CodeBlock
                key={`code-${i}`}
                code={codeBlock.trim()}
                language=""
                isDarkMode={settings.darkMode}
              />
            );
          } else {
            const firstLine = codeBlock.substring(0, firstLineEnd).trim();
            let language = '';
            let code = codeBlock;
            
            // If first line could be a language identifier (short, no spaces)
            if (firstLine && !firstLine.includes(' ') && firstLine.length < 20) {
              language = detectLanguage(firstLine);
              code = codeBlock.substring(firstLineEnd + 1);
            }
            
            processedParts.push(
              <CodeBlock
                key={`code-${i}`}
                code={code.trim()}
                language={language}
                isDarkMode={settings.darkMode}
              />
            );
          }
        } else if (part.trim()) {
          // Process regular text with inline code markers
          const inlineCodeRegex = /`([^`]+)`/g;
          
          // Use a more robust method to handle inline code
          let lastIndex = 0;
          const inlineElements: React.ReactNode[] = [];
          const text = part;
          
          // Find all inline code segments
          let match;
          let matchFound = false;
          
          while ((match = inlineCodeRegex.exec(text)) !== null) {
            matchFound = true;
            // Add text before the match
            if (match.index > lastIndex) {
              const textBefore = text.substring(lastIndex, match.index);
              inlineElements.push(
                formatTextParagraphs(textBefore, `text-before-${lastIndex}`)
              );
            }
            
            // Add the code segment with enhanced styling
            inlineElements.push(
              <code 
                key={`inline-${match.index}`} 
                className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-sm ${
                  settings.darkMode 
                    ? 'bg-gray-800 text-blue-300 border border-gray-700' 
                    : 'bg-gray-100 text-blue-600 border border-gray-200'
                }`}
              >
                {match[1]}
              </code>
            );
            
            lastIndex = match.index + match[0].length;
          }
          
          // Add remaining text after last match
          if (lastIndex < text.length) {
            inlineElements.push(
              formatTextParagraphs(text.substring(lastIndex), `text-after-${lastIndex}`)
            );
          }
          
          // If inline code was found, add the inline elements
          if (matchFound) {
            processedParts.push(
              <div key={`text-${i}`}>
                {inlineElements}
              </div>
            );
          } else {
            // No inline code, just format the text
            processedParts.push(
              formatTextParagraphs(part, `text-part-${i}`)
            );
          }
        }
      }
      
      return processedParts;
    } catch (error) {
      console.error("Error formatting message content:", error);
      // Fallback to simple text rendering
      return <p>{content}</p>;
    }
  };
  
  // Helper function to format text with paragraphs and lists
  const formatTextParagraphs = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text.trim()) return null;
    
    // Process text by lines for paragraphs and lists
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    // Keep track of list state
    let inOrderedList = false;
    let inUnorderedList = false;
    let currentList: React.ReactNode[] = [];
    let listKey = 0;
    
    // Process each line
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        // Empty line - if we were in a list, end it
        if (inOrderedList) {
          elements.push(<ol key={`ol-${keyPrefix}-${listKey}`} className="list-decimal pl-5 my-2 space-y-1">{currentList}</ol>);
          inOrderedList = false;
          currentList = [];
          listKey++;
        } else if (inUnorderedList) {
          elements.push(<ul key={`ul-${keyPrefix}-${listKey}`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
          inUnorderedList = false;
          currentList = [];
          listKey++;
        }
        return;
      }
      
      // Check for list items
      const orderedListMatch = trimmedLine.match(/^\d+\.\s(.*)/);
      const unorderedListMatch = trimmedLine.match(/^[-*]\s(.*)/);
      
      if (orderedListMatch) {
        // Ordered list item
        const content = orderedListMatch[1];
        
        // If we were in an unordered list, end it
        if (inUnorderedList) {
          elements.push(<ul key={`ul-${keyPrefix}-${listKey}`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
          inUnorderedList = false;
          currentList = [];
          listKey++;
        }
        
        // Add to or start an ordered list
        inOrderedList = true;
        currentList.push(<li key={`li-${index}`}>{content}</li>);
      } else if (unorderedListMatch) {
        // Unordered list item
        const content = unorderedListMatch[1];
        
        // If we were in an ordered list, end it
        if (inOrderedList) {
          elements.push(<ol key={`ol-${keyPrefix}-${listKey}`} className="list-decimal pl-5 my-2 space-y-1">{currentList}</ol>);
          inOrderedList = false;
          currentList = [];
          listKey++;
        }
        
        // Add to or start an unordered list
        inUnorderedList = true;
        currentList.push(<li key={`li-${index}`}>{content}</li>);
      } else {
        // Regular paragraph - if we were in a list, end it
        if (inOrderedList) {
          elements.push(<ol key={`ol-${keyPrefix}-${listKey}`} className="list-decimal pl-5 my-2 space-y-1">{currentList}</ol>);
          inOrderedList = false;
          currentList = [];
          listKey++;
        } else if (inUnorderedList) {
          elements.push(<ul key={`ul-${keyPrefix}-${listKey}`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
          inUnorderedList = false;
          currentList = [];
          listKey++;
        }
        
        // Add paragraph
        elements.push(
          <p key={`p-${keyPrefix}-${index}`} className={index > 0 && elements.length > 0 ? "mt-3" : ""}>
            {trimmedLine}
          </p>
        );
      }
    });
    
    // If we ended while still in a list, add it
    if (inOrderedList) {
      elements.push(<ol key={`ol-${keyPrefix}-${listKey}`} className="list-decimal pl-5 my-2 space-y-1">{currentList}</ol>);
    } else if (inUnorderedList) {
      elements.push(<ul key={`ul-${keyPrefix}-${listKey}`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
    }
    
    return <div key={keyPrefix}>{elements}</div>;
  };
  
  // Format timestamp
  const formatMessageTime = () => {
    if (!message.timestamp) return '';
    
    const timestamp = new Date(message.timestamp);
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    
    // Format: Today at 10:30 AM or Apr 2 at 10:30 AM
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const timeStr = timestamp.toLocaleTimeString(undefined, timeOptions);
    
    if (isToday) {
      return `Today at ${timeStr}`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const dateStr = timestamp.toLocaleDateString(undefined, dateOptions);
      return `${dateStr} at ${timeStr}`;
    }
  };
  
  return (
    <div className={`flex items-start group mb-6 last:mb-0 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 dark:from-blue-600 dark:to-blue-400 flex items-center justify-center text-white mr-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%] md:max-w-xl">
        {/* Message bubble */}
        <div className={`
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg rounded-tr-none hover:shadow-md' 
            : 'bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg rounded-tl-none shadow-sm hover:shadow-md'
          } p-4 transition-all duration-200 hover:translate-y-[-1px]`}
        >
          {!isUser && (
            <div className="flex justify-between items-start mb-1">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                {getModelName(message)} {getApiProviderBadge()}
              </div>
            </div>
          )}
          {renderContent()}
        </div>
        
        {/* Timestamp */}
        <div className={`
          text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1
          ${isUser ? 'text-right mr-1' : 'ml-1'} 
          text-gray-500 dark:text-gray-400`
        }>
          {formatMessageTime()}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white ml-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}
