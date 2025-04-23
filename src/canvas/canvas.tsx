// src/components/CanvasApp.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ReactInfiniteCanvas, ReactInfiniteCanvasHandle } from 'react-infinite-canvas';
import toast from 'react-hot-toast';
import { useParams, useLocation, useNavigate  } from 'react-router-dom';

import SideNavbar from '../sidebar';
import WebsiteDisplay from './websiteDisplay';
import TopBar from './topBar';
import WebsiteGroup from './websiteGroup';
import RegenerateModal from '../modal/regenerateModel';
import EditContentModal from '../modal/EditContentModal';
import AskAIModal from '../modal/askAIModal';
import LoadingOverlay from './loadingOverlay';
import ApiService from '../services/apiService';
import {
  CanvasTransformState,
  WebsiteData,
  RegenerateModalState,
  EditContentModalState,
  AskAIModalState,
  SectionInfo,
  // CanvasLoadResponse,
  // GroupRead,
  // ScreenRead,
  // ScreenVersionRead,
  CanvasSaveRequest,
  GroupSaveData,
  PositionData ,
  ScreenSaveData,
  ScreenVersionSaveData,
  WebsiteSizeData
} from '../types/type';
import { getErrorMessage } from '@/lib/errorHandling';
import { ContentHighlightInfo, ContentActionType } from '../useContentHighlights';
import { parse_title_and_version } from '@/lib/utils';
import BottomBar from './bottomBar';



// Constants
const DEFAULT_WEBSITE_WIDTH = 1440;
const DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT = 600;
const VERTICAL_SPACING = 3000;
const HORIZONTAL_PLACEMENT_X = 100;
const HORIZONTAL_GROUP_SPACING = 80;
const HORIZONTAL_VERSION_SPACING = 200;

