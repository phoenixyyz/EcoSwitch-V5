import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from "@/context/ChatContext";
import { Moon, Save, Cpu, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
                <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                <SelectItem value="deepseek-llm-67b-chat">DeepSeek LLM 67B Chat</SelectItem>
              </SelectGroup>
              {(isOpenRouterAvailable || isOpenRouterKeyValid) && (
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-purple-500" />
                    OpenRouter Models
                  </SelectLabel>
                  <SelectItem value="deepseek/deepseek-v3-base:free">DeepSeek v3 Base</SelectItem>
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
        </div>
      </div>
    </div>
  );
}
