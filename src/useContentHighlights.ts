// hooks/useContentHighlight.ts
import React, { useState, useEffect, useCallback, useRef, RefObject } from 'react';

// Define transform state structure
interface CanvasTransformState { k: number; x: number; y: number; }

export interface ContentHighlightInfo { element: HTMLElement; tagName: string; outerHTML: string; textContent: string | null; src: string | null; }
export type ContentActionType = 'edit-content' | 'ask-ai';

interface UseContentHighlightProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    canvasTransform: CanvasTransformState;
    wireframePosition: { x: number; y: number };
    onContentAction: (contentInfo: { tagName: string; outerHTML: string; textContent: string | null; src: string | null; element: HTMLElement; }, actionType: ContentActionType) => void;
    onContentSelect: (element: HTMLElement | null) => void; // <-- Callback for selection
    isContentHighlightActive: boolean;
}

interface UseContentHighlightReturn { hoveredContent: ContentHighlightInfo | null; handleContentButtonEnter: () => void; handleContentButtonLeave: () => void; getContentButtonPosition: (content: ContentHighlightInfo | null) => React.CSSProperties; handleContentActionClick: (content: ContentHighlightInfo | null, action: ContentActionType) => void; }

const HOVER_TIMEOUT_DURATION = 250;
const CONTENT_SELECTORS = 'p, h1, h2, h3, h4, h5, h6, img, span, strong, em, b, i, li, blockquote, td, th';

