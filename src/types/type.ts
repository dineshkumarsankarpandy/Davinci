import { ContentHighlightInfo } from '../useContentHighlights';

export interface CanvasTransformState {
  k: number;
  x: number;
  y: number;
}

export interface PositionData {
  x: number;
  y: number;
}

export interface WebsiteSizeData {
  width: number;
  height: number;
}

export interface WebsiteData {
  id: string;
  title: string;
  htmlContent: string;
  position: PositionData;
  height?: number;
  width?: number;
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

// --- API Payloads ---

export interface RequestImagePayload {
  prompt: string;
  base64Str: string;
}

export interface GenerateResponse {
  html: string;
}

export interface GenerateEnhancedPrompt {
  enhanced_prompt: string;
}

export interface RegenerateWebsiteContentText {
  text: string;
}

export interface GenerateMultiplePages {
  html_pages: string[];
}

export interface ProjectResponse {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
  updated_at: Date; 
  created_by: number;
}

// --- Canvas Save ---

export interface ScreenVersionSaveData {
  id: string;
  title: string;
  htmlContent: string;
}

export interface ScreenSaveData {
  baseFrontendId: string;
  title: string;
  position: PositionData;
  width?: number;
  height?: number;
  pageName?: string | null;
  versions: ScreenVersionSaveData[];
}

export interface GroupSaveData {
  frontendId: string;
  name?: string | null;
  position: PositionData;
  size?: WebsiteSizeData | null;
  screens: ScreenSaveData[];
}

export interface CanvasSaveRequest {
  groups: GroupSaveData[];
}

export interface CanvasSaveResponse {
  message: string;
  project_id: number;
}

// --- Canvas Load ---

export interface ScreenVersionRead {
  id: number; // DB ID
  screen_id: number;
  version_number: number;
  html_content: string;
  created_at: string;
  created_by: number;
}

export interface ScreenMetadataRead {
  position?: PositionData | null;
  size?: WebsiteSizeData | null;
  frontendId?: string | null;
  pageName?: string | null;
}

export interface ScreenRead {
  id: number; // DB ID
  group_id: number;
  title?: string | null;
  current_version_number: number;
  current_html_content?: string | null;
  metadata?: ScreenMetadataRead | null; 
  created_at: string; 
  created_by: number;
  updated_at: string;
  updated_by?: number | null;
  versions: ScreenVersionRead[];
}

export interface GroupMetadataRead {
  position?: PositionData | null;
  size?: WebsiteSizeData | null;
  frontendId?: string | null;
}

export interface GroupRead {
  id: number; 
  project_id: number;
  name?: string | null;
  created_at: string; 
  created_by: number;
  metadata?: GroupMetadataRead | null; 
  screens: ScreenRead[];
}

export interface CanvasLoadResponse {
  project_id: number;
  project_name: string;
  groups: GroupRead[];
}

// --- Design Review ---
export interface DesignReviewRequest {
  prompt: string;
  base64Str: string;
}

export interface DesignReviewResponse {
  text: string;
}



export type ContentActionType = 'edit-content' | 'ask-ai'; // Define valid content actions