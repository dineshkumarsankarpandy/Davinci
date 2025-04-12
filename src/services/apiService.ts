import { GenerateResponse,RequestImagePayload } from "@/types/type";
const API_BASE_URL = "http://localhost:8000";

const ApiService = {
  generateWebsite: async (prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/api/generate-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const e = await response.text();
      throw new Error(`HTTP ${response.status}: ${e}`);
    }
    
    return await response.json();
  },
  
  generateMultipleWebsites: async (prompt: string, pages: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/generate-multiple-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, pages }),
    });
    
    if (!response.ok) {
      const e = await response.text();
      throw new Error(`HTTP ${response.status}: ${e}`);
    }
    
    const data = await response.json();
    return data.html_pages; 
  },
  
  regenerateSection: async (fullHtml: string, outerHtml: string, prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/api/regenerate-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullHtml: fullHtml,
        outerHtml: outerHtml,
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      const e = await response.text();
      throw new Error(`API ${response.status}: ${e}`);
    }
    
    return await response.json();
  },
  
  processWithAI: async (text: string, action: string) => {
    const response = await fetch(`${API_BASE_URL}/api/regenerate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        action: action,
      }),
    });
    
    if (!response.ok) {
      const e = await response.text();
      throw new Error(`API ${response.status}: ${e}`);
    }
    
    return await response.json();
  },
  
  generateFlow: async (prompt: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/generate-flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const e = await response.text();
      throw new Error(`Flow Generation Error ${response.status}: ${e}`);
    }

    const data: { page_names: string } = await response.json();

    try {
      const parsedPageNames = JSON.parse(data.page_names);
      if (Array.isArray(parsedPageNames) && parsedPageNames.every(item => typeof item === 'string')) {
        return parsedPageNames as string[];
      } else {
        console.error("Parsed page names is not a string array:", parsedPageNames);
        throw new Error("API returned invalid page names format.");
      }
    } catch (parseError) {
      console.error("Error parsing page_names string from API:", data.page_names, parseError);
      throw new Error("Failed to parse page names received from API.");
    }
  },
  

  generateHtmlFromImage: async (prompt: string, base64Str: string): Promise<GenerateResponse> => {
    const payload: RequestImagePayload = { prompt, base64Str };
    const response = await fetch(`${API_BASE_URL}/api/generate-html-from-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const e = await response.text();
      throw new Error(`Image Gen HTTP ${response.status}: ${e}`);
    }

    return await response.json();
  },

  enhancedPrompt: async (prompt:string) =>{
    const payload ={
      prompt
    }

    const response = await fetch(`${API_BASE_URL}/api/enhance-prompt`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
    });
    if(!response.ok) {
      const err = await response.text()
      throw new Error(`Error during enhancing the prompt: ${err} `);
    }
    return await response.json()
  }

};
export default ApiService;