// hooks/useSectionHighlight.ts
import React, { useState, useEffect, useCallback, useRef, RefObject } from 'react';

// Define transform state structure
interface CanvasTransformState { k: number; x: number; y: number; }

export interface SectionHighlightInfo {
    type: string;
    id: string;
    element: HTMLElement;
    tagName: string;
    outerHTML: string;
}

interface UseSectionHighlightProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    canvasTransform: CanvasTransformState;
    wireframePosition: { x: number; y: number };
    onSectionAction: (sectionInfo: { id: string; tagName: string; outerHTML: string; }, actionType: 'regenerate-section') => void;
    onSectionSelect: (sectionId: string | null) => void; // <-- Callback for selection
    isSectionHighlightActive: boolean;
}

interface UseSectionHighlightReturn {
    hoveredSection: SectionHighlightInfo | null;
    handleSectionButtonEnter: () => void;
    handleSectionButtonLeave: () => void;
    getSectionButtonPosition: (section: SectionHighlightInfo | null) => React.CSSProperties;
    handleSectionButtonClick: (section: SectionHighlightInfo | null) => void;
}

const HOVER_TIMEOUT_DURATION = 250; // ms

const useSectionHighlight = ({
    iframeRef,
    canvasTransform,
    wireframePosition,
    onSectionAction,
    onSectionSelect, // <-- Destructure callback
    isSectionHighlightActive,
}: UseSectionHighlightProps): UseSectionHighlightReturn => {
    const [hoveredSection, setHoveredSection] = useState<SectionHighlightInfo | null>(null);
    const [isSectionButtonHovered, setIsSectionButtonHovered] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const listenersRef = useRef<Array<{ element: HTMLElement; type: string; handler: EventListener }>>([]);

    const addHighlight = useCallback((element: HTMLElement | null) => {
        element?.classList.add('highlighted-section');
        element?.classList.remove('clicked-highlight');
    }, []);

    const removeHighlight = useCallback(() => {
        iframeRef.current?.contentDocument?.querySelectorAll('.highlighted-section')
            .forEach(el => {
                if (!el.classList.contains('clicked-highlight')) {
                    el.classList.remove('highlighted-section');
                }
            });
    }, [iframeRef]);

    const clearHoverTimeout = useCallback(() => { if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; } }, []);

    const handleElementEnter = useCallback((section: SectionHighlightInfo) => {
        clearHoverTimeout();
        if (!isSectionHighlightActive) return;
        if(hoveredSection?.element !== section.element){ removeHighlight(); }
        setHoveredSection(section);
        if (!section.element.classList.contains('clicked-highlight')) { addHighlight(section.element); }
        setIsSectionButtonHovered(false);
    }, [isSectionHighlightActive, addHighlight, removeHighlight, hoveredSection, clearHoverTimeout]);

    const handleElementLeave = useCallback(() => {
        if (!isSectionHighlightActive) return;
        clearHoverTimeout();
        hoverTimeout.current = setTimeout(() => {
            if (!isSectionButtonHovered) { removeHighlight(); setHoveredSection(null); }
        }, HOVER_TIMEOUT_DURATION);
    }, [isSectionHighlightActive, removeHighlight, isSectionButtonHovered, clearHoverTimeout]);

    const handleSectionButtonEnter = useCallback(() => { if (!isSectionHighlightActive) return; clearHoverTimeout(); setIsSectionButtonHovered(true); }, [isSectionHighlightActive, clearHoverTimeout]);
    const handleSectionButtonLeave = useCallback(() => { if (!isSectionHighlightActive) return; setIsSectionButtonHovered(false); clearHoverTimeout(); hoverTimeout.current = setTimeout(() => { removeHighlight(); setHoveredSection(null); }, HOVER_TIMEOUT_DURATION); }, [isSectionHighlightActive, removeHighlight, clearHoverTimeout]);
    const handleSectionButtonClick = useCallback((section: SectionHighlightInfo | null) => { if (section && isSectionHighlightActive) onSectionAction({ id: section.id, tagName: section.tagName, outerHTML: section.outerHTML }, 'regenerate-section'); }, [onSectionAction, isSectionHighlightActive]);

    const attachListeners = useCallback(() => {
        if (!isSectionHighlightActive || !iframeRef.current?.contentDocument) return () => { };
        const iframeDoc = iframeRef.current.contentDocument;
        const currentListeners = listenersRef.current;
        currentListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler));
        currentListeners.length = 0;

        iframeDoc.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10 || element.closest('[data-no-edit-section]')) return;
            const sectionInfo: SectionHighlightInfo = { type: 'id', id: element.id, element: element, tagName: element.tagName.toLowerCase(), outerHTML: element.outerHTML };
            const enterHandler: EventListener = (e) => { e.stopPropagation(); handleElementEnter(sectionInfo); };
            const leaveHandler: EventListener = (e) => { e.stopPropagation(); handleElementLeave(); };
            const clickHandler: EventListener = (e) => { e.stopPropagation(); e.preventDefault(); onSectionSelect(sectionInfo.id); };

            element.addEventListener('mouseover', enterHandler);
            element.addEventListener('mouseout', leaveHandler);
            element.addEventListener('click', clickHandler);

            currentListeners.push({ element, type: 'mouseover', handler: enterHandler });
            currentListeners.push({ element, type: 'mouseout', handler: leaveHandler });
            currentListeners.push({ element, type: 'click', handler: clickHandler });
        });
        return () => {
            currentListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler));
            currentListeners.length = 0;
             iframeRef.current?.contentDocument?.querySelectorAll('.highlighted-section, .clicked-highlight').forEach(el => el.classList.remove('highlighted-section', 'clicked-highlight'));
        };
    }, [isSectionHighlightActive, iframeRef, handleElementEnter, handleElementLeave, removeHighlight, onSectionSelect]);

    useEffect(() => {
        if (!isSectionHighlightActive || !iframeRef.current) {
            listenersRef.current.forEach(({ element, type, handler }) => element.removeEventListener(type, handler)); listenersRef.current.length = 0;
            iframeRef.current?.contentDocument?.querySelectorAll('.highlighted-section, .clicked-highlight').forEach(el => el.classList.remove('highlighted-section', 'clicked-highlight'));
            setHoveredSection(null); clearHoverTimeout(); return;
        }
        const iframe = iframeRef.current; let cleanup = () => {};
        const init = () => { if (iframe.contentDocument?.body) { cleanup = attachListeners(); }};
        if (iframe.contentDocument?.readyState === 'complete') init();
        else {
            const loadHandler = () => { init(); iframe.removeEventListener('load', loadHandler); };
            const readyStateHandler = () => { if (iframe.contentDocument?.readyState === 'complete') { init(); iframe.contentDocument.removeEventListener('readystatechange', readyStateHandler); } };
            iframe.addEventListener('load', loadHandler); iframe.contentDocument?.addEventListener('readystatechange', readyStateHandler);
            return () => { iframe.removeEventListener('load', loadHandler); iframe.contentDocument?.removeEventListener('readystatechange', readyStateHandler); if (cleanup) cleanup(); };
        }
        return () => { if (cleanup) cleanup(); clearHoverTimeout(); };
    }, [isSectionHighlightActive, iframeRef, attachListeners, removeHighlight, clearHoverTimeout]);

    useEffect(() => () => clearHoverTimeout(), [clearHoverTimeout]);

    const getSectionButtonPosition = useCallback((section: SectionHighlightInfo | null): React.CSSProperties => {
            if (!section?.element || !iframeRef.current) return { display: 'none' };
            try {
                const elementRect = section.element.getBoundingClientRect();
                const scrollTop = iframeRef.current.contentWindow?.scrollY || 0; const scrollLeft = iframeRef.current.contentWindow?.scrollX || 0;
                const scale = canvasTransform.k; const canvasTranslateX = canvasTransform.x; const canvasTranslateY = canvasTransform.y;
                const buttonTopInIframe = elementRect.bottom + scrollTop + 8; const buttonLeftInIframe = elementRect.left + scrollLeft + elementRect.width / 2;
                const finalCanvasX = (wireframePosition.x + buttonLeftInIframe) * scale + canvasTranslateX; const finalCanvasY = (wireframePosition.y + buttonTopInIframe) * scale + canvasTranslateY;
                return { position: 'absolute', top: `${finalCanvasY}px`, left: `${finalCanvasX}px`, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'center top', pointerEvents: 'auto', zIndex: 1010, display: 'block', whiteSpace: 'nowrap' };
            } catch (e) { console.error("Err pos section btn:", e); return { display: 'none' }; }
        }, [iframeRef, canvasTransform, wireframePosition]);

    return { hoveredSection, handleSectionButtonEnter, handleSectionButtonLeave, getSectionButtonPosition, handleSectionButtonClick };
};
export default useSectionHighlight;