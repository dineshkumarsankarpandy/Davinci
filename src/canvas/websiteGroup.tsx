// src/components/WebsiteGroup.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import { WebsiteData, CanvasTransformState, SectionInfo } from '../types/type';
import { ContentHighlightInfo, ContentActionType } from '../useContentHighlights';
import WebsiteDisplay from './websiteDisplay';
import { Layers, Eye, EyeOff, Trash2 } from 'lucide-react';
import { determineGroupType, getGroupDisplayName } from '@/lib/utils';
import { GroupType } from '@/types/enum';

interface WebsiteGroupProps {
  groupId: string;
  groupName?: string;
  websites: WebsiteData[];
  activeWebsiteId: string | null;
  onActivateWebsite: (id: string) => void;
  onDeleteWebsite: (id: string) => void;
  onSectionAction: (websiteId: string, sectionInfo: SectionInfo, actionType: 'regenerate-section') => void; // Ensure SectionInfo is imported/defined
  onContentAction: (websiteId: string, contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType) => void;
  canvasTransform: CanvasTransformState;
  canvasContentRef: React.RefObject<HTMLDivElement | null>;
  isActiveGroup: boolean;
  onGroupSelect: (groupId: string) => void;
  onWebsiteSizeChange: (websiteId: string, width: number, height: number) => void;
  initialWebsiteSizes: Record<string, { width: number, height: number }>;
  onUpdateHtmlContent: (websiteId: string, newHtmlContent: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const DEFAULT_WEBSITE_WIDTH = 1440;
const DEFAULT_WEBSITE_HEIGHT = 600;
const GROUP_PADDING = 50;

const WebsiteGroup: React.FC<WebsiteGroupProps> = ({
  groupId,
  websites,
  activeWebsiteId,
  onActivateWebsite,
  onDeleteWebsite,
  onSectionAction,
  onContentAction,
  canvasTransform,
  canvasContentRef,
  isActiveGroup,
  onGroupSelect,
  onWebsiteSizeChange,
  initialWebsiteSizes,
  onUpdateHtmlContent,
  groupName,
  onDeleteGroup
  
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupBounds, setGroupBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Simple debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  // Debounced version of the bounds calculation logic
  const calculateBounds = useCallback(() => {
      if (!websites || websites.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0 }; 
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      websites.forEach(website => {
          const position = website.position;
          const currentSize = initialWebsiteSizes[website.id];
          const width = currentSize?.width ?? website.width ?? DEFAULT_WEBSITE_WIDTH;
          const height = currentSize?.height ?? website.height ?? DEFAULT_WEBSITE_HEIGHT;

          minX = Math.min(minX, position.x);
          minY = Math.min(minY, position.y);
          maxX = Math.max(maxX, position.x + width);
          maxY = Math.max(maxY, position.y + height);
      });

      if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };

      return {
          x: minX - GROUP_PADDING,
          y: minY - GROUP_PADDING,
          width: maxX - minX + GROUP_PADDING * 5,
          height: maxY - minY + GROUP_PADDING * 5,
      };
  }, [websites, initialWebsiteSizes]);

  // Debounced state setter
  const debouncedSetGroupBounds = useCallback(debounce((newBounds) => {
      setGroupBounds(currentBounds => {
          if (Math.abs(currentBounds.x - newBounds.x) > 1 ||
              Math.abs(currentBounds.y - newBounds.y) > 1 ||
              Math.abs(currentBounds.width - newBounds.width) > 1 ||
              Math.abs(currentBounds.height - newBounds.height) > 1) {
              return newBounds;
          }
          return currentBounds;
      });
  }, 100), []);

  // Effect to trigger debounced calculation
  useEffect(() => {
      const newBounds = calculateBounds();
      debouncedSetGroupBounds(newBounds);
  }, [calculateBounds, debouncedSetGroupBounds]); 


  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const groupType = determineGroupType(groupId);
  const isVersionGroup = groupType === GroupType.VERSION;
  const isFlowGroup = groupType === GroupType.FLOW;

  const groupDisplayName = groupName || getGroupDisplayName(
    groupType || GroupType.SINGLE,
    groupId
  );

  const sortedWebsites = [...websites].sort((a, b) => {
    const getVersion = (title: string): number | null => {
        const match = title.match(/\(v(\d+)\)$/);
        return match ? parseInt(match[1], 10) : null;
    };

    if (isVersionGroup) {
        const versionA = getVersion(a.title) ?? -1;
        const versionB = getVersion(b.title) ?? -1;
        return versionA - versionB;
    }

    if (isFlowGroup) {
        const pageComparison = (a.pageName ?? '').localeCompare(b.pageName ?? '');
        if (pageComparison !== 0) {
            return pageComparison;
        }

        const versionA = getVersion(a.title) ?? -1; 
        const versionB = getVersion(b.title) ?? -1;

        if (versionA !== versionB) {
            return versionA - versionB;
        }

        return a.id.localeCompare(b.id);
    }

    return a.id.localeCompare(b.id);
  });


  if (groupBounds.width <= 0 || groupBounds.height <= 0) {
    return null;
  }

  return (
    <div
      ref={groupRef}
      id={groupId}
      style={{
        position: 'absolute',
        left: groupBounds.x,
        top: groupBounds.y,
        width: groupBounds.width,
        height: groupBounds.height,
        borderRadius: '16px',
        border: `3px dashed 'rgba(156, 163, 175, 0.5)'}`,
        backgroundColor:  'rgba(243, 244, 246, 0.2)',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        zIndex:  0,
        pointerEvents: 'auto',
        overflow: 'visible',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onGroupSelect(groupId);
      }}
      className={`website-group-container ${isActiveGroup ? 'active-group' : ''}`}
    >
      {/* Group Header */}
      
          <div
            className="absolute -top-8 left-0 right-0 flex items-center gap-2 cursor-pointer group"
            style={{ 
              zIndex: 6, 
              pointerEvents: 'auto',
              width: '100%',
              padding: '0 12px',
              display: 'flex',
              justifyContent: 'space-between',
             backgroundColor:'rgb(75, 85, 99)',

              
            }}
            onClick={(e) => { e.stopPropagation(); onGroupSelect(groupId); }}
          >
            <div className={'flex items-center gap-2 px-3 py-1 text-white text-md font-medium shadow-md transition-colors '}>
              <Layers size={16} />
              <span className="whitespace-nowrap">{groupDisplayName}</span>
            </div>

            <div className="flex items-center">
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the group "${groupDisplayName}"?`)) {
          onDeleteGroup(groupId);
        }
      }}
      title="Delete Group"
      className={'p-2 transition-colors text-white hover:text-red-300'}
    >
      <Trash2 size={14} />
    </button>
    <button
      onClick={toggleExpand}
      title={isExpanded ? "Collapse Group" : "Expand Group"}
      className={'p-2 transition-colors text-white text-xl shadow-md'}
    >
      {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  </div>
</div>

      {/* Render websites INSIDE */}
      {isExpanded && sortedWebsites.map((website) => {
        const relativeX = website.position.x - groupBounds.x + GROUP_PADDING;
        const relativeY = website.position.y - groupBounds.y + GROUP_PADDING;

        return (

          <WebsiteDisplay
            key={website.id}
            website={website}
            relativePosition={{ x: relativeX, y: relativeY }}
            isActive={activeWebsiteId === website.id && !isActiveGroup}
            onActivate={onActivateWebsite}
            onDelete={onDeleteWebsite}
            onSectionAction={onSectionAction}
            onContentAction={onContentAction}
            canvasTransform={canvasTransform}
            canvasContentRef={canvasContentRef}
            groupId={groupId}
            isInGroup={true}
            onGroupSelect={onGroupSelect}
            onWebsiteSizeChange={onWebsiteSizeChange}
            onUpdateHtmlContent={onUpdateHtmlContent}
          />
        );
      })}
    </div>
  );
};

export default WebsiteGroup;  