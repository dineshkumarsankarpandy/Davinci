import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2, Plus, X, Sparkles, Trash2 } from 'lucide-react';
import ApiService from './services/apiService'; // *** Import ApiService ***

interface SideNavbarProps {
    onGenerate: (prompt: string, pages: string[]) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ onGenerate, isLoading, error }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [pages, setPages] = useState<string[]>([]);
    const [newPageName, setNewPageName] = useState<string>('');
    const [isAutoFlowLoading, setIsAutoFlowLoading] = useState<boolean>(false);
    const [flowError, setFlowError] = useState<string | null>(null); // Specific error state for flow

    const handleMainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            setFlowError(null); // Clear flow error on main submission
            onGenerate(prompt, pages);
            // setPrompt(''); // Keep prompt for potential re-runs?
            // setPages([]); // Keep pages? Decide based on desired UX
            // setIsFormOpen(false); // Keep form open?
        }
    };

    const handleAddPage = () => {
        if (newPageName.trim()) {
            setPages(prevPages => [...prevPages, newPageName.trim()]);
            setNewPageName('');
            setFlowError(null); // Clear error when manually adding
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
        setFlowError(null); // Clear previous errors

        try {
          // *** Call the actual API service ***
          const suggestedPages = await ApiService.generateFlow(prompt);
          setPages(suggestedPages); // Update pages state with the result
        } catch (err: any) {
          console.error("Error generating auto flow:", err);
          // Set specific flow error message
          setFlowError(err.message || "Failed to generate flow.");
          setPages([]); // Clear pages on error? Or keep previous? Clearing for now.
        } finally {
          setIsAutoFlowLoading(false);
        }
    };

    return (
        <div className="h-screen flex">
            {/* Navbar */}
            <nav className="w-16 bg-gray-800 flex flex-col items-center py-4 shadow-lg z-20 shrink-0">
                <div className="text-white mb-6">
                    <h1 className="text-lg font-semibold">SDK</h1>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                    title="Create New Design"
                >
                    <Plus size={24} />
                </button>
            </nav>

            {/* Toggleable Form Panel */}
            {isFormOpen && (
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 overflow-y-auto">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                        <h1 className="text-lg font-semibold text-gray-800">New Design</h1>
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area (Scrollable) */}
                    <div className="p-4 flex-grow space-y-6">
                        {/* Prompt Form */}
                        <form onSubmit={handleMainSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                                    Context
                                </label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="E.g., A landing page for a SaaS product..."
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none text-sm"
                                    rows={4}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Flow Creation Section */}
                            <div className='space-y-4 border-t border-gray-200 pt-4'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Design Flow
                                </label>

                                {/* Manual Page Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                        placeholder="Page Name (e.g., About Us)"
                                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-sm"
                                        disabled={isLoading}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPage(); } }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddPage}
                                        disabled={!newPageName.trim() || isLoading}
                                        className="px-3 py-2 bg-gray-200 text-black  rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Auto Flow Button */}
                                <button
                                    type="button"
                                    onClick={handleAutoFlow}
                                    disabled={!prompt.trim() || isLoading || isAutoFlowLoading}
                                    className="w-full px-4 py-2 border border-indigo-300 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium gap-2"
                                >
                                    {isAutoFlowLoading ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4" />
                                            <span>Generating Flow...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            <span>Suggest Auto Flow</span>
                                        </>
                                    )}
                                </button>

                                {/* *** Display Flow Generation Error *** */}
                                {flowError && (
                                    <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-start gap-1.5">
                                        <AlertTriangle size={14} className="flex-shrink-0 mt-px" />
                                        <span>{flowError}</span>
                                    </div>
                                )}

                                {/* Added Pages List */}
                                {pages.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className="text-xs font-medium text-gray-600">Added Pages:</h4>
                                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-40 overflow-y-auto"> {/* Added max-height and scroll */}
                                            {pages.map((page, index) => (
                                                <li key={`${page}-${index}`} className="flex items-center justify-between p-2 text-sm">
                                                    <span className='text-gray-800 break-all'>{page}</span> {/* Added break-all */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePage(index)}
                                                        disabled={isLoading}
                                                        className="text-gray-400 hover:text-red-500 disabled:opacity-50 ml-2 shrink-0" // Added margin and shrink
                                                        title={`Remove ${page}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div> {/* End Flow Creation Section */}

                            {/* Main Generate Button */}
                             <div className='border-t border-gray-200 pt-4'>
                                 <button
                                     type="submit"
                                     disabled={isLoading || !prompt.trim()}
                                     className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium gap-2"
                                 >
                                     {isLoading ? ( /* This uses the MAIN isLoading state */
                                         <>
                                             <Loader2 className="animate-spin h-4 w-4" />
                                             <span>Generating ...</span>
                                         </>
                                     ) : (
                                         <>
                                             <Send size={16} />
                                             <span>Generate</span>
                                         </>
                                     )}
                                 </button>
                            </div>

                        </form>

                        {/* Main Generation Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-start gap-2">
                                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div> {/* End Scrollable Content Area */}

                    {/* Tips Section */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Tips</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Prompt gives context for Auto Flow.</li>
                            <li>• Add pages manually or use Auto Flow.</li>
                            <li>• "Generate Design" uses prompt + pages.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideNavbar;