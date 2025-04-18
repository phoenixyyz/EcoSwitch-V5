import { FormEvent, useRef, useEffect, useState } from "react";
import { Trash, ArrowRight, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PromptInput() {
  const { 
    apiKey, 
    isKeyValid,
    deepseekApiKey,
    isDeepseekKeyValid,
    isOpenRouterAvailable,
    settings,
    updateSettings,
    currentPrompt, 
    setCurrentPrompt, 
    imageAttachment,
    setImageAttachment,
    clearPrompt, 
    sendPrompt, 
    isLoading 
  } = useChat();
  
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Adjust textarea height as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 192)}px`; // Max 192px (4 rows)
    }
  }, [currentPrompt]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 2MB to avoid issues when converted to base64)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      setImageAttachment(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Always proceed with sending if we have input and we're not already loading
    if ((currentPrompt.trim() || previewImage) && !isLoading) {
      sendPrompt();
      setPreviewImage(null);
    }
  };
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 dark:focus-within:ring-blue-500 focus-within:border-blue-600 dark:focus-within:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message here..."
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              className="w-full p-4 outline-none resize-none text-gray-800 dark:text-gray-200 bg-transparent min-h-[48px] max-h-[192px] rounded-t-xl"
              disabled={isLoading}
            />
            
            {/* Image preview */}
            {previewImage && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 bg-opacity-50">
                <div className="relative inline-block group">
                  <img 
                    src={previewImage} 
                    alt="Image attachment" 
                    className="max-h-32 max-w-full rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 shadow-md opacity-90 hover:opacity-100 transition-opacity duration-150"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Button row */}
            <div className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear prompt"
                        onClick={clearPrompt}
                        disabled={!currentPrompt || isLoading}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-lg transition-colors duration-200"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Clear message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Image upload button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Attach image"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !!previewImage}
                        className={`p-1 rounded-lg transition-colors duration-200 ${
                          previewImage 
                            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <Image className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{previewImage ? 'Image attached' : 'Attach image'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Settings button removed as requested */}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={
                    // Only disable if no input (text or image) or while loading
                    (!currentPrompt.trim() && !previewImage) || isLoading
                  }
                  className={`
                    px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-sm
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px]'}
                    bg-gradient-to-r from-blue-600 to-blue-500 text-white
                  `}
                >
                  <span>{isLoading ? 'Sending...' : 'Send'}</span>
                  <ArrowRight className={`h-4 w-4 ml-1 transition-transform duration-300 ${isLoading ? 'animate-pulse' : 'group-hover:translate-x-0.5'}`} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Model parameters panel removed as requested */}
          
          {/* Removed banner that was causing greyed out send button on mobile */}
        </form>
      </div>
    </div>
  );
}
