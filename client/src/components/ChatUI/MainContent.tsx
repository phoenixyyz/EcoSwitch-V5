import { Menu, AlertTriangle, Check, Lightbulb } from "lucide-react";
import ConversationContainer from "./ConversationContainer";
import PromptInput from "./PromptInput";
import QuickUsageStatus from "./QuickUsageStatus";
import { useChat } from "@/context/ChatContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MainContentProps {
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  hasMessages: boolean;
  isLoading: boolean;
}

export default function MainContent({ 
  toggleSidebar, 
  isAuthenticated,
  hasMessages,
  isLoading
}: MainContentProps) {
  const { 
    isKeyValid: isOpenAIValid, 
    isDeepseekKeyValid,
    settings
  } = useChat();
  
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-800">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center sticky top-0 z-10">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="md:hidden">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 text-transparent bg-clip-text">EcoSwitch AI</h1>
        </div>
        
        {/* API Status Indicators */}
        <div className="hidden sm:flex items-center space-x-2 ml-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`
                  flex items-center px-2 py-1 rounded-full border text-xs font-medium
                  ${isOpenAIValid 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}
                  transition-all duration-200
                `}>
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${isOpenAIValid ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span>OpenAI</span>
                  {isOpenAIValid && <Check className="h-3 w-3 ml-1 text-blue-600 dark:text-blue-400" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isOpenAIValid ? 'OpenAI API is connected' : 'OpenAI API is not connected'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`
                  flex items-center px-2 py-1 rounded-full border text-xs font-medium
                  ${isDeepseekKeyValid 
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}
                  transition-all duration-200
                `}>
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${isDeepseekKeyValid ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>DeepSeek</span>
                  {isDeepseekKeyValid && <Check className="h-3 w-3 ml-1 text-green-600 dark:text-green-400" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isDeepseekKeyValid ? 'DeepSeek API is connected' : 'DeepSeek API is not connected'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {(!isOpenAIValid && !isDeepseekKeyValid) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1.5 text-amber-500" />
                    <span>No API Connected</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">Please connect at least one API provider in the sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {(isOpenAIValid || isDeepseekKeyValid) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden lg:flex items-center px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 text-xs">
                    <Lightbulb className="h-3 w-3 mr-1.5 text-amber-500" />
                    <span>EcoSwitch: Auto-routing enabled</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">EcoSwitch will automatically select the most cost-effective API based on your task complexity</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Active Provider Indicator */}
          {(settings.apiProvider === 'openai' || settings.apiProvider === 'deepseek') && (isOpenAIValid || isDeepseekKeyValid) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`
                    hidden md:flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-1
                    ${settings.apiProvider === 'openai' 
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/20 dark:border-blue-700 dark:text-blue-300' 
                      : 'bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-800 dark:from-green-900/40 dark:to-green-800/20 dark:border-green-700 dark:text-green-300'}
                    hover:shadow-sm transition-all duration-200
                  `}>
                    <div className={`h-2 w-2 rounded-full mr-1.5 animate-pulse ${settings.apiProvider === 'openai' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-green-600 dark:bg-green-500'}`}></div>
                    <span className="font-medium">
                      Active: <span className="font-semibold">{settings.apiProvider === 'openai' ? 'OpenAI' : 'DeepSeek'}</span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-sm">
                    {settings.apiProvider === 'openai' 
                      ? 'Currently using OpenAI for responses' 
                      : 'Currently using DeepSeek for responses'}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="ml-auto">
          {/* Usage status indicators with links to dashboards */}
          <QuickUsageStatus />
        </div>
      </header>
      
      <ConversationContainer 
        hasMessages={hasMessages}
        isLoading={isLoading}
      />
      
      <PromptInput />
    </div>
  );
}
