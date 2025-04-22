import { GenerateResponse, RequestImagePayload, GenerateEnhancedPrompt,
   RegenerateWebsiteContentText, GenerateMultiplePages,
   ProjectResponse, CanvasSaveResponse, CanvasLoadResponse, CanvasSaveRequest, 
   DesignReviewResponse,
   DesignReviewRequest} from "@/types/type";
import apiClient from "./api";
import { getErrorMessage } from "@/lib/errorHandling";

const ApiService = {
  generateWebsite: async (prompt: string): Promise<GenerateResponse> => {
    try {
      const response = await apiClient.post<GenerateResponse>("/canvas/generate-html", { prompt });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  generateMultipleWebsites: async (prompt: string, pages: string[]): Promise<GenerateMultiplePages> => {
    try {
      const response = await apiClient.post<GenerateMultiplePages>("/canvas/generate-multiple-html", {
        prompt,
        pages,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  regenerateSection: async (fullHtml: string, outerHtml: string, prompt: string) => {
    try {
      const response = await apiClient.post<{ updated_html: string }>("/canvas/regenerate-section", {
        fullHtml: fullHtml,
        outerHtml: outerHtml,
        prompt: prompt,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  processWithAI: async (text: string, action: string): Promise<RegenerateWebsiteContentText> => {
    try {
      const response = await apiClient.post<RegenerateWebsiteContentText>("/canvas/regenerate-text", {
        text: text,
        action: action,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  generateFlow: async (prompt: string): Promise<string[]> => {
    try {
      const response = await apiClient.post<{ page_names: string }>("/canvas/generate-flow", { prompt });
      const data = response.data;

      try {
        const parsedPageNames = JSON.parse(data.page_names);
        if (Array.isArray(parsedPageNames) && parsedPageNames.every((item) => typeof item === "string")) {
          return parsedPageNames as string[];
        } else {
          console.error("Parsed page names is not a string array:", parsedPageNames);
          throw new Error("API returned invalid page names format.");
        }
      } catch (parseError) {
        console.error("Error parsing page_names string from API:", data.page_names, parseError);
        throw new Error("Failed to parse page names received from API.");
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  generateHtmlFromImage: async (prompt: string, base64Str: string): Promise<GenerateResponse> => {
    const payload: RequestImagePayload = { prompt, base64Str };
    try {
      const response = await apiClient.post<GenerateResponse>("/canvas/generate-html-from-image", payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  enhancedPrompt: async (prompt: string): Promise<GenerateEnhancedPrompt> => {
    try {
      const response = await apiClient.post<GenerateEnhancedPrompt>("/canvas/enhance-prompt", { prompt });
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },


  regenerateDesign: async (prompt: string, htmlContent: string): Promise<GenerateResponse> => {
    try {
      const response = await apiClient.post<GenerateResponse>("/canvas/regenerate-design", {
        prompt,
        htmlContent,
      });
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  createProject: async (projectName: string): Promise<ProjectResponse> => {
    try {
      const response = await apiClient.post('/projects/', { name: projectName });
      return response.data;
    } catch (error) {
      console.error("API Error creating project:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  getAllProjects: async (): Promise<ProjectResponse[]> =>{
        try{
            const response = await apiClient.get<ProjectResponse[]>('/projects/get-all-projects')
            return response.data;
        }
        catch(err){
          console.error("API Error fetching projects:", err);
          throw new Error(getErrorMessage(err));
        }
  },

  getProjectById: async (projectId: number | string): Promise<ProjectResponse> => {
    try {
      const response = await apiClient.get<ProjectResponse>(`/projects/get-project-name/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`API Error fetching project ${projectId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  saveCanvasState: async (projectId: number | string, payload: CanvasSaveRequest): Promise<CanvasSaveResponse> => {
    try {
      const response = await apiClient.put<CanvasSaveResponse>(`/canvas/save-changes/${projectId}`, payload);
      return response.data;
    } catch (error) {
      console.error(`API Error saving canvas state for project ${projectId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },


  getCanvasState: async (projectId: number | string): Promise<CanvasLoadResponse> => {
    try {
        const response = await apiClient.get<CanvasLoadResponse>(`/projects/get-projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error(`API Error fetching canvas state for project ${projectId}:`, error);
        if (!(error as any).response || (error as any).response.status !== 401) {
            throw new Error(getErrorMessage(error));
        }
        throw error;
    }
},

startReveiw: async (payload: DesignReviewRequest): Promise<DesignReviewResponse> => {

  try{
    const response = await apiClient.post<DesignReviewResponse>('/review-design/generate-review', payload);
    return response.data;
  }
  catch(error){
    console.error("API Error during design review:", error);
    throw new Error(getErrorMessage(error));
  }
},

};

export default ApiService;