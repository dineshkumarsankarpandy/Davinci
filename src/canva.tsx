// import React, { useRef, useState, useCallback } from 'react';
// import { ReactInfiniteCanvas, ReactInfiniteCanvasHandle } from 'react-infinite-canvas';
// import { Loader2, X, Star, Pencil } from 'lucide-react';
// import SideNavbar from './sidebar';
// import WireframeRenderer from './wireframeRenderer';
// import { ContentHighlightInfo, ContentActionType } from './useContentHighlights'

// // --- API URL ---
// const API_BASE_URL = "http://localhost:8000";

// // Define transform state structure based on CanvasState.currentPosition
// interface CanvasTransformState { k: number; x: number; y: number; }

// // --- Data Structures ---
// interface WebsiteData { id: string; title: string; htmlContent: string; position: { x: number; y: number }; }
// interface RegenerateModalState { isOpen: boolean; websiteId: string | null; sectionInfo: { id: string; tagName: string; outerHTML: string; } | null; }
// interface EditContentModalState { isOpen: boolean; websiteId: string | null; contentInfo: ContentHighlightInfo | null; }
// interface AskAIModalState { isOpen: boolean; websiteId: string | null; contentInfo: ContentHighlightInfo | null; }

// // --- Main Canvas Application Component ---
// const CanvasApp: React.FC = () => {
//     // --- Refs and State ---
//     const canvasRef = useRef<ReactInfiniteCanvasHandle>(null);
//     const canvasContentRef = useRef<HTMLDivElement>(null);
//     const [generatedWebsites, setGeneratedWebsites] = useState<WebsiteData[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [isUpdatingContent, setIsUpdatingContent] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);
//     const [activeWebsiteId, setActiveWebsiteId] = useState<string | null>(null);
//     // *** Initialize canvas transform state with correct type ***
//     const [canvasTransform, setCanvasTransform] = useState<CanvasTransformState>({ k: 1, x: 0, y: 0 });
//     const [regenerateModal, setRegenerateModal] = useState<RegenerateModalState>({ isOpen: false, websiteId: null, sectionInfo: null });
//     const [editContentModal, setEditContentModal] = useState<EditContentModalState>({ isOpen: false, websiteId: null, contentInfo: null });
//     const [askAIModal, setAskAIModal] = useState<AskAIModalState>({ isOpen: false, websiteId: null, contentInfo: null });
//     const [editContentValue, setEditContentValue] = useState('');

//     const fitContent = useCallback(() => { setTimeout(() => { if (canvasRef.current?.fitContentToView && generatedWebsites.length > 0) canvasRef.current.fitContentToView({ duration: 500 }); }, 300); }, [generatedWebsites.length]);
//     const handleGenerateWebsite = async (prompt: string) => { if (!prompt.trim() || isLoading) return; setIsLoading(true); setError(null); try { const response = await fetch(`${API_BASE_URL}/api/generate-html`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }), }); if (!response.ok) { const e = await response.text(); throw new Error(`HTTP ${response.status}: ${e}`); } const data = await response.json(); const newWebsite: WebsiteData = { id: `web-${Date.now()}`, title: prompt.substring(0, 60) + (prompt.length > 60 ? '...' : ''), htmlContent: data.html, position: { x: 100 + (generatedWebsites.length % 4) * (1440 + 100), y: 100 + Math.floor(generatedWebsites.length / 4) * (800 + 150) } }; setGeneratedWebsites(prev => [...prev, newWebsite]); setActiveWebsiteId(newWebsite.id); fitContent(); } catch (err: any) { setError(err.message || 'Err gen.'); } finally { setIsLoading(false); } };
//     const handleDeleteWebsite = (id: string) => { setGeneratedWebsites(prev => prev.filter(w => w.id !== id)); if (activeWebsiteId === id) setActiveWebsiteId(null); };
//     const handleSetActiveWebsite = (id: string) => { if (activeWebsiteId !== id) setActiveWebsiteId(id); };

//     const handleCanvasZoom = useCallback((event: any) => {
//         const transform = event?.transform;
//         if (transform && typeof transform.k === 'number' && typeof transform.x === 'number' && typeof transform.y === 'number') {
//             setCanvasTransform(prev => {
//                 if (prev.k !== transform.k || prev.x !== transform.x || prev.y !== transform.y) {
//                     return { k: transform.k, x: transform.x, y: transform.y };
//                 }
//                 return prev;
//             });
//         } else {
//             const state = canvasRef.current?.getCanvasState();
//             if (state) {
//                 setCanvasTransform(prev => {
//                     if (prev.k !== state.currentPosition.k || prev.x !== state.currentPosition.x || prev.y !== state.currentPosition.y) {
//                         return { k: state.currentPosition.k, x: state.currentPosition.x, y: state.currentPosition.y };
//                     }
//                     return prev;
//                 });
//             }
//         }
//     }, []);

