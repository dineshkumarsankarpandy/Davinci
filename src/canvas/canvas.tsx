// src/components/CanvasApp.tsx
import React, { useRef, useState, useCallback } from 'react';
import { ReactInfiniteCanvas, ReactInfiniteCanvasHandle } from 'react-infinite-canvas';
import SideNavbar from '../sidebar'; // Adjust path
import WebsiteDisplay from './websiteDisplay';
import WebsiteGroup from './websiteGroup';
import RegenerateModal from '../modal/regenerateModel'; // Adjust path
import EditContentModal from '../modal/EditContentModal'; // Adjust path
import AskAIModal from '../modal/askAIModal'; // Adjust path
import LoadingOverlay from './loadingOverlay';
import ApiService from '../services/apiService'; // Adjust path
import {
  CanvasTransformState,
  WebsiteData,
  RegenerateModalState,
  EditContentModalState,
  AskAIModalState,
  SectionInfo
} from '../types/type'; // Adjust path
import { ContentHighlightInfo, ContentActionType } from '../useContentHighlights'; // Adjust path

// Constants
const DEFAULT_WEBSITE_WIDTH = 1440;
const DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT = 600;
const VERTICAL_SPACING = 500;
const HORIZONTAL_PLACEMENT_X = 100;
const HORIZONTAL_GROUP_SPACING = 80;
const HORIZONTAL_VERSION_SPACING = 200;

