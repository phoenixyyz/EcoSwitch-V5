import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { ExternalLink, PieChart, Activity, Settings } from "lucide-react";

export default function UsageSection() {
  const { 
    apiKey, 
    isKeyValid, 
    deepseekApiKey, 
    isDeepseekKeyValid,
    openRouterApiKey,
    isOpenRouterKeyValid,
    isOpenRouterAvailable
  } = useChat();
  
  const openaiDashboardUrl = "https://platform.openai.com/usage";
  const deepseekDashboardUrl = "https://platform.deepseek.com/usage";
  const openRouterDashboardUrl = "https://openrouter.ai/dashboard";
  const openRouterActivityUrl = "https://openrouter.ai/activity";
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <PieChart className="h-5 w-5" />
        <span>API Usage</span>
      </h3>
      
      <div className="space-y-3">
        {/* OpenAI Usage */}
        <div className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-blue-600 dark:text-blue-400">OpenAI Usage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {isKeyValid 
                  ? "Check your token usage and billing information." 
                  : "Connect your OpenAI API key to access usage information."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(openaiDashboardUrl, '_blank')}
              className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/30"
            >
              <Activity className="h-3 w-3 mr-1" />
              <span>Activity</span>
            </Button>
          </div>
        </div>
        
        {/* DeepSeek Usage */}
        <div className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400">DeepSeek Usage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {isDeepseekKeyValid 
                  ? "Check your token usage and remaining credits." 
                  : "Connect your DeepSeek API key to access usage information."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(deepseekDashboardUrl, '_blank')}
              className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/30"
            >
              <Activity className="h-3 w-3 mr-1" />
              <span>Activity</span>
            </Button>
          </div>
        </div>
        
        {/* OpenRouter Usage */}
        <div className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-purple-600 dark:text-purple-400">OpenRouter Usage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {isOpenRouterKeyValid || isOpenRouterAvailable
                  ? "Monitor your API usage and DeepSeek v3 activity." 
                  : "Connect your OpenRouter API key to access usage information."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(openRouterActivityUrl, '_blank')}
              className="flex items-center gap-1 bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/30"
            >
              <Activity className="h-3 w-3 mr-1" />
              <span>Activity</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300">
          <p className="font-medium mb-1">Why track your usage?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Monitor token consumption across models</li>
            <li>Verify cost savings from model routing</li>
            <li>Manage your API spending limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}