const CanvasApp: React.FC = () => {

  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const isNewProject = location.state?.isNewProject;
  const navigate = useNavigate();


  // --- Refs and State ---
  const canvasRef = useRef<ReactInfiniteCanvasHandle>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const [generatedWebsites, setGeneratedWebsites] = useState<WebsiteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransformState>({ k: 1, x: 0, y: 0 });
  const [websiteSizes, setWebsiteSizes] = useState<Record<string, { width: number, height: number }>>({});
  // const groupBoundsRef = useRef<Record<string, GroupBounds>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>(''); 

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

  const [groupNameMap, setGroupNameMap] = useState<Record<string, string>>({});



  useEffect(() => {
    setGeneratedWebsites([]);
    setWebsiteSizes({});
    setActiveGroupId(null);
    setActiveWebsiteId(null);
    setProjectName('');
    setError(null);
    setIsLoading(true);

    if (!projectId) {
      setError("No project ID provided.");
      setIsLoading(false);
      toast.error("Invalid project link.");
      navigate('/dashboard');
      return;
    }

    // --- Handle NEW Project ---
    if (isNewProject) {
      console.log(`Detected new project: ${projectId}. Skipping canvas load.`);
      ApiService.getProjectById(projectId)
        .then(data => {
          setProjectName(data.name);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching project name for new project:", err);
          setError(getErrorMessage(err));
          setIsLoading(false);
          toast.error("Failed to load project details.");
        });
      return;
    }

    // --- Handle EXISTING Project: Load State ---
    const loadData = async () => {
      try {
        const response = await ApiService.getCanvasState(projectId);
        console.log("API Load Response:", response);
        setProjectName(response.project_name);

        const loadedWebsites: WebsiteData[] = [];
        const loadedSizes: Record<string, { width: number, height: number }> = {};
        const groupNames: Record<string, string> = {};

        let currentMaxY = 100; // Initial vertical position for the first group

        // --- Sort groups by their saved vertical position to maintain relative order ---
        const sortedGroups = [...response.groups].sort((a, b) => {
            const yA = a.metadata?.position?.y ?? Infinity;
            const yB = b.metadata?.position?.y ?? Infinity;
            return yA - yB;
        });
        // --------------------------------------------------------------------------


        // --- Process groups sequentially, calculating non-overlapping Y positions ---
        sortedGroups.forEach(group => {
          const groupFrontendId = group.metadata?.frontendId ?? `db-group-${group.id}`;
          if (group.name) {
            groupNames[groupFrontendId] = group.name;
          }

          const groupStartY = currentMaxY;
          const groupHeight = group.metadata?.size?.height ?? DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT; // Fallback height


          // --- Process Screens within this Group ---
          group.screens.forEach(screen => {
            const baseScreenFrontendId = screen.metadata?.frontendId ?? `db-screen-${screen.id}`;
            const screenPositionX = screen.metadata?.position?.x ?? HORIZONTAL_PLACEMENT_X;
            const size = screen.metadata?.size ?? { width: DEFAULT_WEBSITE_WIDTH, height: DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT };
            const pageName = screen.metadata?.pageName ?? null;
            const baseTitle = screen.title || `Screen ${screen.id}`;

            // --- Process Versions for this Screen ---
            screen.versions.forEach(version => {
              const versionFrontendId = version.version_number === 1 || version.version_number === 0
                ? baseScreenFrontendId
                : `${baseScreenFrontendId}-v${version.version_number}`;
              const versionedTitle = version.version_number === 1 || version.version_number === 0
                ? baseTitle
                : `${baseTitle} (v${version.version_number})`;

              const website: WebsiteData = {
                id: versionFrontendId,
                title: versionedTitle,
                htmlContent: version.html_content || '<p>No content loaded</p>',
                // ** Apply the calculated groupStartY for vertical position **
                position: { x: screenPositionX, y: groupStartY },
                // Use saved/default size
                width: size.width,
                height: size.height,
                groupId: groupFrontendId,
                pageName: pageName,
              };
              loadedWebsites.push(website);
              // Store the actual size for potential use (e.g., by WebsiteDisplay/Group)
              loadedSizes[versionFrontendId] = { width: size.width, height: size.height };
            }); // End versions loop
          }); // End screens loop


          // --- Update currentMaxY for the next group ---
          // Use the saved group height for accurate spacing
          currentMaxY = groupStartY + groupHeight + VERTICAL_SPACING;

        }); 

        const baseIdToVersions: Record<string, WebsiteData[]> = {};
        loadedWebsites.forEach(website => {
            const match = website.id.match(/^(.*?)(?:-v\d+)?$/);
            if (match && match[1]) { // Ensure match[1] exists
                const baseId = match[1]; // ID without the version suffix
                const originalScreen = loadedWebsites.find(w =>
                     w.id === baseId && // Matches the base part
                     (w.groupId === website.groupId) && // Belongs to the same conceptual group
                     parse_title_and_version(w.title)[1] === null // Is the actual base version (no vX)
                );
                const effectiveBaseId = originalScreen ? originalScreen.id : baseId; // Use original ID if found

                if (!baseIdToVersions[effectiveBaseId]) {
                    baseIdToVersions[effectiveBaseId] = [];
                }
                baseIdToVersions[effectiveBaseId].push(website);
            } else {
                if (!baseIdToVersions[website.id]) {
                     baseIdToVersions[website.id] = [website];
                }
            }
        });


        Object.entries(baseIdToVersions).forEach(([baseId, versions]) => {
          if (versions.length > 1) {
            // Sort versions: base (v0/v1) first, then numerically
            versions.sort((a, b) => {
              const versionA = parse_title_and_version(a.title)[1] ?? 0; // Treat base as 0 if no version num
              const versionB = parse_title_and_version(b.title)[1] ?? 0; // Treat base as 0
              return versionA - versionB;
            });

            // Find the actual base website object in the sorted list (should be the first)
            const baseWebsite = versions[0];
            if (!baseWebsite) return; // Should not happen, but safeguard

            const baseX = baseWebsite.position.x; // Use the X position already set
            const baseY = baseWebsite.position.y; // Use the Y position calculated in the groups loop
            const websiteWidth = loadedSizes[baseWebsite.id]?.width || baseWebsite.width || DEFAULT_WEBSITE_WIDTH;

            // Adjust X position for subsequent versions
            versions.forEach((version, index) => {
              // Base version (index 0) keeps its position
              if (index > 0) {
                version.position.x = baseX + index * (websiteWidth + HORIZONTAL_VERSION_SPACING);
              }
               // Ensure Y position is consistent for all versions (already set from groupStartY)
              version.position.y = baseY;
            });
          }
        });
        // --- End Version Horizontal Adjustment ---


        setGeneratedWebsites(loadedWebsites);
        setWebsiteSizes(loadedSizes); // Use the sizes loaded from screen metadata
        setGroupNameMap(groupNames);

      } catch (err: any) {
         console.error("Error loading canvas state:", err);
         const message = getErrorMessage(err);
         setError(`Failed to load project: ${message}`);
         toast.error(`Failed to load project: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, isNewProject, navigate]); // Dependencies remain the same



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
  const handleGenerateWebsite = async (prompt: string, pages: string[], base64Image: string | null = null) => {
    if (!prompt.trim() && !base64Image || isLoading) return;
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

      if (base64Image) {
        const data = await ApiService.generateHtmlFromImage(prompt, base64Image);
        const newGroupId = `IMAGE-${Date.now()}`;
        const newWebsite: WebsiteData = {
          id: `web-${Date.now()}`,
          title: prompt.substring(0, 10) + (prompt.length > 10 ? '...' : ''),
          htmlContent: data.html,
          position: { x: HORIZONTAL_PLACEMENT_X, y: newY },
          width: DEFAULT_WEBSITE_WIDTH,
          height: DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT,
          groupId: newGroupId,
          pageName: null,
        };
        setGeneratedWebsites(prev => [...prev, newWebsite]);
        setActiveWebsiteId(newWebsite.id);
      }
      else if (pages.length === 0) {
        console.log("Generating single page...");
        const data = await ApiService.generateWebsite(prompt);
        const newGroupId = `GROUP-${Date.now()}`;

        const newWebsite: WebsiteData = {
          id: `web-${Date.now()}`,
          title: prompt.substring(0, 10) + (prompt.length > 10 ? '...' : ''),
          htmlContent: data.html,
          position: { x: HORIZONTAL_PLACEMENT_X, y: newY },
          width: DEFAULT_WEBSITE_WIDTH,
          height: DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT,
          groupId: newGroupId,
          pageName: null,
        };
        setGeneratedWebsites(prev => [...prev, newWebsite]);
        setActiveWebsiteId(newWebsite.id);
        console.log("Single page generated:", newWebsite.id);
      } else {
        console.log(`Generating multiple pages (${pages.length})...`);
        const allPageNames = pages;
        const htmlPages = await ApiService.generateMultipleWebsites(prompt, allPageNames);

        if (htmlPages.html_pages.length !== allPageNames.length) {
          throw new Error(`API returned ${htmlPages.html_pages.length} pages, but ${allPageNames.length} were requested.`);
        }

        const newGroupId = `flow-${Date.now()}`;
        const newWebsites: WebsiteData[] = [];
        let currentX = HORIZONTAL_PLACEMENT_X;

        allPageNames.forEach((pageName, index) => {
          const pageHtml = htmlPages.html_pages[index];
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
        canvasRef.current?.fitContentToView({ duration: 400 });
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
      let newX = actionedWebsite.position.x; // Default X if no websites exist
      let newY = actionedWebsite.position.y; // Keep the same Y position

      if (generatedWebsites.length > 0) {
        // Get the last website in the array
        const lastWebsite = generatedWebsites[generatedWebsites.length - 1];
        

        // Position to the right of the last website

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
      if (!data.text) throw new Error("API returned no processed text.");

      setGeneratedWebsites(prev => prev.map(site => {
        if (site.id === websiteId) {
          const parser = new DOMParser();
          const siteDoc = parser.parseFromString(site.htmlContent, 'text/html');
          // Prefer data-content-id
          const contentId = contentInfo.element.dataset.contentId;
          const elementToModify = contentId ? siteDoc.querySelector(`[data-content-id="${contentId}"]`) : null;

          let found = false;
          if (elementToModify instanceof HTMLElement) {
            elementToModify.textContent = data.text;
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
                tempElement.textContent = data.text;
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

  const handleWebsiteContentChange = useCallback((websiteId: string, newHtmlContent: string) => {
    setGeneratedWebsites((prevWebsites) =>
      prevWebsites.map((website) =>
        website.id === websiteId ? { ...website, htmlContent: newHtmlContent } : website
      )
    );
  }, []);



 // src/components/CanvasApp.tsx

// ... other imports ...


const handleSaveCanvas = async () => {
    if (!projectId) {
        toast.error("Project ID is missing. Cannot save.");
        return;
    }
    if (isSaving) {
        toast("Already saving...", { icon: '⏳' });
        return;
    }
    if (generatedWebsites.length === 0 && !isNewProject) {
       console.warn("Saving empty canvas state for existing project.");
      // toast.error("Nothing to save. Generate some content first.");
      // return;
    }

    setIsSaving(true);
    setError(null);
    const saveToastId = toast.loading('Saving project...');

    try {
      console.log("Preparing canvas state for saving...");

      const { grouped: allGroupsMap } = groupedWebsites();

      const groupsPayload: GroupSaveData[] = [];

      for (const [groupId, websitesInGroup] of Object.entries(allGroupsMap) as [string, WebsiteData[]][]) {
        if (websitesInGroup.length === 0) continue;

        const screensPayload: ScreenSaveData[] = [];
        const processedBaseScreenIds = new Set<string>();

        // --- Calculate Group Bounds ---
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let groupPosition: PositionData | null = null; // Use first website's position as anchor

        websitesInGroup.forEach((website, index) => {
            const size = websiteSizes[website.id] ?? {
                width: website.width ?? DEFAULT_WEBSITE_WIDTH,
                height: website.height ?? DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT
            };
            const posX = website.position.x;
            const posY = website.position.y;
            const width = size.width;
            const height = size.height;

            if (index === 0) {
                groupPosition = { x: posX, y: posY }; // Anchor position
            }

            minX = Math.min(minX, posX);
            minY = Math.min(minY, posY);
            maxX = Math.max(maxX, posX + width);
            maxY = Math.max(maxY, posY + height);
        });

        const groupSize: WebsiteSizeData | null = (minX !== Infinity)
          ? { width: maxX - minX, height: maxY - minY }
          : null;
        // ------------------------------

        // Use the calculated or first website's position if calculation failed
        const finalGroupPosition = groupPosition ?? (websitesInGroup[0]?.position || { x: 0, y: 0 });


        let groupName: string | null = null;
        if (groupId.startsWith('flow-')) {
          groupName = `Flow (${groupId.substring(5, 13)}...)`;
        } else if (groupId.startsWith('version-group-')) {
           const baseWebsite = generatedWebsites.find(w => w.id === groupId.replace('version-group-', ''));
           groupName = `Versions of '${baseWebsite ? parse_title_and_version(baseWebsite.title)[0] : 'Unknown'}'`;
        } else if (groupId.startsWith('single-item-group-')){
           // Maybe derive name from the single item?
           groupName = `Item: ${websitesInGroup[0]?.title ?? 'Unnamed'}`;
        } else if (websitesInGroup[0]?.groupId === groupId) {
           // Explicit group created via generation (e.g., image prompt)
           groupName = groupNameMap[groupId] || `Group: ${groupId.substring(0, 8)}`; // Use stored name or fallback
        } else {
           groupName = `Group: ${groupId}`; // Basic fallback
        }


        for (const website of websitesInGroup) {
          // ... (existing screen processing logic remains the same) ...
          const [baseTitle, versionNum] = parse_title_and_version(website.title);

          let baseScreenFrontendId: string;
          if (groupId.startsWith('version-group-')) {
            baseScreenFrontendId = groupId.replace('version-group-', '');
          } else if (groupId.startsWith('flow-') && versionNum !== null) {
            const originalInFlow = websitesInGroup.find(w =>
              w.groupId === groupId &&
              w.pageName === website.pageName &&
              parse_title_and_version(w.title)[1] === null // No version number
            );
            baseScreenFrontendId = originalInFlow ? originalInFlow.id : website.id; // Fallback to self if base not found
          } else {
            baseScreenFrontendId = website.id; // Base is itself if not a version/flow variant
          }

          if (processedBaseScreenIds.has(baseScreenFrontendId)) {
            continue;
          }

          const baseWebsiteData = generatedWebsites.find(w => w.id === baseScreenFrontendId);

          if (!baseWebsiteData) {
            console.warn(`Could not find base website data for base ID ${baseScreenFrontendId}. Skipping screen.`);
            continue;
          }
          // --- Find all versions related to this base screen *within this group* ---
          const allVersionsForThisBase: ScreenVersionSaveData[] = websitesInGroup // Filter from *this* group
            .filter(w => {
               // Determine if 'w' is a version of 'baseWebsiteData' within the context of 'groupId'
              const [wBaseTitle, wVersionNum] = parse_title_and_version(w.title);

              if (groupId.startsWith('version-group-')) {
                 // If it's a version group, any website in this group belongs to the base ID
                return w.id === baseScreenFrontendId || wVersionNum !== null;
              } else if (groupId.startsWith('flow-')) {
                 // In a flow, versions must match the pageName and base title
                 return w.pageName === baseWebsiteData.pageName && wBaseTitle === baseTitle;
              }
              // Add logic for other group types if necessary
              else {
                 // For generic groups or single items, check if the title matches the base title
                 return wBaseTitle === baseTitle;
              }
            })
            .map(v => ({
              id: v.id, // Keep frontend ID for potential reference
              title: v.title,
              htmlContent: v.htmlContent,
            }));

           // Sort versions based on the version number derived from the title
           allVersionsForThisBase.sort((a, b) => {
               const vA = parse_title_and_version(a.title)[1] ?? 0; // Treat base as version 0
               const vB = parse_title_and_version(b.title)[1] ?? 0; // Treat base as version 0
               return vA - vB;
           });
          // --- End Finding/Sorting Versions ---


          // --- Create Screen Payload ---
          const baseScreenSize = websiteSizes[baseScreenFrontendId] ?? { width: baseWebsiteData.width ?? DEFAULT_WEBSITE_WIDTH, height: baseWebsiteData.height ?? DEFAULT_WEBSITE_HEIGHT_FOR_PLACEMENT };
          const screenData: ScreenSaveData = {
            baseFrontendId: baseScreenFrontendId,
            title: baseTitle, // Use the parsed base title
            position: { x: baseWebsiteData.position.x, y: baseWebsiteData.position.y },
            width: baseScreenSize.width,
            height: baseScreenSize.height,
            pageName: baseWebsiteData.pageName,
            versions: allVersionsForThisBase, // Use the correctly filtered and sorted versions
          };

          screensPayload.push(screenData);
          processedBaseScreenIds.add(baseScreenFrontendId);
        } // End loop through websites in group


        // --- Create Group Payload ---
        if (screensPayload.length > 0) {
          groupsPayload.push({
            frontendId: groupId,
            name: groupName, // Use the derived group name
            position: finalGroupPosition, // Use the calculated anchor position
            size: groupSize,          // <--- ADDED CALCULATED SIZE
            screens: screensPayload,
          });
        }
      } // End loop through groups

      const payload: CanvasSaveRequest = {
        groups: groupsPayload,
      };

      console.log("Saving payload:", JSON.stringify(payload, null, 2));

      // --- API Call ---
      const response = await ApiService.saveCanvasState(projectId, payload);
      console.log("Save response:", response);
      toast.success('Project saved successfully!', { id: saveToastId });

    } catch (err: any) {
      console.error("Save Error:", err);
      const errorMsg = getErrorMessage(err);
      setError(`Failed to save project: ${errorMsg}`);
      toast.error(`Save failed: ${errorMsg}`, { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };
  


  // --- Render ---
  const { grouped, ungrouped } = groupedWebsites();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
             {isSidebarOpen && (
      <SideNavbar onGenerate={handleGenerateWebsite} isLoading={isLoading && !isUpdatingContent} error={error} onClose={() => setIsSidebarOpen(false)} />
             )}
      <main className="flex-grow relative overflow-hidden">

      <TopBar
              projectName={projectName}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onSave={handleSaveCanvas}
              isSaving={isSaving}
              canSave={!isLoading && !isSaving}
           />

        <ReactInfiniteCanvas
          ref={canvasRef}
          minZoom={0} maxZoom={4}
          scrollBarConfig={{
            renderScrollBar: true,
            startingPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            color: "grey",
            thickness: "8px",
            minSize: "15px",
          }}
          // panOnScroll

          className="w-full h-full"
          backgroundConfig={{ backgroundColor: 'lightgrey' }}
        // No 'elements' prop needed
        >
          {/* <EventBlocker shouldBlockZoom={true}> */}
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
                onUpdateHtmlContent={handleWebsiteContentChange}
              />
            ))}

            {/* Render grouped websites (Flows and Versions) */}
            {Object.entries(grouped).map(([groupId, websitesInGroup]) => (
              <WebsiteGroup
                key={groupId}
                groupId={groupId}
                groupName={groupNameMap[groupId] || ''}
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
                onUpdateHtmlContent={handleWebsiteContentChange}
               
              />
            ))}
          </div>
          {/* </EventBlocker> */}
        </ReactInfiniteCanvas>
        <BottomBar
                canvasRef={canvasRef}
                currentZoom={canvasTransform.k} // Pass the current zoom level 'k'
            />
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