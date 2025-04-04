import { useState, useEffect } from "react";
import { Eye, EyeOff, Trash2, CheckCircle2, Coffee, Zap, ExternalLink, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function APIKeySection() {
  const { toast } = useToast();
  const { 
    apiKey, 
    setApiKey, 
    isKeyValid, 
    validateApiKey,
    deepseekApiKey,
    setDeepseekApiKey,
    isDeepseekKeyValid,
    validateDeepseekApiKey,
    openRouterApiKey,
    setOpenRouterApiKey,
    isOpenRouterKeyValid,
    validateOpenRouterApiKey,
    isOpenRouterAvailable,
    checkOpenRouterConnection,
    updateSettings
  } = useChat();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDeepseekApiKey, setShowDeepseekApiKey] = useState(false);
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false);
  
  // When apiKey changes, validate it
  useEffect(() => {
    if (apiKey) {
      validateApiKey();
    }
  }, [apiKey]);
  
  // When deepseekApiKey changes, validate it
  useEffect(() => {
    if (deepseekApiKey) {
      validateDeepseekApiKey();
    }
  }, [deepseekApiKey]);
  
  // When openRouterApiKey changes, validate it
  useEffect(() => {
    if (openRouterApiKey) {
      validateOpenRouterApiKey();
    }
  }, [openRouterApiKey]);
  
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };
  
  const toggleDeepseekApiKeyVisibility = () => {
    setShowDeepseekApiKey(!showDeepseekApiKey);
  };
  
  const toggleOpenRouterApiKeyVisibility = () => {
    setShowOpenRouterApiKey(!showOpenRouterApiKey);
  };
  
  const clearAllApiKeys = () => {
    setApiKey("");
    setDeepseekApiKey("");
    setOpenRouterApiKey("");
    localStorage.removeItem("chatgpt-api-key");
    localStorage.removeItem("deepseek-api-key");
    localStorage.removeItem("openrouter-api-key");
    toast({
      title: "API Keys Cleared",
      description: "All API keys have been removed",
    });
  };
  
  // Function to validate all available options and set them as active
  const verifyAllApiKeys = async () => {
    let openAIValid = false;
    let deepseekValid = false;
    let openRouterValid = false;
    let openRouterKeyValid = false;
    let message = "";
    
    // Validate OpenAI API key
    if (apiKey.trim()) {
      openAIValid = await validateApiKey();
      message += openAIValid ? "✓ OpenAI API key is valid\n" : "✗ OpenAI API key is invalid\n";
    } else {
      message += "No OpenAI API key provided\n";
    }
    
    // Validate DeepSeek API key
    if (deepseekApiKey.trim()) {
      deepseekValid = await validateDeepseekApiKey();
      message += deepseekValid ? "✓ DeepSeek API key is valid\n" : "✗ DeepSeek API key is invalid\n";
    } else {
      message += "No DeepSeek API key provided\n";
    }
    
    // Validate OpenRouter API key
    if (openRouterApiKey.trim()) {
      openRouterKeyValid = await validateOpenRouterApiKey();
      message += openRouterKeyValid ? "✓ OpenRouter API key is valid\n" : "✗ OpenRouter API key is invalid\n";
    } else {
      message += "No OpenRouter API key provided\n";
    }
    
    // Check OpenRouter general availability
    openRouterValid = await checkOpenRouterConnection();
    message += openRouterValid ? "✓ OpenRouter service is available" : "✗ OpenRouter service is unavailable";
    
    // Determine toast status and message
    if (openAIValid || deepseekValid || openRouterValid || openRouterKeyValid) {
      toast({
        title: "AI Services Verified",
        description: message,
      });
    } else {
      toast({
        title: "Verification Failed",
        description: message + "\n\nPlease provide at least one valid API key or check your internet connection.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      {/* Support the Developer Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="h-4 w-4 text-orange-500" />
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Support the Developer</Label>
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white border-none mb-1"
          onClick={() => window.open('https://ko-fi.com/phoenix_yyz', '_blank')}
        >
          <span className="font-medium">Buy me a coffee</span>
          <Coffee className="h-4 w-4" />
        </Button>
        <div className="text-xs text-gray-500 text-center mb-2">
          Support further development of EcoSwitch AI
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* OpenAI API Key Section */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="flex items-center">
            OpenAI API Key
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Advanced
            </span>
          </span>
        </h2>
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          Get API Key
        </a>
      </div>
      <div className="relative">
        <Input 
          type={showApiKey ? "text" : "password"}
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 pr-10 text-sm bg-white text-gray-800 border-gray-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0 bg-white text-gray-400 hover:text-gray-600"
          onClick={toggleApiKeyVisibility}
        >
          {showApiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="mt-1 flex items-center text-xs">
        <span className={`${isKeyValid ? "bg-green-500" : "bg-gray-300"} rounded-full w-2 h-2 mr-2`}></span>
        <span className={`font-medium ${isKeyValid ? "text-green-700 dark:text-green-500" : "text-gray-500 dark:text-gray-400"}`}>
          {isKeyValid ? "OpenAI API key is valid ✓" : "OpenAI API not connected"}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        OpenAI API keys (starting with 'sk-') are used for complex tasks requiring advanced capabilities.
      </div>
      
      {/* OpenAI Activity Button */}
      <div className="mt-2 flex justify-end">
        <a 
          href="https://platform.openai.com/usage" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center"
        >
          <Activity className="h-3 w-3 mr-1" />
          View Activity
        </a>
      </div>
      
      {/* Switch to OpenAI Button */}
      <div className="mt-2">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-xs bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white border-none"
          onClick={() => {
            if (isKeyValid) {
              // Update settings to use OpenAI
              if (updateSettings) {
                updateSettings({
                  apiProvider: "openai",
                  model: "gpt-4o", // Use GPT-4o as default for OpenAI
                });
              }
              toast({
                title: "OpenAI Activated",
                description: "GPT-4o via OpenAI is now set as your AI provider.",
              });
            } else {
              toast({
                title: "OpenAI Unavailable",
                description: "Your OpenAI API key is invalid or missing. Please add a valid API key.",
                variant: "destructive",
              });
            }
          }}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span className="font-medium">Switch to OpenAI (GPT-4o)</span>
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {/* DeepSeek API Key Section */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="flex items-center">
            DeepSeek API Key
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Cost-effective
            </span>
          </span>
        </h2>
        <a 
          href="https://platform.deepseek.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          Get API Key
        </a>
      </div>
      <div className="relative">
        <Input 
          type={showDeepseekApiKey ? "text" : "password"}
          placeholder="Enter your DeepSeek API key"
          value={deepseekApiKey}
          onChange={(e) => setDeepseekApiKey(e.target.value)}
          className="w-full p-2 pr-10 text-sm bg-white text-gray-800 border-gray-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0 bg-white text-gray-400 hover:text-gray-600"
          onClick={toggleDeepseekApiKeyVisibility}
        >
          {showDeepseekApiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="mt-1 flex items-center text-xs">
        <span className={`${isDeepseekKeyValid ? "bg-green-500" : "bg-gray-300"} rounded-full w-2 h-2 mr-2`}></span>
        <span className={`font-medium ${isDeepseekKeyValid ? "text-green-700 dark:text-green-500" : "text-gray-500 dark:text-gray-400"}`}>
          {isDeepseekKeyValid ? "DeepSeek API key is valid ✓" : "DeepSeek API not connected"}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        DeepSeek API keys (starting with 'sk-') are used for simpler tasks to reduce costs while maintaining quality.
      </div>
      
      {/* DeepSeek Activity Button */}
      <div className="mt-2 flex justify-end">
        <a 
          href="https://platform.deepseek.com/usage" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline flex items-center"
        >
          <Activity className="h-3 w-3 mr-1" />
          View Activity
        </a>
      </div>
      
      {/* Switch to DeepSeek Button */}
      <div className="mt-2">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-xs bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white border-none"
          onClick={() => {
            if (isDeepseekKeyValid) {
              // Update settings to use DeepSeek
              if (updateSettings) {
                updateSettings({
                  apiProvider: "deepseek",
                  model: "deepseek-chat", // Use DeepSeek Chat as default
                });
              }
              toast({
                title: "DeepSeek Activated",
                description: "DeepSeek Chat is now set as your AI provider.",
              });
            } else {
              toast({
                title: "DeepSeek Unavailable",
                description: "Your DeepSeek API key is invalid or missing. Please add a valid API key.",
                variant: "destructive",
              });
            }
          }}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span className="font-medium">Switch to DeepSeek Chat</span>
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {/* OpenRouter Section */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="flex items-center">
            OpenRouter API Key
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
              Alternative Models
            </span>
          </span>
        </h2>
        <a 
          href="https://openrouter.ai/settings/keys" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          Get API Key
        </a>
      </div>
      <div className="relative">
        <Input 
          type={showOpenRouterApiKey ? "text" : "password"}
          placeholder="Enter your OpenRouter API key"
          value={openRouterApiKey}
          onChange={(e) => setOpenRouterApiKey(e.target.value)}
          className="w-full p-2 pr-10 text-sm bg-white text-gray-800 border-gray-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0 bg-white text-gray-400 hover:text-gray-600"
          onClick={toggleOpenRouterApiKeyVisibility}
        >
          {showOpenRouterApiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="mt-1 flex items-center text-xs">
        <span className={`${isOpenRouterKeyValid && openRouterApiKey?.trim() !== '' ? "bg-green-500" : "bg-gray-300"} rounded-full w-2 h-2 mr-2`}></span>
        <span className={`font-medium ${isOpenRouterKeyValid && openRouterApiKey?.trim() !== '' ? "text-green-700 dark:text-green-500" : "text-gray-500 dark:text-gray-400"}`}>
          {isOpenRouterKeyValid && openRouterApiKey?.trim() !== '' ? "OpenRouter API key is valid ✓" : "OpenRouter API not connected"}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        OpenRouter provides access to various AI models. We use DeepSeek v3 model through OpenRouter for efficient processing.
      </div>
      
      {/* OpenRouter links - always show activity link */}
      <div className="mt-2 flex justify-end">
        <a 
          href="https://openrouter.ai/activity" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:underline flex items-center"
        >
          <Activity className="h-3 w-3 mr-1" />
          View Activity
        </a>
      </div>
      
      <div className="mt-2">
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-xs bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white border-none"
            onClick={async () => {
              const valid = openRouterApiKey.trim() ? isOpenRouterKeyValid : await checkOpenRouterConnection();
              if (valid) {
                // Update settings to use OpenRouter
                if (updateSettings) {
                  updateSettings({
                    apiProvider: "openrouter",
                    model: "deepseek/deepseek-v3-base:free", // Always use DeepSeek v3 for OpenRouter
                  });
                }
                toast({
                  title: "OpenRouter AI Activated",
                  description: "DeepSeek v3 via OpenRouter is now set as your AI provider.",
                });
              } else {
                toast({
                  title: "OpenRouter AI Unavailable",
                  description: "OpenRouter is currently unavailable or your API key is invalid. Please try again later or check your API key.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Zap className="h-4 w-4 mr-1" />
            <span className="font-medium">Switch to OpenRouter AI</span>
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* Verify API Keys Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 mb-2 flex items-center justify-center"
        onClick={verifyAllApiKeys}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Verify API Keys
      </Button>
      
      {/* Clear API Keys Button */}
      <Button 
        variant="destructive" 
        size="sm" 
        className="w-full mt-2 flex items-center justify-center"
        onClick={clearAllApiKeys}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear All API Keys
      </Button>
    </div>
  );
}
