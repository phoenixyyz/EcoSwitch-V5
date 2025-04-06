import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from "@/context/ChatContext";
import { Moon, Save, Cpu, Zap, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SettingsSection() {
  const { settings, updateSettings, isOpenRouterAvailable, isOpenRouterKeyValid } = useChat();
  
  const handleDarkModeToggle = (checked: boolean) => {
    updateSettings({ darkMode: checked });
  };
  
  const handleAutoSaveToggle = (checked: boolean) => {
    updateSettings({ autoSave: checked });
  };
  
  const handleModelChange = (value: string) => {
    updateSettings({ model: value });
  };
  
  // Removed API provider selection as it's handled automatically
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Settings</h2>
      
      <div className="space-y-3">
        {/* Interface Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label htmlFor="darkMode" className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</Label>
          </div>
          <Switch 
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label htmlFor="autoSave" className="text-sm text-gray-600 dark:text-gray-400">Auto-save Prompts</Label>
          </div>
          <Switch 
            id="autoSave"
            checked={settings.autoSave}
            onCheckedChange={handleAutoSaveToggle}
          />
        </div>
        
        <Separator className="my-2" />
        
        {/* Model Selection */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label htmlFor="modelSelect" className="text-sm text-gray-600 dark:text-gray-400">Model</Label>
          </div>
          <Select
            value={settings.model}
            onValueChange={handleModelChange}
          >
            <SelectTrigger id="modelSelect" className="w-full bg-white text-gray-800 border-gray-300">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-800">
              <SelectGroup>
                <SelectLabel>OpenAI Models</SelectLabel>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>DeepSeek Models</SelectLabel>
                <SelectItem value="deepseek-v3-base">DeepSeek v3 Base</SelectItem>
                <SelectItem value="deepseek-v3-mini">DeepSeek v3 Mini</SelectItem>
                <SelectItem value="deepseek-v3-plus">DeepSeek v3 Plus</SelectItem>
              </SelectGroup>
              {(isOpenRouterAvailable || isOpenRouterKeyValid) && (
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-purple-500" />
                    OpenRouter Models
                  </SelectLabel>
                  <SelectItem value="meta-llama/llama-3-8b-instruct">Meta Llama 3</SelectItem>
                  <SelectItem value="openai/gpt-3.5-turbo">OpenAI GPT-3.5</SelectItem>
                  <SelectItem value="deepseek/deepseek-v3-base:free">DeepSeek v3 (Free)</SelectItem>
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
          <div className="mt-1 text-xs text-gray-500">
            {(isOpenRouterAvailable || isOpenRouterKeyValid)
              ? "Each provider requires its own valid API key. OpenRouter models require an OpenRouter API key."
              : "Model selection requires the corresponding API key to be valid."
            }
          </div>
          
          {/* OpenRouter Info Box */}
          {(isOpenRouterAvailable || isOpenRouterKeyValid) && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
              <h4 className="text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">About OpenRouter Models</h4>
              <p className="text-xs text-purple-700 dark:text-purple-400 mb-2">
                <strong>DeepSeek (Free):</strong> May sometimes return empty responses due to rate limits or content filtering. Try another model if this persists.
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mb-2">
                <strong>Llama 3 & GPT-3.5:</strong> Free tier allows up to 1GB of usage. Each message uses a small amount of this quota.
              </p>
              <div className="flex items-center gap-1">
                <a 
                  href="https://openrouter.ai/activity" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 dark:text-purple-300 hover:underline flex items-center"
                >
                  Check your usage
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
        
        <Separator className="my-3" />
        
        {/* What is This button */}
        <div className="mt-4">
          <Link href="/about">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4" />
              What is EcoSwitch AI?
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
