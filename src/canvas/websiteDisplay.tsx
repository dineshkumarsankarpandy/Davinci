import React, { RefObject, useState, useCallback } from 'react';
import WireframeRenderer from '../wireframeRenderer';
import { WebsiteData, CanvasTransformState, SectionInfo } from '../types/type';
import { ContentHighlightInfo, ContentActionType } from '../useContentHighlights';
import { FileText, Copy } from 'lucide-react';
import { EventBlocker } from 'react-infinite-canvas'; 

interface WebsiteDisplayProps {
    website: WebsiteData;
    isActive: boolean;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void;
    onSectionAction: (websiteId: string, sectionInfo: SectionInfo, actionType: 'regenerate-section') => void;
    onContentAction: (websiteId: string, contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => void;
    canvasTransform: CanvasTransformState;
    canvasContentRef: RefObject<HTMLDivElement | null>;
    isInGroup: boolean;
    groupId?: string | null;
    onGroupSelect?: (groupId: string) => void;
    onWebsiteSizeChange: (websiteId: string, width: number, height: number) => void;
    relativePosition?: { x: number; y: number };
    onUpdateHtmlContent: (websiteId: string, newHtmlContent: string) => void;
    
}

const DEFAULT_WEBSITE_WIDTH = 1440;
const WebsiteDisplay: React.FC<WebsiteDisplayProps> = ({
    website,
    isActive,
    onActivate,
    onDelete,
    onSectionAction,
    onContentAction,
    canvasTransform,
    canvasContentRef,
    isInGroup,
    onWebsiteSizeChange,
    relativePosition,
    onUpdateHtmlContent,
}) => {
    const [internalWidth, setInternalWidth] = useState(website.width || DEFAULT_WEBSITE_WIDTH);

    const handleIframeSizeChange = useCallback((width: number, height: number) => {
        onWebsiteSizeChange(website.id, width, height);
        if (width !== internalWidth) {
            setInternalWidth(width);
        }
    }, [website.id, onWebsiteSizeChange, internalWidth]);


    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onActivate(website.id);
    };

    const versionNumberMatch = website.title.match(/\(v(\d+)\)$/);
    const versionNumber = versionNumberMatch ? parseInt(versionNumberMatch[1], 10) : null;

    const pageNameIndicator = website.pageName ? (
        <span className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            <FileText size={12} /> {website.pageName}
        </span>
    ) : null;

    const versionIndicator = versionNumber !== null ? (
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${versionNumber === 0 ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
            <Copy size={12} /> {versionNumber === 0 ? 'Original' : `Version ${versionNumber}`}
        </span>
    ) : null;

    const positionLeft = isInGroup && relativePosition ? relativePosition.x : website.position.x;
    const positionTop = isInGroup && relativePosition ? relativePosition.y : website.position.y;


    const displayStyle = {
        position: 'absolute' as const,
        left: positionLeft,
        top: positionTop,
        // boxShadow: isActive
        //     ? '0 0 0 3px rgba(79, 70, 229, 0.6), 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
        //     : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, left 0.3s ease, top 0.3s ease',
        borderRadius: '10px',
        transform: isActive ? 'scale(1.01)' : 'scale(1)',
        overflow: 'visible',
        cursor: 'pointer',
        zIndex: isActive ? 6 : (isInGroup ? 2 : 1),
    };


    const handleHtmlContentChange = useCallback((newHtmlContent: string) => {
        onUpdateHtmlContent(website.id, newHtmlContent);
    }, [website.id, onUpdateHtmlContent]);


    return (
        <div
            style={displayStyle}
            onClick={handleContainerClick}
            className={`website-display-container ${isActive ? 'active-website' : ''}`}
        >
            {(pageNameIndicator || versionIndicator) && (
                <div
                    className="absolute -top-6 left-1 flex gap-2 pointer-events-none"
                    style={{ zIndex: 3 }}
                >
                    {pageNameIndicator}
                    {versionIndicator}
                </div>
            )}
            <EventBlocker shouldBlockZoom={!isActive}>
            <WireframeRenderer
                key={website.id + '-renderer'}
                title={website.title}
                htmlContent={website.htmlContent}
                wireframePosition={website.position}
                canvasTransform={canvasTransform}
                canvasContentRef={canvasContentRef}
                initialWidth={internalWidth}
                onDelete={() => onDelete(website.id)}
                onSectionActionRequest={(sectionInfo: SectionInfo, actionType: 'regenerate-section') => onSectionAction(website.id, sectionInfo, actionType)}
                onContentActionRequest={(contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => onContentAction(website.id, contentInfo, actionType)}
                onSizeChange={(width: number, height: number) => handleIframeSizeChange(width, height)}
                onHtmlContentChange={handleHtmlContentChange}
            />
            </EventBlocker>
        </div>
    );
};
export default WebsiteDisplay;