import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { ExternalLink, PieChart, Zap, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function QuickUsageStatus() {
  const { 
    isKeyValid, 
    isDeepseekKeyValid,
    isOpenRouterKeyValid,
    isOpenRouterAvailable,
    settings
  } = useChat();
  
  // Dashboard URLs for different providers
  const dashboardUrls = {
    openai: "https://platform.openai.com/usage",
    deepseek: "https://platform.deepseek.com/usage",
    openrouter: "https://openrouter.ai/activity"
  };
  
  // Determine which provider is active based on settings
  const activeProvider = settings.apiProvider;
  
  // Get connection status for each provider
  const connectionStatusMap = {
    openai: isKeyValid,
    deepseek: isDeepseekKeyValid,
    openrouter: isOpenRouterKeyValid || isOpenRouterAvailable
  };
  
  // Check if the current provider is connected
  const isCurrentProviderConnected = connectionStatusMap[activeProvider];
  
  // Determine button style based on provider
  const getButtonColor = () => {
    switch(activeProvider) {
      case 'openai': return 'bg-blue-500 text-white';
      case 'deepseek': return 'bg-green-500 text-white';
      case 'openrouter': return 'bg-purple-600 text-white';
      default: return '';
    }
  };
  
  // Get provider display name
  const getProviderName = () => {
    switch(activeProvider) {
      case 'openai': return 'OpenAI';
      case 'deepseek': return 'DeepSeek';
      case 'openrouter': return 'OpenRouter';
      default: return 'AI';
    }
  };
  
  // Get tooltip content
  const getTooltipContent = () => {
    if (!connectionStatusMap[activeProvider]) {
      if (activeProvider === 'openrouter') {
        return "OpenRouter connection unavailable. Please provide an API key.";
      }
      return `Connect ${getProviderName()} API key first`;
    }
    
    if (activeProvider === 'openrouter') {
      return "Using DeepSeek v3 model via OpenRouter - Click to view activity";
    }
    
    return `Using ${getProviderName()} - Click to view activity`;
  };

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(dashboardUrls[activeProvider], '_blank')}
              className={`h-8 px-3 text-sm flex items-center ${getButtonColor()}`}
            >
              <span className={`h-2 w-2 rounded-full mr-2 ${
                isCurrentProviderConnected ? 
                  activeProvider === 'openai' ? 'bg-blue-300' : 
                  activeProvider === 'deepseek' ? 'bg-green-300' : 
                  'bg-purple-300' 
                : 'bg-gray-300'
              } border border-white`}></span>
              <span className="font-medium">{getProviderName()}</span>
              {activeProvider === 'openrouter' ? (
                <Activity className="h-3.5 w-3.5 ml-1.5" />
              ) : (
                <Zap className="h-3.5 w-3.5 ml-1.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}