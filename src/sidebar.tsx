// src/components/sidebar.tsx
import React, { useState, useRef } from 'react';
import { Send, AlertTriangle, Loader2, Plus, X, Sparkles, Trash2, Image as ImageIcon, WandSparkles, Expand, Smartphone, Monitor, Tablet } from 'lucide-react';
import ApiService from './services/apiService';
import { getErrorMessage } from './lib/errorHandling';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import MarkdownEditorDialog from './promptMarkdownDialog'; 
import { fileToBase64 } from './lib/utils';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface SideNavbarProps {
    onGenerate: (prompt: string, pages: string[], base64Image?: string | null, deviceType?: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ onGenerate, isLoading, error }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [pages, setPages] = useState<string[]>([]);
    const [newPageName, setNewPageName] = useState<string>('');
    const [isAutoFlowLoading, setIsAutoFlowLoading] = useState<boolean>(false);
    const [flowError, setFlowError] = useState<string | null>(null);
    const [isPromptEnhancerLoading, setIsPromptEnhancerLoading] = useState<boolean>(false);
    const [enhanceError, setEnhanceError] = useState<string| null>(null);
    const [expandedTextarea, setExpandedTextarea] = useState<boolean>(false);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
    const [hasFlowGenerated, setHasFlowGenerated] = useState<boolean>(false);
    const [deviceType, setDeviceType] = useState<string>("desktop");
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Add state for the markdown editor dialog
    const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = useState<boolean>(false);

    const handleMainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
          setFlowError(null);
          onGenerate(prompt, pages, referenceImageBase64, deviceType);
        }
      };

    const toggleTextareaExpand = () => {        
        setIsMarkdownDialogOpen(true);
    };


    const handleSaveMarkdown = (newContent: string) => {
        setPrompt(newContent);
    };

    const handleAddPage = () => {
        if (newPageName.trim()) {
            setPages(prevPages => [...prevPages, newPageName.trim()]);
            setNewPageName('');
            setFlowError(null);
        
        }
    };

    const handleRemovePage = (indexToRemove: number) => {
        setPages(prevPages => prevPages.filter((_, index) => index !== indexToRemove));
    };

    const handleDeleteAllFlow = () => {
        setPages([]);
        setHasFlowGenerated(false);
        setFlowError(null);
    };

    const handleAutoFlow = async () => {
        if (!prompt.trim()) {
            setFlowError("Please enter a prompt first to suggest a flow.");
            return;
        }
        setIsAutoFlowLoading(true);
        setFlowError(null);

        try {
            const suggestedPages = await ApiService.generateFlow(prompt);
            setPages(suggestedPages);
            setHasFlowGenerated(true);
        } catch (err: any) {
            console.error("Error generating auto flow:", err);
            setFlowError(err.message || "Failed to generate flow.");
            setPages([]);
        } finally {
            setIsAutoFlowLoading(false);
        }
    };

   // Enhance the prompt
   const handleEnhancePrompt = async() =>{
    if(!prompt.trim()){
        setEnhanceError('Pleace enter the prompt to enhance');
        return;
    }
    setIsPromptEnhancerLoading(true);
    setEnhanceError(null);

    try{
        const response = await ApiService.enhancedPrompt(prompt);
        
        if (response && response.enhanced_prompt) {
            setPrompt(response.enhanced_prompt);
        } else {
            throw new Error("Enhanced prompt not found in response.");
        }
    }
    catch(err){
        throw new Error(getErrorMessage(err));

    }
    finally{
        setIsPromptEnhancerLoading(false)
    }
   }

    // --- Image Handlers ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
    
        if (file) {
          try {
            const base64String = await fileToBase64(file);
            setReferenceImagePreview(base64String);
            const base64Content = base64String.split(',')[1];
    
            if (base64Content) {
              setReferenceImageBase64(base64Content);
            } else {
              console.error("Could not extract base64 content from image data.");
              setReferenceImageBase64(null);
              setReferenceImagePreview(null);
            }
    
          } catch (err) {
            throw new Error(getErrorMessage(err));
            setReferenceImagePreview(null);
            setReferenceImageBase64(null);
          }
        }
      };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setReferenceImagePreview(null);
        setReferenceImageBase64(null); 
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };

    const isImageGenerationMode = !!referenceImageBase64 && pages.length === 0;

    return (
        <div className="h-screen flex">
         
                <Card className="w-80 border-r border-gray-200 flex flex-col shadow-lg z-10 rounded-none">
                    <CardHeader className="px-4 py-3 sticky top-0 bg-white z-10 border-b">
                            <CardTitle className="text-lg font-semibold text-gray-800">New Design</CardTitle>
                    
                    </CardHeader>

                    <ScrollArea className="flex-grow">
                        <CardContent className="p-4 space-y-6">
                            <form onSubmit={handleMainSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prompt">Context</Label>
                                    <div className="relative">
                                        <Textarea
                                            id="prompt"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Describe the design or provide context..."
                                            className={`resize-none pr-10 overflow-y-auto ${expandedTextarea ? 'min-h-48 h-48' : 'min-h-32 h-32'}`}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            title='Open advanced editor'
                                            type='button'
                                            variant="ghost"
                                            onClick={toggleTextareaExpand}
                                            className='absolute top-2 right-2 h-6 w-6 p-0'
                                        >
                                            <Expand size={16} />
                                        </Button>
                                        <div className="absolute bottom-2 left-2 flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 opacity-70 hover:opacity-100 bg-white shadow-sm"
                                                onClick={triggerImageUpload}
                                                title={referenceImageBase64 ? 'Change reference image' : 'Add reference image'}
                                            >
                                                <ImageIcon size={16} />
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </div>

                                        <Button
                                            title='click and enhance your prompt..'
                                            type='button'
                                            variant="outline"
                                            onClick={handleEnhancePrompt}
                                            className='absolute bottom-2 right-2 h-8 w-auto px-3 hover:opacity-100 flex items-center cursor-pointer gap-1 text-purple-600 hover:text-purple-700'
                                        >
                                            {isPromptEnhancerLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <WandSparkles size={16} />
                                            )}
                                        </Button>
                                    </div>
                                    {enhanceError && (
                                        <Alert variant="destructive" className="py-2 mt-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription className="text-xs ml-2">{enhanceError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Display uploaded image preview */}
                                    {referenceImagePreview && (
                                        <div className="relative mt-2 border rounded-md overflow-hidden">
                                            <img
                                                src={referenceImagePreview} // Use preview state here
                                                alt="Reference"
                                                className="w-full h-32 object-contain bg-gray-50"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-80"
                                                onClick={removeImage}
                                                title="Remove reference image"
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    )}
                                    {/* Indicate if image is primary mode */}
                                    {isImageGenerationMode && (
                                        <Badge variant="secondary" className="mt-1 w-full justify-center py-1">
                                            Generating based on image + prompt
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                {/* Device Type Selector */}
                                <div className="space-y-2">
                                    <Label htmlFor="device-type">Device Type</Label>
                                    <Select 
                                        value={deviceType} 
                                        onValueChange={setDeviceType}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select device type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desktop">
                                                <div className="flex items-center">
                                                    <Monitor className="h-4 w-4 mr-2" />
                                                    <span>Desktop</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="mobile">
                                                <div className="flex items-center">
                                                    <Smartphone className="h-4 w-4 mr-2" />
                                                    <span>Mobile</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="tablet">
                                                <div className="flex items-center">
                                                    <Tablet className="h-4 w-4 mr-2" />
                                                    <span>Tablet</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Design Flow Section - Disable if image is selected? */}
                                <div className={`space-y-3 ${referenceImageBase64 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex items-center justify-between">
                                        <Label>Design Flow (Optional)</Label>
                                        {pages.length > 0 && !referenceImageBase64 && (
                                            <Button
                                                type="button"
                                                onClick={handleDeleteAllFlow}
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                title="Delete All Flow"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </div>
                                    {referenceImageBase64 && (
                                        <p className="text-xs text-orange-600">Flow generation is disabled when a reference image is used (image generation creates a single page).</p>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={newPageName}
                                            onChange={(e) => setNewPageName(e.target.value)}
                                            placeholder="Page Name (e.g., About Us)"
                                            disabled={isLoading || !!referenceImageBase64}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPage(); } }}
                                            className="flex-grow"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddPage}
                                            disabled={!newPageName.trim() || isLoading || !!referenceImageBase64}
                                            variant="secondary"
                                            size="icon"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAutoFlow}
                                        disabled={!prompt.trim() || isLoading || isAutoFlowLoading || !!referenceImageBase64} 
                                        variant="outline"
                                        className="w-full"
                                    >
                                       {isAutoFlowLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>{hasFlowGenerated ? 'Regenerating Flow...' : 'Generating Flow...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} className="mr-2" />
                                                <span>{hasFlowGenerated ? 'Regenerate Flow' : 'Suggest Auto Flow'}</span>
                                            </>
                                        )}
                                    </Button>

                                    {flowError && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription className="text-xs ml-2">{flowError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {pages.length > 0 && !referenceImageBase64 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs">Added Pages:</Label>
                                            <ScrollArea className="h-40 border rounded-md">
                                                <ul className="divide-y divide-gray-100">
                                                    {pages.map((page, index) => (
                                                        <li key={`${page}-${index}`} className="flex items-center justify-between p-2 text-sm">
                                                            <Badge variant="outline" className="px-2 py-1 font-normal break-all text-left">
                                                                {page}
                                                            </Badge>
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleRemovePage(index)}
                                                                disabled={isLoading}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <Button
                                    type="submit"
                                    disabled={isLoading || !prompt.trim()}
                                    className="w-full bg-purple-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} className="mr-2" />
                                            <span>{isImageGenerationMode ? 'Generate from Image' : (pages.length > 0 ? 'Generate Flow' : 'Generate Design')}</span>
                                        </>
                                    )}
                                </Button>
                            </form>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="ml-2">{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </ScrollArea>

                    <CardFooter className="p-4 bg-gray-50 border-t">
                        <div className="w-full">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Tips</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Describe the desired output in the context box.</li>
                                <li>• Select the target device type for your design.</li>
                                <li>• Optionally add a reference image for visual guidance (generates a single page).</li>
                                <li>• Optionally define a multi-page flow (if no image is used).</li>
                                <li>• "Generate" uses context + image (if present) or context + flow.</li>
                            </ul>
                        </div>
                    </CardFooter>
                </Card>
            {/* )} */}
            
            {/* Markdown Editor Dialog */}
            <MarkdownEditorDialog
                isOpen={isMarkdownDialogOpen}
                onClose={() => setIsMarkdownDialogOpen(false)}
                initialValue={prompt}
                onSave={handleSaveMarkdown}
            />
        </div>
    );
};

export default SideNavbar;