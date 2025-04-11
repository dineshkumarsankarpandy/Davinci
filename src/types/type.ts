import { ContentHighlightInfo } from '../useContentHighlights';

export interface CanvasTransformState { 
  k: number; 
  x: number; 
  y: number; 
}

export interface WebsiteData { 
  id: string; 
  title: string; 
  htmlContent: string; 
  position: { x: number; y: number }; 
  height?:number;
  width?:number
  groupId?: string | null; 
  pageName?: string | null;
}

export interface RegenerateModalState { 
  isOpen: boolean; 
  websiteId: string | null; 
  sectionInfo: { id: string; tagName: string; outerHTML: string; } | null; 
}

export interface EditContentModalState { 
  isOpen: boolean; 
  websiteId: string | null; 
  contentInfo: ContentHighlightInfo | null; 
}

export interface AskAIModalState { 
  isOpen: boolean; 
  websiteId: string | null; 
  contentInfo: ContentHighlightInfo | null; 
}

export interface SectionInfo {
  id: string; 
  tagName: string; 
  outerHTML: string;
}