const useContentHighlight = ({
    iframeRef,
    canvasTransform,
    wireframePosition,
    onContentAction,
    onContentSelect, // <-- Destructure callback
    isContentHighlightActive,
}: UseContentHighlightProps): UseContentHighlightReturn => {
    const [hoveredContent, setHoveredContent] = useState<ContentHighlightInfo | null>(null);
    const [isContentButtonHovered, setIsContentButtonHovered] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const listenersRef = useRef<Array<{ element: HTMLElement; type: string; handler: EventListener }>>([]);

    const addHighlight = useCallback((element: HTMLElement | null) => {
        element?.classList.add('highlighted-content');
        element?.classList.remove('clicked-highlight');
    }, []);

    const removeHighlight = useCallback(() => {
        iframeRef.current?.contentDocument?.querySelectorAll('.highlighted-content')
            .forEach(el => {
                if (!el.classList.contains('clicked-highlight')) {
                    el.classList.remove('highlighted-content');
                }
            });
    }, [iframeRef]);

    const clearHoverTimeout = useCallback(() => { if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; } }, []);

    const handleElementEnter = useCallback((contentInfo: ContentHighlightInfo) => {
        clearHoverTimeout(); if (!isContentHighlightActive) return;
        if (hoveredContent?.element !== contentInfo.element) { removeHighlight(); }
        setHoveredContent(contentInfo);
        if (!contentInfo.element.classList.contains('clicked-highlight')) { addHighlight(contentInfo.element); }
        setIsContentButtonHovered(false);
    }, [isContentHighlightActive, addHighlight, removeHighlight, hoveredContent, clearHoverTimeout]);

    const handleElementLeave = useCallback(() => {
        if (!isContentHighlightActive) return; clearHoverTimeout();
        hoverTimeout.current = setTimeout(() => { if (!isContentButtonHovered) { removeHighlight(); setHoveredContent(null); } }, HOVER_TIMEOUT_DURATION);
    }, [isContentHighlightActive, removeHighlight, isContentButtonHovered, clearHoverTimeout]);

    const handleContentButtonEnter = useCallback(() => { if (!isContentHighlightActive) return; clearHoverTimeout(); setIsContentButtonHovered(true); }, [isContentHighlightActive, clearHoverTimeout]);
    const handleContentButtonLeave = useCallback(() => { if (!isContentHighlightActive) return; setIsContentButtonHovered(false); clearHoverTimeout(); hoverTimeout.current = setTimeout(() => { removeHighlight(); setHoveredContent(null); }, HOVER_TIMEOUT_DURATION); }, [isContentHighlightActive, removeHighlight, clearHoverTimeout]);
    const handleContentActionClick = useCallback((content: ContentHighlightInfo | null, action: ContentActionType) => { if (content && isContentHighlightActive) onContentAction({ tagName: content.tagName, outerHTML: content.outerHTML, textContent: content.textContent, src: content.src, element: content.element }, action); }, [onContentAction, isContentHighlightActive]);

    const attachListeners = useCallback(() => {
        if (!isContentHighlightActive || !iframeRef.current?.contentDocument) return () => {};
        const iframeDoc = iframeRef.current.contentDocument; const currentListeners = listenersRef.current;
        currentListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler)); currentListeners.length = 0;
        iframeDoc.querySelectorAll<HTMLElement>(CONTENT_SELECTORS).forEach((element) => {
            const text = element.textContent?.trim() || ''; const isImage = element.tagName === 'IMG'; const hasContent = isImage || text.length > 3; const rect = element.getBoundingClientRect();
            if (!hasContent || element.closest('[data-no-edit-content], button, a, svg') || rect.width < 5 || rect.height < 5) return;
            const contentInfo: ContentHighlightInfo = { element: element, tagName: element.tagName.toLowerCase(), outerHTML: element.outerHTML, textContent: isImage ? null : element.textContent, src: isImage ? (element as HTMLImageElement).src : null };

            const enterHandler: EventListener = (e) => { e.stopPropagation(); handleElementEnter(contentInfo); };
            const leaveHandler: EventListener = (e) => { e.stopPropagation(); handleElementLeave(); };
            const clickHandler: EventListener = (e) => { e.stopPropagation(); e.preventDefault(); onContentSelect(contentInfo.element); }; // Report selection element

            element.addEventListener('mouseover', enterHandler);
            element.addEventListener('mouseout', leaveHandler);
            element.addEventListener('click', clickHandler); // *** ADDED ***

            currentListeners.push({ element, type: 'mouseover', handler: enterHandler });
            currentListeners.push({ element, type: 'mouseout', handler: leaveHandler });
            currentListeners.push({ element, type: 'click', handler: clickHandler }); // *** ADDED ***
        });
        return () => {
            currentListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler));
            currentListeners.length = 0;
             iframeRef.current?.contentDocument?.querySelectorAll('.highlighted-content, .clicked-highlight').forEach(el => el.classList.remove('highlighted-content', 'clicked-highlight'));
        };
    }, [isContentHighlightActive, iframeRef, handleElementEnter, handleElementLeave, removeHighlight, onContentSelect]); // Added onContentSelect

    useEffect(() => { if (!isContentHighlightActive || !iframeRef.current) { listenersRef.current.forEach(({ element, type, handler }) => element.removeEventListener(type, handler)); listenersRef.current.length = 0; removeHighlight(); setHoveredContent(null); clearHoverTimeout(); return; } const iframe = iframeRef.current; let cleanup = () => {}; const init = () => { if (iframe.contentDocument?.body) { cleanup = attachListeners(); }}; if (iframe.contentDocument?.readyState === 'complete') init(); else { const loadHandler = () => { init(); iframe.removeEventListener('load', loadHandler); }; const readyStateHandler = () => { if (iframe.contentDocument?.readyState === 'complete') { init(); iframe.contentDocument.removeEventListener('readystatechange', readyStateHandler); } }; iframe.addEventListener('load', loadHandler); iframe.contentDocument?.addEventListener('readystatechange', readyStateHandler); return () => { iframe.removeEventListener('load', loadHandler); iframe.contentDocument?.removeEventListener('readystatechange', readyStateHandler); if (cleanup) cleanup(); }; } return () => { if (cleanup) cleanup(); clearHoverTimeout(); }; }, [isContentHighlightActive, iframeRef, attachListeners, removeHighlight, clearHoverTimeout]);
    useEffect(() => () => clearHoverTimeout(), [clearHoverTimeout]);

    const getContentButtonPosition = useCallback((content: ContentHighlightInfo | null): React.CSSProperties => {
        if (!content?.element || !iframeRef.current) return { display: 'none' };
        try {
            const elementRect = content.element.getBoundingClientRect();
            const scrollTop = iframeRef.current.contentWindow?.scrollY || 0; const scrollLeft = iframeRef.current.contentWindow?.scrollX || 0;
            const scale = canvasTransform.k; const canvasTranslateX = canvasTransform.x; const canvasTranslateY = canvasTransform.y;
            const buttonTopInIframe = elementRect.bottom + scrollTop + 8; const buttonLeftInIframe = elementRect.left + scrollLeft + elementRect.width / 2;
            const finalCanvasX = (wireframePosition.x + buttonLeftInIframe) * scale + canvasTranslateX; const finalCanvasY = (wireframePosition.y + buttonTopInIframe) * scale + canvasTranslateY;
            return { position: 'absolute', top: `${finalCanvasY}px`, left: `${finalCanvasX}px`, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'center top', pointerEvents: 'auto', zIndex: 1010, display: 'flex', gap: '8px' };
        } catch (e) { console.error("Err pos content btn:", e); return { display: 'none' }; }
    }, [iframeRef, canvasTransform, wireframePosition]);

    return { hoveredContent, handleContentButtonEnter, handleContentButtonLeave, getContentButtonPosition, handleContentActionClick };
};
export default useContentHighlight;