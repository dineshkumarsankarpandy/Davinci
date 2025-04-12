// src/components/sidebar.tsx (or wherever SideNavbar is defined)
import React, { useState, useRef } from 'react';
import { Send, AlertTriangle, Loader2, Plus, X, Sparkles, Trash2, Image as ImageIcon, WandSparkles } from 'lucide-react';
import ApiService from './services/apiService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SideNavbarProps {
    // Update the signature to include optional base64Image
    onGenerate: (prompt: string, pages: string[], base64Image?: string | null) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ onGenerate, isLoading, error }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState<boolean>(true); // Default to open maybe?
    const [pages, setPages] = useState<string[]>([]);
    const [newPageName, setNewPageName] = useState<string>('');
    const [isAutoFlowLoading, setIsAutoFlowLoading] = useState<boolean>(false);
    const [flowError, setFlowError] = useState<string | null>(null);

    // For image upload preview (Data URL)
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    // For sending to backend (Base64 string only)
    const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            setFlowError(null);
            // Pass prompt, pages, and the base64 image string (or null)
            onGenerate(prompt, pages, referenceImageBase64);
        }
    };

    // --- (Keep handleAddPage, handleRemovePage, handleAutoFlow as they are) ---
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

    const handleAutoFlow = async () => {
        if (!prompt.trim()) {
            setFlowError("Please enter a prompt first to suggest a flow.");
            return;
        }
        setIsAutoFlowLoading(true);
        setFlowError(null);

        try {
            // Ensure generateFlow is correctly typed in ApiService if not already
            const suggestedPages = await ApiService.generateFlow(prompt);
            setPages(suggestedPages);
        } catch (err: any) {
            console.error("Error generating auto flow:", err);
            setFlowError(err.message || "Failed to generate flow.");
            setPages([]);
        } finally {
            setIsAutoFlowLoading(false);
        }
    };
    // --- Image Handlers ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                // Set the preview URL (full Data URL)
                setReferenceImagePreview(result);
                // Extract and set the Base64 part for the API
                // Format is "data:[mime/type];base64,[actual_base64_string]"
                const base64String = result.split(',')[1];
                if (base64String) {
                   setReferenceImageBase64(base64String);
                } else {
                    console.error("Could not extract base64 string from image data.");
                    setReferenceImageBase64(null); // Clear if extraction fails
                    setReferenceImagePreview(null);
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                setReferenceImagePreview(null);
                setReferenceImageBase64(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setReferenceImagePreview(null);
        setReferenceImageBase64(null); // Clear base64 string as well
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    // Determine if image generation should be the primary action
    const isImageGenerationMode = !!referenceImageBase64 && pages.length === 0;

    return (
        <div className="h-screen flex">
            {/* Navbar */}
            <nav className="w-16 bg-gray-800 flex flex-col items-center py-4 shadow-lg z-20 shrink-0">
                 {/* ... (Navbar content unchanged) ... */}
                 <div className="text-white mb-6">
                    <h1 className="text-lg font-semibold">SDK</h1>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    title="Create New Design"
                >
                    <Plus size={24} />
                </Button>
            </nav>

            {isFormOpen && (
                <Card className="w-80 border-r border-gray-200 flex flex-col shadow-lg z-10 rounded-none">
                    <CardHeader className="px-4 py-3 sticky top-0 bg-white z-10 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-800">New Design</CardTitle>
                            <Button
                                onClick={() => setIsFormOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <X size={18} />
                            </Button>
                        </div>
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
                                            className="min-h-24 resize-none pr-10"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute bottom-2 left-2 h-8 w-8 opacity-70 hover:opacity-100 bg-white border shadow-sm"
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

                                        <Button
                                                type='button'
                                                variant="outline"
                                                className='absolute bottom-2 right-2 h-6 w-20 hover:opacity-100'
                                        >
                                            <p>enhance</p> <WandSparkles size={10}/>


                                        </Button>
                                    </div>

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

                                {/* Design Flow Section - Disable if image is selected? */}
                                <div className={`space-y-3 ${referenceImageBase64 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Label>Design Flow (Optional)</Label>
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
                                            disabled={!newPageName.trim() || isLoading || !!referenceImageBase64} // Disable
                                            variant="secondary"
                                            size="icon"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAutoFlow}
                                        disabled={!prompt.trim() || isLoading || isAutoFlowLoading || !!referenceImageBase64} // Disable
                                        variant="outline"
                                        className="w-full"
                                    >
                                       {isAutoFlowLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>Generating Flow...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} className="mr-2" />
                                                <span>Suggest Auto Flow</span>
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
                                                 {/* ... (Page list unchanged) ... */}
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
                                    className="w-full"
                                >
                                    {/* ... (Submit button content unchanged) ... */}
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} className="mr-2" />
                                             <span>{isImageGenerationMode ? 'Generate from Image' : (pages.length > 0 ? 'Generate Flow' : 'Generate Page')}</span>
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
                        {/* ... (Card Footer unchanged) ... */}
                        <div className="w-full">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Tips</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Describe the desired output in the context box.</li>
                                <li>• Optionally add a reference image for visual guidance (generates a single page).</li>
                                <li>• Optionally define a multi-page flow (if no image is used).</li>
                                <li>• "Generate" uses context + image (if present) or context + flow.</li>
                            </ul>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default SideNavbar;