const CanvasApp: React.FC = () => {
  // --- Refs and State ---
  const canvasRef = useRef<ReactInfiniteCanvasHandle>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const [generatedWebsites, setGeneratedWebsites] = useState<WebsiteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransformState>({ k: 1, x: 0, y: 0 });
  const [websiteSizes, setWebsiteSizes] = useState<Record<string, { width: number, height: number }>>({});
  const [regenerateModal, setRegenerateModal] = useState<RegenerateModalState>({
    isOpen: false, websiteId: null, sectionInfo: null
  });
  const [editContentModal, setEditContentModal] = useState<EditContentModalState>({
    isOpen: false, websiteId: null, contentInfo: null
  });
  const [askAIModal, setAskAIModal] = useState<AskAIModalState>({
    isOpen: false, websiteId: null, contentInfo: null
  });
  const [editContentValue, setEditContentValue] = useState('');

  // // --- Helper Functions ---
  // const fitContent = useCallback(( duration = 500, ) => {
  //   setTimeout(() => {
  //     canvasRef.current?.fitContentToView({  duration});
  //   }, 300);
  // }, []);

  const groupedWebsites = useCallback(() => {
    const explicitGroups: Record<string, WebsiteData[]> = {};
    const versionGroups: Record<string, WebsiteData[]> = {};
    const ungrouped: WebsiteData[] = [];

    generatedWebsites.forEach(website => {
      if (website.groupId) {
        if (!explicitGroups[website.groupId]) explicitGroups[website.groupId] = [];
        explicitGroups[website.groupId].push(website);
      }
    });

    generatedWebsites.forEach(website => {
      if (website.groupId) return;

      const versionMatch = website.title.match(/\(v(\d+)\)$/);
      if (versionMatch) {
        const baseTitle = website.title.replace(/\s\(v\d+\)$/, '');
        const original = generatedWebsites.find(w =>
          !w.groupId &&
          w.id !== website.id &&
          w.title === baseTitle &&
          !w.title.match(/\(v\d+\)$/)
        );

        if (original) {
          const versionGroupId = `version-group-${original.id}`;
          if (!versionGroups[versionGroupId]) versionGroups[versionGroupId] = [original];
          versionGroups[versionGroupId].push(website);
        } else {
          ungrouped.push(website);
        }
      } else {
        const hasVersions = generatedWebsites.some(w =>
          !w.groupId &&
          w.id !== website.id &&
          w.title.startsWith(website.title) &&
          w.title.match(/\s\(v\d+\)$/)
        );
        if (!hasVersions) {
          ungrouped.push(website);
        }
      }
    });

    const combinedGroups = { ...explicitGroups, ...versionGroups };
    Object.values(combinedGroups).forEach(group => group.sort((a, b) => a.id.localeCompare(b.id)));

    return { grouped: combinedGroups, ungrouped };
  }, [generatedWebsites]);

  const getWebsiteGroupId = useCallback((website: WebsiteData): string | null => {
    if (website.groupId) return website.groupId;

    const versionMatch = website.title.match(/\(v(\d+)\)$/);
    if (versionMatch) {
      const baseTitle = website.title.replace(/\s\(v\d+\)$/, '');
      const original = generatedWebsites.find(w =>
        !w.groupId && w.title === baseTitle && !w.title.match(/\(v\d+\)$/)
      );
      if (original) return `version-group-${original.id}`;
    }

    if (!website.groupId && !versionMatch) {
      const hasVersions = generatedWebsites.some(w =>
        !w.groupId &&
        w.id !== website.id &&
        w.title.startsWith(website.title) &&
        w.title.match(/\s\(v\d+\)$/)
      );
      if (hasVersions) return `version-group-${website.id}`;
    }
    return null;
  }, [generatedWebsites]);

  // --- Event Handlers ---
  const handleCanvasZoom = useCallback((event: any) => {
    const transform = event?.transform;
    if (transform?.k && transform?.x !== undefined && transform?.y !== undefined) {
      setCanvasTransform(prev => {
        if (prev.k !== transform.k || prev.x !== transform.x || prev.y !== transform.y) {
          return { k: transform.k, x: transform.x, y: transform.y };
        } return prev;
      });
    } else {
      const state = canvasRef.current?.getCanvasState();
      if (state?.currentPosition) {
        const { k, x, y } = state.currentPosition;
        setCanvasTransform(prev => {
          if (prev.k !== k || prev.x !== x || prev.y !== y) { return { k, x, y }; } return prev;
        });
      }
    }
  }, []);

  const handleWebsiteSizeChange = useCallback((websiteId: string, width: number, height: number) => {
    setWebsiteSizes(prev => {
      const currentSize = prev[websiteId];
      if (!currentSize || currentSize.width !== width || currentSize.height !== height) {
        return { ...prev, [websiteId]: { width, height } };
      }
      return prev;
    });
  }, []);

  // --- Main Actions ---
  const handleGenerateWebsite = async (prompt: string, pages: string[]) => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setActiveWebsiteId(null);
    setActiveGroupId(null);

    try {
      let maxY = 0;
      generatedWebsites.forEach(site => {
        const siteSize = websiteSizes[site.id] || { width: site.width || DEFAULT_WEBSITE_WIDTH, height: site.height || DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT };
        const bottomEdge = site.position.y + siteSize.height;
        maxY = Math.max(maxY, bottomEdge);
      });
      const newY = generatedWebsites.length > 0 ? maxY + VERTICAL_SPACING : 100;

      if (pages.length === 0) {
        console.log("Generating single page...");
        const data = await ApiService.generateWebsite(prompt);
        const newWebsite: WebsiteData = {
          id: `web-${Date.now()}`,
          title: prompt.substring(0,10) + (prompt.length > 10 ? '...' : ''),
          htmlContent: data.html,
          position: { x: HORIZONTAL_PLACEMENT_X, y: newY },
          width: DEFAULT_WEBSITE_WIDTH,
          height: DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT,
          groupId: null,
          pageName: null,
        };
        setGeneratedWebsites(prev => [...prev, newWebsite]);
        setActiveWebsiteId(newWebsite.id);
        console.log("Single page generated:", newWebsite.id);
      } else {
        console.log(`Generating multiple pages (${pages.length})...`);
        const allPageNames = pages;
        const htmlPages = await ApiService.generateMultipleWebsites(prompt, allPageNames);

        if (htmlPages.length !== allPageNames.length) {
          throw new Error(`API returned ${htmlPages.length} pages, but ${allPageNames.length} were requested.`);
        }

        const newGroupId = `flow-${Date.now()}`;
        const newWebsites: WebsiteData[] = [];
        let currentX = HORIZONTAL_PLACEMENT_X;

        allPageNames.forEach((pageName, index) => {
          const pageHtml = htmlPages[index];
          const websiteId = `web-${newGroupId}-${index}`;
          const newWebsite: WebsiteData = {
            id: websiteId,
            title: `${pageName} - ${prompt.substring(0, 30)}...`,
            htmlContent: pageHtml,
            position: { x: currentX, y: newY },
            width: DEFAULT_WEBSITE_WIDTH,
            height: DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT,
            groupId: newGroupId,
            pageName: pageName,
          };
          newWebsites.push(newWebsite);
          currentX += (DEFAULT_WEBSITE_WIDTH + HORIZONTAL_GROUP_SPACING);
        });

        setGeneratedWebsites(prev => [...prev, ...newWebsites]);
        setActiveGroupId(newGroupId);
        console.log("Multi-page group generated:", newGroupId, newWebsites.map(w => w.id));
      }
      // fitContent();
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || 'Error generating website(s).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebsite = (id: string) => {
    const websiteToDelete = generatedWebsites.find(w => w.id === id);
    if (!websiteToDelete) return;

    const groupId = websiteToDelete.groupId;
    const isVersion = websiteToDelete.title.match(/\(v\d+\)$/);
    let associatedIdsToDelete: string[] = [id];

    if (!isVersion && !groupId) {
      const versionGroupId = `version-group-${id}`;
      generatedWebsites.forEach(w => {
        if (getWebsiteGroupId(w) === versionGroupId) {
          associatedIdsToDelete.push(w.id);
        }
      });
    }

    setGeneratedWebsites(prev => prev.filter(w => !associatedIdsToDelete.includes(w.id)));

    if (associatedIdsToDelete.includes(activeWebsiteId ?? '')) {
      setActiveWebsiteId(null);
    }

    if (groupId && activeGroupId === groupId) {
      const remainingInGroup = generatedWebsites.filter(w => w.groupId === groupId && !associatedIdsToDelete.includes(w.id));
      if (remainingInGroup.length === 0) {
        setActiveGroupId(null);
      }
    }
    const potentialVersionGroupId = isVersion ? getWebsiteGroupId(websiteToDelete) : `version-group-${id}`;
    if (potentialVersionGroupId && activeGroupId === potentialVersionGroupId) {
      const remainingInGroup = generatedWebsites.filter(w =>
        getWebsiteGroupId(w) === potentialVersionGroupId && !associatedIdsToDelete.includes(w.id)
      );
      if (remainingInGroup.length === 0) {
        setActiveGroupId(null);
      }
    }
  };

  // --- Activation Handlers ---
  const handleSetActiveWebsite = (id: string) => {
    if (activeWebsiteId !== id) {
      setActiveWebsiteId(id);
      setActiveGroupId(null);
      // Optional: Pan to the website
      // const website = generatedWebsites.find(w => w.id === id);
      // if (website && canvasRef.current) {
      //   const size = websiteSizes[id] || { width: website.width || DEFAULT_WEBSITE_WIDTH, height: website.height || DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT };
      //   canvasRef.current.panTo(website.position.x + size.width / 2, website.position.y + size.height / 2, { duration: 300 });
      // }
    }
  };

  const handleSetActiveGroup = (groupId: string) => {
    if (activeGroupId !== groupId) {
      setActiveGroupId(groupId);
      setActiveWebsiteId(null);
      setTimeout(() => {
        canvasRef.current?.fitContentToView({  duration: 400 });
      }, 150);
    }
  };

  // --- Modal Action Requests ---
  const handleSectionActionRequest = useCallback((
    websiteId: string, sectionInfo: SectionInfo, actionType: 'regenerate-section'
  ) => {
    if (actionType === 'regenerate-section') {
      setRegenerateModal({ isOpen: true, websiteId, sectionInfo });
      setEditContentModal(p => ({ ...p, isOpen: false }));
      setAskAIModal(p => ({ ...p, isOpen: false }));
    }
  }, []);

  const handleContentActionRequest = useCallback((
    websiteId: string, contentInfo: ContentHighlightInfo & { element: HTMLElement }, actionType: ContentActionType
  ) => {
    if (actionType === 'edit-content') {
      setEditContentValue(contentInfo.textContent || '');
      setEditContentModal({ isOpen: true, websiteId, contentInfo });
      setRegenerateModal(p => ({ ...p, isOpen: false }));
      setAskAIModal(p => ({ ...p, isOpen: false }));
    } else if (actionType === 'ask-ai') {
      setAskAIModal({ isOpen: true, websiteId, contentInfo });
      setRegenerateModal(p => ({ ...p, isOpen: false }));
      setEditContentModal(p => ({ ...p, isOpen: false }));
    }
  }, []);

  // --- Modal Close Handlers ---
  const closeRegenerateModal = () => setRegenerateModal({ isOpen: false, websiteId: null, sectionInfo: null });
  const closeEditContentModal = () => { setEditContentModal({ isOpen: false, websiteId: null, contentInfo: null }); setEditContentValue(''); };
  const closeAskAIModal = () => setAskAIModal({ isOpen: false, websiteId: null, contentInfo: null });

  const submitRegenerateSection = async (prompt: string) => {
    if (!regenerateModal.websiteId || !regenerateModal.sectionInfo || !prompt) return;
    setIsUpdatingContent(true);
    setError(null);
    const { websiteId, sectionInfo } = regenerateModal;
  
    try {
      const actionedWebsite = generatedWebsites.find(w => w.id === websiteId);
      if (!actionedWebsite) throw new Error("Actioned website not found for regeneration.");
  
      const data = await ApiService.regenerateSection(actionedWebsite.htmlContent, sectionInfo.outerHTML, prompt);
  
      const baseTitle = actionedWebsite.title.replace(/\s\(v\d+\)$/, '');
      const originalGroupId = actionedWebsite.groupId;
      const originalPageName = actionedWebsite.pageName;
  
      // Count existing versions to determine next version number
      const existingVersionsCount = generatedWebsites.filter(w => {
        const versionPattern = new RegExp(`^${baseTitle}\\s*\\(v\\d+\\)$`);
        return versionPattern.test(w.title);
      }).length;
      const nextVersionNumber = existingVersionsCount + 1;
      
      // Simple approach: position relative to the last website in the array
      let newX = HORIZONTAL_PLACEMENT_X; // Default X if no websites exist
      let newY = actionedWebsite.position.y; // Keep the same Y position
      
      if (generatedWebsites.length > 0) {
        // Get the last website in the array
        const lastWebsite = generatedWebsites[generatedWebsites.length - 1];
        const lastWebsiteWidth = websiteSizes[lastWebsite.id]?.width || 
                                 lastWebsite.width || 
                                 DEFAULT_WEBSITE_WIDTH;
        
        // Position to the right of the last website
        newX = lastWebsite.position.x + lastWebsiteWidth + HORIZONTAL_VERSION_SPACING;
        
        console.log(`[Regen] Positioning based on last website: ${lastWebsite.id} at position x:${lastWebsite.position.x}`);
      }
      
      // Create new website version with calculated position
      const newWebsite: WebsiteData = {
        id: `web-${Date.now()}-v${nextVersionNumber}`,
        title: `${baseTitle} (v${nextVersionNumber})`,
        htmlContent: data.updated_html,
        position: { x: newX, y: newY },
        width: actionedWebsite.width || DEFAULT_WEBSITE_WIDTH,
        height: actionedWebsite.height || DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT,
        groupId: originalGroupId,
        pageName: originalPageName
      };
      
      console.log(`[Regen] New version positioned at x:${newX}, y:${newY}`);
  
      // Explicitly add the new website at the end
      const newWebsites = [...generatedWebsites];
      newWebsites.push(newWebsite);
      setGeneratedWebsites(newWebsites);
      
      // Set active states
      setActiveWebsiteId(newWebsite.id);
      if (originalGroupId) {
        setActiveGroupId(originalGroupId);
      }
  
      // Ensure content fits to view after DOM update
      setTimeout(() => {
        canvasRef.current?.fitContentToView({ duration: 600 });
      }, 500);
  
    } catch (err: any) {
      console.error("Regeneration Error:", err);
      setError(`Failed to regenerate section: ${err.message}`);
    } finally {
      setIsUpdatingContent(false);
      closeRegenerateModal();
    }
  };
  const submitEditContent = (newContent: string) => {
    if (!editContentModal.websiteId || !editContentModal.contentInfo) return;
    setIsUpdatingContent(true);
    setError(null);
    const { websiteId, contentInfo } = editContentModal;
    const oldOuterHtml = contentInfo.outerHTML; // Keep for fallback identification if needed

    try {
      setGeneratedWebsites(prev => prev.map(site => {
        if (site.id === websiteId) {
          const parser = new DOMParser();
          const siteDoc = parser.parseFromString(site.htmlContent, 'text/html');
          // Prefer data-content-id for reliability
          const contentId = contentInfo.element.dataset.contentId;
          const elementToModify = contentId ? siteDoc.querySelector(`[data-content-id="${contentId}"]`) : null;

          let found = false;
          if (elementToModify instanceof HTMLElement) {
            elementToModify.textContent = newContent;
            // Serialize the whole document back to string
            const finalHtml = `<!DOCTYPE html>${siteDoc.documentElement.outerHTML}`;
            console.log("Updated content via DOM manipulation (data-content-id)");
            found = true;
            return { ...site, htmlContent: finalHtml };
          } else {
            // Fallback: Simple string replacement (less reliable)
            if (site.htmlContent.includes(oldOuterHtml)) {
              const tempParser = new DOMParser();
              const tempDoc = tempParser.parseFromString(oldOuterHtml, 'text/html');
              const tempElement = tempDoc.body.firstChild as HTMLElement;
              if (tempElement && tempElement.nodeType === Node.ELEMENT_NODE) {
                tempElement.textContent = newContent;
                const newOuterHtml = tempElement.outerHTML;
                const updatedHtmlString = site.htmlContent.replace(oldOuterHtml, newOuterHtml);
                console.warn("Updated content via string replace (fallback)");
                found = true;
                return { ...site, htmlContent: updatedHtmlString };
              }
            }
          }

          if (!found) {
            console.warn("Edit Content: Target element or old HTML fragment not found. Update skipped.");
            setError("Update failed: Content mismatch or element not found.");
          }
          return site; // Return unchanged site if update failed
        }
        return site;
      }));
    } catch (err: any) {
      console.error("Edit Content Error:", err);
      setError(`Update failed: ${err.message}`);
    } finally {
      setIsUpdatingContent(false);
      closeEditContentModal();
    }
  };

  const submitAskAI = async (aiAction: string) => {
    if (!askAIModal.websiteId || !askAIModal.contentInfo?.textContent) return;
    setIsUpdatingContent(true);
    setError(null);
    const { websiteId, contentInfo } = askAIModal;
    const oldOuterHtml = contentInfo.outerHTML; // Keep for fallback

    try {
      const data = await ApiService.processWithAI(contentInfo.textContent || '', aiAction);
      if (!data.processed_text) throw new Error("API returned no processed text.");

      setGeneratedWebsites(prev => prev.map(site => {
        if (site.id === websiteId) {
          const parser = new DOMParser();
          const siteDoc = parser.parseFromString(site.htmlContent, 'text/html');
          // Prefer data-content-id
          const contentId = contentInfo.element.dataset.contentId;
          const elementToModify = contentId ? siteDoc.querySelector(`[data-content-id="${contentId}"]`) : null;

          let found = false;
          if (elementToModify instanceof HTMLElement) {
            elementToModify.textContent = data.processed_text;
            const finalHtml = `<!DOCTYPE html>${siteDoc.documentElement.outerHTML}`;
            console.log("AI Update via DOM manipulation (data-content-id)");
            found = true;
            return { ...site, htmlContent: finalHtml };
          } else {
            // Fallback: String replacement
            if (oldOuterHtml && site.htmlContent.includes(oldOuterHtml)) {
              const tempParser = new DOMParser();
              const tempDoc = tempParser.parseFromString(oldOuterHtml, 'text/html');
              const tempElement = tempDoc.body.firstChild as HTMLElement;
              if (tempElement?.nodeType === Node.ELEMENT_NODE) {
                tempElement.textContent = data.processed_text;
                const updatedElementHtml = tempElement.outerHTML;
                const updatedHtmlString = site.htmlContent.replace(oldOuterHtml, updatedElementHtml);
                found = true;
                console.warn("AI Update: Used fallback string replacement.");
                return { ...site, htmlContent: updatedHtmlString };
              }
            }
          }

          if (!found) {
            console.warn("AI Update: Target element or old HTML not found. Update skipped.");
            setError("Update failed: Content mismatch or element not found.");
          }
          return site;
        }
        return site;
      }));
    } catch (err: any) {
      console.error("AI Processing Error:", err);
      setError(`AI processing failed: ${err.message}`);
    } finally {
      setIsUpdatingContent(false);
      closeAskAIModal();
    }
  };

  // --- Render ---
  const { grouped, ungrouped } = groupedWebsites();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SideNavbar onGenerate={handleGenerateWebsite} isLoading={isLoading && !isUpdatingContent} error={error} />
      <main className="flex-grow relative overflow-hidden">
        <ReactInfiniteCanvas
          ref={canvasRef}
          minZoom={0.3} maxZoom={4}
          scrollBarConfig={{
            renderScrollBar: true,
            startingPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            color: "grey",
            thickness: "8px",
            minSize: "15px",
          }}
          panOnScroll
          
          className="w-full h-full cursor-grab active:cursor-grabbing bg-dots"
          // onZoom={handleCanvasZoom}
          backgroundConfig={{backgroundColor:'lightgrey'}}
        // No 'elements' prop needed
        >
          <div className="canvas-content" ref={canvasContentRef} style={{ position: 'relative' }}>
            {/* Render ungrouped websites */}
            {ungrouped.map((website) => (
              <WebsiteDisplay
                key={website.id}
                website={website}
                isActive={activeWebsiteId === website.id && !activeGroupId}
                onActivate={handleSetActiveWebsite}
                onDelete={handleDeleteWebsite}
                // Pass handlers with correct signature
                onSectionAction={handleSectionActionRequest}
                onContentAction={handleContentActionRequest}
                canvasTransform={canvasTransform}
                canvasContentRef={canvasContentRef}
                isInGroup={false}
                onWebsiteSizeChange={handleWebsiteSizeChange}
              />
            ))}

            {/* Render grouped websites (Flows and Versions) */}
            {Object.entries(grouped).map(([groupId, websitesInGroup]) => (
              <WebsiteGroup
                key={groupId}
                groupId={groupId} 
                websites={websitesInGroup}
                activeWebsiteId={activeWebsiteId}
                onActivateWebsite={handleSetActiveWebsite}
                onDeleteWebsite={handleDeleteWebsite}
                onSectionAction={handleSectionActionRequest}
                onContentAction={handleContentActionRequest}
                canvasTransform={canvasTransform}
                canvasContentRef={canvasContentRef}
                isActiveGroup={activeGroupId === groupId}
                onGroupSelect={handleSetActiveGroup}
                onWebsiteSizeChange={handleWebsiteSizeChange}
                initialWebsiteSizes={websiteSizes}
              />
            ))}
          </div>
        </ReactInfiniteCanvas>
        <LoadingOverlay isLoading={isLoading && !isUpdatingContent} isUpdating={isUpdatingContent} progress={75} />
        {error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50 max-w-sm">
            <strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
            </button>
          </div>
        )}
      </main>
      <RegenerateModal isOpen={regenerateModal.isOpen} onClose={closeRegenerateModal} sectionInfo={regenerateModal.sectionInfo} onSubmit={submitRegenerateSection} isLoading={isUpdatingContent} />
      <EditContentModal isOpen={editContentModal.isOpen} onClose={closeEditContentModal} contentInfo={editContentModal.contentInfo} editContentValue={editContentValue} setEditContentValue={setEditContentValue} onSubmit={submitEditContent} isLoading={isUpdatingContent} />
      <AskAIModal isOpen={askAIModal.isOpen} onClose={closeAskAIModal} contentInfo={askAIModal.contentInfo} onSubmit={submitAskAI} isLoading={isUpdatingContent} />
    </div>
  );
};

export default CanvasApp;