//     const handleSectionActionRequest = useCallback((websiteId: string, sectionInfo: { id: string; tagName: string; outerHTML: string; }, actionType: 'regenerate-section') => { if (actionType === 'regenerate-section') { setRegenerateModal({ isOpen: true, websiteId, sectionInfo }); setEditContentModal(p => ({ ...p, isOpen: false })); setAskAIModal(p => ({ ...p, isOpen: false })); } }, []);
//     const handleContentActionRequest = useCallback((websiteId: string, contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => { if (actionType === 'edit-content') { setEditContentValue(contentInfo.textContent || ''); setEditContentModal({ isOpen: true, websiteId, contentInfo }); setRegenerateModal(p => ({ ...p, isOpen: false })); setAskAIModal(p => ({ ...p, isOpen: false })); } else if (actionType === 'ask-ai') { setAskAIModal({ isOpen: true, websiteId, contentInfo }); setRegenerateModal(p => ({ ...p, isOpen: false })); setEditContentModal(p => ({ ...p, isOpen: false })); } }, []);

//     const closeRegenerateModal = () => setRegenerateModal({ isOpen: false, websiteId: null, sectionInfo: null });
//     const closeEditContentModal = () => { setEditContentModal({ isOpen: false, websiteId: null, contentInfo: null }); setEditContentValue(''); };
//     const closeAskAIModal = () => setAskAIModal({ isOpen: false, websiteId: null, contentInfo: null });

//     const submitRegenerateSection = async (prompt: string) => { if (!regenerateModal.websiteId || !regenerateModal.sectionInfo || !prompt) return; setIsUpdatingContent(true); setError(null); try { const response = await fetch(`${API_BASE_URL}/api/regenerate-section`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website_id: regenerateModal.websiteId, section_id: regenerateModal.sectionInfo.id, current_html: regenerateModal.sectionInfo.outerHTML, prompt: prompt, }), }); if (!response.ok) { const e = await response.text(); throw new Error(`API ${response.status}: ${e}`); } const data = await response.json(); setGeneratedWebsites(prev => prev.map(site => { if (site.id === regenerateModal.websiteId) { const oldHtml = regenerateModal.sectionInfo?.outerHTML; if (oldHtml && site.htmlContent.includes(oldHtml) && data.newSectionHtml) return { ...site, htmlContent: site.htmlContent.replace(oldHtml, data.newSectionHtml) }; else { console.warn("Regen: Old HTML not found."); return site; } } return site; })); } catch (err: any) { setError(`Regen failed: ${err.message}`); } finally { setIsUpdatingContent(false); closeRegenerateModal(); } };
//     const submitEditContent = (newContent: string) => { if (!editContentModal.websiteId || !editContentModal.contentInfo) return; const { websiteId, contentInfo } = editContentModal; const oldOuterHtml = contentInfo.outerHTML; setIsUpdatingContent(true); setError(null); try { const parser = new DOMParser(); const doc = parser.parseFromString(oldOuterHtml, 'text/html'); const elementToModify = doc.body.firstChild as HTMLElement; if (!elementToModify || elementToModify.nodeType !== Node.ELEMENT_NODE) throw new Error("Parse fail."); elementToModify.textContent = newContent; const newOuterHtml = elementToModify.outerHTML; setGeneratedWebsites(prev => prev.map(site => { if (site.id === websiteId) { if (site.htmlContent.includes(oldOuterHtml)) { const updatedHtml = site.htmlContent.replace(oldOuterHtml, newOuterHtml); return { ...site, htmlContent: updatedHtml }; } else { console.warn("Edit: Old HTML not found."); setError("Update failed: Content mismatch."); return site; } } return site; })); } catch (err: any) { setError(`Update failed: ${err.message}`); } finally { setIsUpdatingContent(false); closeEditContentModal(); } };

//     // Updated submitAskAI function to properly call the regenerate-text endpoint
//     const submitAskAI = async (aiAction: string) => { 
//         if (!askAIModal.websiteId || !askAIModal.contentInfo) return; 
//         setIsUpdatingContent(true); 
//         setError(null); 
        
