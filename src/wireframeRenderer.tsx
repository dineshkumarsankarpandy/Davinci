// components/wireframeRenderer.tsx
import React, { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { Pencil, ArrowLeftRight, Star, Grab, Trash2, Target, Bot, Edit3 } from 'lucide-react';
import useSectionHighlight from './useSectionHighlight'; // Adjust path
import useContentHighlight, { ContentHighlightInfo, ContentActionType } from './useContentHighlights'; 
import { createPortal } from 'react-dom';
import { SectionInfo } from './types/type';

interface CanvasTransformState { k: number; x: number; y: number; }

// --- Prop Interface ---
interface WireframeRendererProps {
    title: string;
    htmlContent: string;
    wireframePosition: { x: number; y: number };
    canvasTransform: CanvasTransformState;
    canvasContentRef: RefObject<HTMLDivElement | null>;
    initialWidth?: number; 
    onDelete?: () => void;
    onSectionActionRequest?: (sectionInfo: SectionInfo, actionType: 'regenerate-section') => void;
    onContentActionRequest?: (contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => void;
    onSizeChange: (width: number, height: number) => void; // Required callback
}

// --- Constants ---
const DEFAULT_WIDTH = 1440;
const MIN_HEIGHT = 300;
const FONT_LINK_ID = 'custom-font-link';
const availableFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat','Winky Rough','Bungee Spice'];

const ToolbarButton: React.FC<{
    icon: React.ElementType, label?: string, tooltip: string, onClick?: () => void, className?: string, active?: boolean
}> = ({ icon: Icon, label, tooltip, onClick, className = '', active = false }) => (
    <button onClick={onClick} title={tooltip} className={`flex items-center justify-center border rounded-md transition-colors duration-150 ${active ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300 shadow-inner' : 'border-gray-300 hover:bg-gray-100 bg-white text-gray-700 hover:border-gray-400'} ${label ? 'px-3 py-1.5 h-8 text-xs' : 'w-8 h-8'} ${className}`}>
        <Icon size={label ? 14 : 16} strokeWidth={1.75} className={`${label ? "mr-1.5" : ""} flex-shrink-0`} />
        {label && <span className="font-medium whitespace-nowrap">{label}</span>}
    </button>
);

// --- Main Component ---
const WireframeRenderer: React.FC<WireframeRendererProps> = ({
    title,
    htmlContent,
    wireframePosition,
    canvasTransform,
    canvasContentRef,
    initialWidth = DEFAULT_WIDTH, 
    onDelete,
    onSectionActionRequest,
    onContentActionRequest,
    onSizeChange,
}) => {
    // --- Refs and State ---
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(MIN_HEIGHT);
    const [iframeWidth, setIframeWidth] = useState<number>(initialWidth);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    type InteractionMode = 'none' | 'section' | 'content';
    const [currentMode, setCurrentMode] = useState<InteractionMode>('none');
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [selectedContentElement, setSelectedContentElement] = useState<HTMLElement | null>(null);
    const [selectedFont, setSelectedFont] = useState<string | null>(null);

    // --- Update internal width if prop changes ---
    useEffect(() => {
        if (initialWidth !== iframeWidth) {
            setIframeWidth(initialWidth);
            onSizeChange(initialWidth, iframeHeight);
        }
    }, [initialWidth]);

    // --- Selection Callbacks ---
    const handleSectionSelect = useCallback((sectionId: string | null) => {
        setSelectedSectionId(prevId => prevId === sectionId ? null : sectionId);
        setSelectedContentElement(null); 
    }, []);

    const handleContentSelect = useCallback((element: HTMLElement | null) => {
        setSelectedContentElement(prevEl => prevEl === element ? null : element);
        setSelectedSectionId(null);
    }, []);

    // --- Action Callbacks for Hooks ---
    const handleSectionAction = useCallback((sectionInfo: SectionInfo, actionType: 'regenerate-section') => {
        onSectionActionRequest?.(sectionInfo, actionType);
    }, [onSectionActionRequest]);

    const handleContentAction = useCallback((contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => {
        onContentActionRequest?.(contentInfo, actionType);
    }, [onContentActionRequest]);

    // --- Instantiate Hooks ---
    const {
        hoveredSection, handleSectionButtonEnter, handleSectionButtonLeave,
        getSectionButtonPosition, handleSectionButtonClick,
    } = useSectionHighlight({
        iframeRef, canvasTransform, wireframePosition,
        onSectionAction: handleSectionAction,
        onSectionSelect: handleSectionSelect,
        isSectionHighlightActive: currentMode === 'section'
    });
    const {
        hoveredContent, handleContentButtonEnter, handleContentButtonLeave,
        getContentButtonPosition, handleContentActionClick,
    } = useContentHighlight({
        iframeRef, canvasTransform, wireframePosition,
        onContentAction: handleContentAction,
        onContentSelect: handleContentSelect,
        isContentHighlightActive: currentMode === 'content'
    });

    // --- Apply Font Function ---
    const applyFont = useCallback(() => {
        if (iframeRef.current?.contentDocument) {
            const iframeDoc = iframeRef.current.contentDocument;
            const existingLink = iframeDoc.getElementById(FONT_LINK_ID);
            if (existingLink) {
                existingLink.remove();
            }
            if (selectedFont) {
                const link = iframeDoc.createElement('link');
                link.id = FONT_LINK_ID;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(' ', '+')}&display=swap`;
                iframeDoc.head.appendChild(link);
                iframeDoc.body.style.fontFamily = `'${selectedFont}', sans-serif`;
            } else {
                iframeDoc.body.style.removeProperty('font-family');
            }
        }
    }, [selectedFont]);

    // --- Effects ---
    // Iframe load and style injection effect
    useEffect(() => {
        const iframe = iframeRef.current; if (!iframe) return;
        setIsLoading(true);
        let isMounted = true;
        setSelectedSectionId(null);
        setSelectedContentElement(null); 
        const handleLoad = () => {
            if (!isMounted || !iframe) return;
            requestAnimationFrame(() => { 
                if (!isMounted || !iframeRef.current) return;
                const currentIframe = iframeRef.current;
                try {
                    const iframeDoc = currentIframe.contentDocument;
                    const body = iframeDoc?.body;
                    const htmlEl = iframeDoc?.documentElement;

                    if (iframeDoc && body && htmlEl) {
                        // Basic styles
                        htmlEl.style.overflow = 'hidden'; htmlEl.style.height = 'auto';
                        body.style.overflow = 'hidden'; body.style.height = 'auto'; body.style.margin = '0';

                        // *** ADD Data Attributes for Content Selection ***
                        let contentCounter = 0;
                        body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, li, img, strong, em, blockquote').forEach(el => {
                            if (el instanceof HTMLElement && !el.closest('script') && !el.closest('style')) {
                                if (!el.dataset.contentId) {
                                    el.dataset.contentId = `content-${Date.now()}-${contentCounter++}`;
                                }
                                if (el.tagName === 'IMG') {
                                    (el as HTMLImageElement).draggable = false;
                                }
                            }
                        });

                        // Calculate height
                        const scrollHeight = Math.max(body.scrollHeight, htmlEl.scrollHeight, MIN_HEIGHT);
                        const currentWidth = currentIframe.offsetWidth;

                        setIframeHeight(scrollHeight);
                        onSizeChange(currentWidth, scrollHeight);

                        const styleId = 'wireframe-interaction-styles';
                        let styleEl = iframeDoc.getElementById(styleId) as HTMLStyleElement | null;
                        if (!styleEl) { styleEl = iframeDoc.createElement('style'); styleEl.id = styleId; iframeDoc.head.appendChild(styleEl); }
                        const cssContent = `...`; 
                        if (styleEl.textContent !== cssContent) styleEl.textContent = cssContent;

                        setIsLoading(false);
                        applyFont(); // Apply the selected font after iframe setup
                    } else {
                        console.warn("Iframe body or html element not found during load.");
                        setIsLoading(false);
                        onSizeChange(iframeWidth, MIN_HEIGHT);
                    }
                } catch (e) {
                    console.error("Error during iframe load handling:", e);
                    setIsLoading(false);
                    onSizeChange(iframeWidth, MIN_HEIGHT);
                }
            });
        };

        // --- Initial Setup ---
        onSizeChange(iframeWidth, MIN_HEIGHT);
        setIframeHeight(MIN_HEIGHT);

        iframe.addEventListener('load', handleLoad);
        iframe.srcdoc = htmlContent || "<!DOCTYPE html><html><head><title>Empty</title></head><body><p>No content</p></body></html>";

        return () => {
            isMounted = false;
            iframe?.removeEventListener('load', handleLoad);
        };
    }, [htmlContent]);

    // Apply font when selectedFont changes
    useEffect(() => {
        applyFont();
    }, [applyFont]);

    // Apply/remove .clicked-highlight class
    useEffect(() => {
        if (!iframeRef.current?.contentDocument || isLoading) return;
        const iframeDoc = iframeRef.current.contentDocument;
        const CLICKED_CLASS = 'clicked-highlight';
        // ... clear previous highlights ...

        let elementToHighlight: HTMLElement | null = null;

        if (selectedSectionId && currentMode === 'section') {
            elementToHighlight = iframeDoc.getElementById(selectedSectionId);
        } else if (selectedContentElement && currentMode === 'content') {
            const contentId = selectedContentElement.dataset.contentId;
            if (contentId) {
                elementToHighlight = iframeDoc.querySelector(`[data-content-id="${contentId}"]`);
            }
            if (!elementToHighlight && iframeDoc.body.contains(selectedContentElement)) {
                elementToHighlight = selectedContentElement;
            }
        }

        if (elementToHighlight) {
            elementToHighlight.classList.add(CLICKED_CLASS);
            // ... remove hover classes ...
        }
    }, [selectedSectionId, selectedContentElement, currentMode, isLoading, htmlContent]);

    // --- Mode Toggling Logic ---
    const toggleMode = (modeToSet: InteractionMode) => {
        setCurrentMode(prevMode => {
            const nextMode = prevMode === modeToSet ? 'none' : modeToSet;
            setSelectedSectionId(null);
            setSelectedContentElement(null);
            return nextMode;
        });
    };

    // --- Resize Handler ---
    const handleResizeToggle = useCallback(() => {
        const newWidth = iframeWidth === DEFAULT_WIDTH ? 390 : DEFAULT_WIDTH;
        setIframeWidth(newWidth);
        onSizeChange(newWidth, iframeHeight);
    }, [iframeWidth, iframeHeight, onSizeChange]);

    // --- Render ---
    const portalTarget = canvasContentRef.current;

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ width: `${iframeWidth}px`, position: 'relative', transition: 'width 0.3s ease-in-out' }}>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 min-h-[44px] sticky top-0 z-20">
                    <div className="flex items-center gap-2 flex-grow mr-4 min-w-0">
                        <Grab size={16} className="text-gray-400 cursor-grab flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-700 truncate" title={title}>{title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ToolbarButton icon={Target} label="Section" tooltip={currentMode === 'section' ? "Disable Section Actions" : "Enable Section Actions"} onClick={() => toggleMode('section')} active={currentMode === 'section'} />
                        <ToolbarButton icon={Edit3} label="Content" tooltip={currentMode === 'content' ? "Disable Content Actions" : "Enable Content Actions"} onClick={() => toggleMode('content')} active={currentMode === 'content'} />
                        {/* Font Selection Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedFont || ''}
                                onChange={(e) => setSelectedFont(e.target.value || null)}
                                className="appearance-none bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Default Font</option>
                                {availableFonts.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <ToolbarButton icon={ArrowLeftRight} tooltip={`Resize (${iframeWidth === DEFAULT_WIDTH ? 'Mobile' : 'Desktop'})`} onClick={handleResizeToggle} />
                        {onDelete && <ToolbarButton icon={Trash2} tooltip="Delete Wireframe" onClick={onDelete} className="hover:bg-red-100 hover:text-red-700 hover:border-red-300" />}
                    </div>
                </div>
                <div className="relative preview-element border-t-0 overflow-hidden" style={{ height: `${iframeHeight}px`, width: '100%', transition: 'height 0.2s ease-out' }}>
                    <iframe
                        ref={iframeRef}
                        title={`preview-${title}`}
                        sandbox="allow-scripts allow-same-origin"
                        scrolling="no"
                        className="block w-full h-full border-none"
                        style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }}
                        width={iframeWidth}
                        height={iframeHeight}
                    />
                    {isLoading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div></div>}
                    {!isLoading && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 pointer-events-none opacity-80">
                            {currentMode === 'section' && <span className={`px-3 py-1 rounded-full text-[11px] shadow transition-colors ${selectedSectionId ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>{selectedSectionId ? 'Section Selected' : 'Select Section'}</span>}
                            {currentMode === 'content' && <span className={`px-3 py-1 rounded-full text-[11px] shadow transition-colors ${selectedContentElement ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{selectedContentElement ? 'Content Selected' : 'Select Content'}</span>}
                        </div>
                    )}
                </div>
            </div>

            {portalTarget && createPortal((hoveredSection && !selectedSectionId && currentMode === 'section' && !isLoading) &&
                <div style={getSectionButtonPosition(hoveredSection)} className="absolute z-50 interaction-button-portal" onMouseEnter={handleSectionButtonEnter} onMouseLeave={handleSectionButtonLeave}>
                    <button onClick={(e) => { e.stopPropagation(); handleSectionButtonClick(hoveredSection); }} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out transform hover:scale-105 whitespace-nowrap"><Star size={12} className="mr-1.5 fill-current" />Regenerate Section</button>
                </div>, portalTarget)}
            {portalTarget && createPortal((hoveredContent && !selectedContentElement && currentMode === 'content' && !isLoading) &&
                <div style={getContentButtonPosition(hoveredContent)} className="absolute z-50 flex items-center space-x-2 interaction-button-portal" onMouseEnter={handleContentButtonEnter} onMouseLeave={handleContentButtonLeave}>
                    {hoveredContent.tagName !== 'img' && <button onClick={(e) => { e.stopPropagation(); handleContentActionClick(hoveredContent, 'edit-content'); }} className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out transform hover:scale-105 whitespace-nowrap"><Pencil size={12} className="mr-1.5" />Edit Content</button>}
                    <button onClick={(e) => { e.stopPropagation(); handleContentActionClick(hoveredContent, 'ask-ai'); }} className="flex items-center px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 ease-in-out transform hover:scale-105 whitespace-nowrap"><Bot size={12} className="mr-1.5" />Ask AI</button>
                </div>, portalTarget)}
        </>
    );
};

export default WireframeRenderer;