//         try { 
//             // Call the regenerate-text endpoint
//             const response = await fetch(`${API_BASE_URL}/api/regenerate-text`, { 
//                 method: 'POST', 
//                 headers: { 'Content-Type': 'application/json' }, 
//                 body: JSON.stringify({ 
//                     text: askAIModal.contentInfo.outerHTML, 
//                     action: aiAction, 
//                 }), 
//             }); 
            
//             if (!response.ok) { 
//                 const e = await response.text(); 
//                 throw new Error(`API ${response.status}: ${e}`); 
//             } 
            
//             const data = await response.json(); 
            
//             // Check if we got processed_text in the response
//             if (!data.processed_text) {
//                 throw new Error("API returned no processed text");
//             }
            
//             // Update the website content with the regenerated text
//             setGeneratedWebsites(prev => prev.map(site => { 
//                 if (site.id === askAIModal.websiteId) { 
//                     const oldHtml = askAIModal.contentInfo?.outerHTML; 
//                     if (oldHtml && site.htmlContent.includes(oldHtml)) {
//                         // Create a new HTML element to properly format the response
//                         const parser = new DOMParser();
//                         const doc = parser.parseFromString(oldHtml, 'text/html');
//                         const elementToUpdate = doc.body.firstChild as HTMLElement;
                        
//                         if (elementToUpdate && elementToUpdate.nodeType === Node.ELEMENT_NODE) {
//                             // Update the content
//                             elementToUpdate.textContent = data.processed_text;
//                             const updatedElementHtml = elementToUpdate.outerHTML;
                            
//                             // Replace the old HTML with the updated HTML
//                             return { 
//                                 ...site, 
//                                 htmlContent: site.htmlContent.replace(oldHtml, updatedElementHtml) 
//                             };
//                         } else {
//                             console.warn("AI: Could not parse element.");
//                             return site;
//                         }
//                     } else { 
//                         console.warn("AI: Old HTML not found."); 
//                         return site; 
//                     } 
//                 } 
//                 return site; 
//             })); 
//         } catch (err: any) { 
//             setError(`AI failed: ${err.message}`); 
//             console.error("AI Error:", err);
//         } finally { 
//             setIsUpdatingContent(false); 
//             closeAskAIModal(); 
//         } 
//     };

//     // --- Render ---
//     return (
//         <div className="flex h-screen overflow-hidden bg-gray-100">
//             {/* Correct component name */}
//             <SideNavbar onGenerate={handleGenerateWebsite} isLoading={isLoading} error={error} />
//             <main className="flex-grow relative overflow-hidden">
//                 <ReactInfiniteCanvas
//                     ref={canvasRef}
//                     minZoom={0.05} maxZoom={4} panOnScroll
//                     className="w-full h-full cursor-grab active:cursor-grabbing bg-dots"
//                     // *** Use onZoom prop ***
//                     onZoom={handleCanvasZoom}
//                 >
//                     <div className="canvas-content" ref={canvasContentRef}>
//                         {generatedWebsites.map((website) => (
//                             <div
//                                 key={website.id}
//                                 style={{
//                                     position: 'absolute',
//                                     left: website.position.x,
//                                     top: website.position.y,
//                                     boxShadow: activeWebsiteId === website.id ? '0 0 0 3px rgba(99, 102, 241, 0.6)' : 'none',
//                                     transition: 'box-shadow 0.2s ease-in-out',
//                                     borderRadius: '10px',
//                                 }}
//                                 onClick={(e: React.MouseEvent<HTMLDivElement>) => {
//                                     e.stopPropagation();
//                                     handleSetActiveWebsite(website.id);
//                                 }}
//                             >
//                                 <WireframeRenderer
//                                     key={website.id + '-renderer'}
//                                     title={website.title}
//                                     htmlContent={website.htmlContent}
//                                     wireframePosition={website.position}
//                                     canvasTransform={canvasTransform}
//                                     canvasContentRef={canvasContentRef}
//                                     onDelete={() => handleDeleteWebsite(website.id)}
//                                     onSectionActionRequest={(sI: { id: string; tagName: string; outerHTML: string }, aT: 'regenerate-section') =>
//                                         handleSectionActionRequest(website.id, sI, aT)
//                                     }
//                                     onContentActionRequest={(cI: ContentHighlightInfo & { element: HTMLElement }, aT: ContentActionType) =>
//                                         handleContentActionRequest(website.id, cI, aT)
//                                     }
//                                 />
//                             </div>
//                         ))}
//                         {generatedWebsites.length === 0 && !isLoading && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><p className="text-gray-400 text-lg italic">Use sidebar to generate design.</p></div>}
//                     </div>
//                 </ReactInfiniteCanvas>
//                 {/* Loading Overlays */}
//                 {isLoading && !isUpdatingContent && <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm flex justify-center items-center z-40 pointer-events-none"><div className="flex flex-col items-center text-white bg-gray-800/80 p-6 rounded-lg shadow-xl"><Loader2 className="animate-spin h-10 w-10 mb-3" /><p>Generating...</p></div></div>}
//                 {isUpdatingContent && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex justify-center items-center z-40 pointer-events-none"><div className="flex items-center space-x-3 text-indigo-700 bg-indigo-50 p-4 rounded-lg shadow-md border border-indigo-200"><Loader2 className="animate-spin h-5 w-5" /><p className="font-medium text-sm">Updating...</p></div></div>}
//                 {/* *** REMOVED Selected Elements Panel *** */}
//             </main>
            
//             {regenerateModal.isOpen && <Modal title={`Regenerate Section (#${regenerateModal.sectionInfo?.id})`} onClose={closeRegenerateModal}><p className="text-sm text-gray-600 mb-3">Describe changes:</p><textarea placeholder="e.g., Make this section about our team..." className="w-full p-2 border rounded mb-4 text-sm min-h-[60px]" id="regenerate-prompt-textarea" /><button onClick={() => submitRegenerateSection((document.getElementById('regenerate-prompt-textarea') as HTMLTextAreaElement)?.value || '')} disabled={isUpdatingContent} className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center">{isUpdatingContent ? <Loader2 size={16} className="animate-spin mr-2" /> : <Star size={14} className="mr-2" />}Regenerate</button></Modal>}
//             {editContentModal.isOpen && editContentModal.contentInfo?.tagName !== 'img' && <Modal title={`Edit Content (<${editContentModal.contentInfo?.tagName}>)`} onClose={closeEditContentModal}><p className="text-sm text-gray-600 mb-3">Modify text:</p><textarea value={editContentValue} onChange={(e) => setEditContentValue(e.target.value)} className="w-full p-2 border rounded mb-4 text-sm min-h-[100px]" id="edit-content-textarea" /><button onClick={() => submitEditContent(editContentValue)} disabled={isUpdatingContent} className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center">{isUpdatingContent ? <Loader2 size={16} className="animate-spin mr-2" /> : <Pencil size={14} className="mr-2" />}Save Changes</button></Modal>}
//             {askAIModal.isOpen && <Modal title="Ask AI" onClose={closeAskAIModal}><p className="text-sm text-gray-600 mb-3">Choose AI action:</p><div className="text-xs p-2 border bg-gray-50 rounded mb-4 max-h-24 overflow-auto custom-scrollbar">{askAIModal.contentInfo?.tagName === 'img' ? <img src={askAIModal.contentInfo.src || ''} alt="Selected" className="max-h-20 mx-auto" /> : <p className="italic">"{askAIModal.contentInfo?.textContent?.substring(0, 150)}{askAIModal.contentInfo?.textContent && askAIModal.contentInfo.textContent.length > 150 ? '...' : ''}"</p>}</div><div className="space-y-2">{(['Summarize', 'Make Shorter', 'Make Longer', 'Improve Writing', 'Change Tone (Professional)', 'Change Tone (Casual)']).filter(a => askAIModal.contentInfo?.tagName !== 'img' || !['Make Shorter', 'Make Longer'].includes(a)).map(action => (<button key={action} onClick={() => submitAskAI(action)} disabled={isUpdatingContent} className="w-full text-left text-sm px-3 py-2 border rounded hover:bg-sky-50 hover:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50">{action}</button>))}</div>{isUpdatingContent && <div className="mt-3 flex items-center justify-center text-sm text-sky-600"><Loader2 size={16} className="animate-spin mr-2" /> Processing...</div>}</Modal>}
//         </div>
//     );
// };

// // --- Simple Reusable Modal Component ---
// interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string; }
// const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth = 'max-w-md' }) => (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1050] flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
//         <div className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} overflow-hidden`} onClick={(e) => e.stopPropagation()}>
//             <div className="flex items-center justify-between p-4 border-b"><h2 className="text-lg font-semibold text-gray-800">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" aria-label="Close"><X size={20} /></button></div>
//             <div className="p-6">{children}</div>
//         </div>
//     </div>
// );

// export default CanvasApp;