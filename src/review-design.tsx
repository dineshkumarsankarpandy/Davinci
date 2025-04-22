import React, { useState, useCallback} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fileToBase64 } from "./lib/utils"; 
import { API_BASE_URL } from "./services/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const DesignReview = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>(""); 
  const [reviewText, setReviewText] = useState<string>("");
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type.startsWith('image/')) {
        setSelectedFile(e.target.files[0]);
        setReviewText("");
        setError(null); 
        // setUserPrompt(""); // Optional: Clear user prompt on new file selection? Decide based on desired UX.
      } else {
        setError("Please select an image file (png, jpg, gif, webp, etc.).")
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        setSelectedFile(e.dataTransfer.files[0]);
        setReviewText("");
        setError(null);
        // setUserPrompt(""); // Optional: Clear user prompt on new file drop?
      } else {
        setError("Please drop an image file (png, jpg, gif, webp, etc.).")
        setSelectedFile(null);
      }
    }
  };

  const handleUserPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
  };

  const startReview = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setReviewText('');
    setIsReviewing(true);
    setError(null);

    try {
      
      const base64String = await fileToBase64(selectedFile);

      const finalPrompt = userPrompt.trim()
        ? userPrompt.trim() 
        : "Provide a general UX/UI design review based on standard heuristics.";

      // 3. Get the mime type
    //   const mimeType = selectedFile.type;

      
      const payload = {
        prompt: finalPrompt,
        base64str: base64String, 
      };

      // 5. Make the API call using fetch for streaming
      const response = await fetch(`${API_BASE_URL}/review-design/generate-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
              const errorData = await response.json();
              errorBody += ` - ${errorData.detail || JSON.stringify(errorData)}`;
          } catch (e) {
              errorBody += ` - ${response.statusText}`;
          }
          throw new Error(errorBody);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get readable stream from response.');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; 
        }
        if (value) {
          const chunk = decoder.decode(value, { stream: true }); 
          setReviewText((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      console.error("Error during review process:", err);
      setError(err.message || 'An unknown error occurred during the review. Please try again.');
      setReviewText('');
    } finally {
      setIsReviewing(false);
    }
  }, [selectedFile, userPrompt]);

  return (
    <div className="flex flex-row w-full h-screen bg-slate-50 overflow-hidden">
      {/* Left side - Form */}
      <div className="w-1/3 p-8 border-r border-gray-200 flex flex-col overflow-y-auto"> 
        <div className="flex-grow">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Design Review</h1>
          </div>

          <p className="text-gray-600 mb-10">
            Enhance your designs, spark creativity with fresh ideas,
            and sharpen your UX skills with AI-based design reviews.
          </p>

          {/* --- File Upload Area --- */}
          <div className="mb-6"> 
            <p className="text-gray-700 font-medium mb-2">1. Upload your design</p>
            <div
              className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer transition-colors hover:border-blue-400 ${isReviewing ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
              onDragOver={!isReviewing ? handleDragOver : undefined}
              onDrop={!isReviewing ? handleDrop : undefined}
              onClick={() => !isReviewing && document.getElementById("file-upload")?.click()}
            >
              <div className="flex flex-col items-center justify-center text-gray-500">
                <svg className="w-12 h-12 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="text-sm">Drag 'n' drop image here</p>
                <p className="text-xs my-1">- or -</p>
                <Button type="button" variant="link" size="sm" className="text-xs" disabled={isReviewing}>
                  Click to select a file
                </Button>
                {selectedFile && !error && (
                    <p className="mt-2 text-xs text-green-600 font-medium">Selected: {selectedFile.name}</p>
                )}
                 {error && !selectedFile && ( 
                    <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
                 )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp" 
                className="hidden"
                onChange={handleFileChange}
                disabled={isReviewing}
              />
            </div>
          </div>

          {/* --- Optional Prompt Input --- */}
          <div className="mb-8">
            <label htmlFor="user-prompt" className="block text-gray-700 font-medium mb-2">
              2. Specific Instructions (Optional)
            </label>
            <Textarea
              id="user-prompt"
              value={userPrompt}
              onChange={handleUserPromptChange}
              placeholder="e.g., Focus on the checkout button accessibility, Check color contrast, Analyze the mobile layout..."
              rows={4}
              className="w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isReviewing}
            />
            <p className="text-xs text-gray-500 mt-1">Provide specific focus areas or questions for the AI.</p>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <Button
          onClick={startReview}
          disabled={!selectedFile || isReviewing}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md mt-auto disabled:opacity-50 disabled:cursor-not-allowed" // mt-auto pushes to bottom
        >
          {isReviewing ? (
             <div className="flex items-center justify-center">
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Reviewing...
             </div>
          ) : (
              'Start AI Review'
          )}
        </Button>
         {error && selectedFile && ( 
            <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* Right side - Response Area */}
      <div className="w-2/3 p-8 bg-white flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">AI Review Output</h2>
        <div className="flex-grow flex flex-col border border-gray-200 rounded-md overflow-hidden">
          <div className="overflow-y-auto flex-grow p-4 bg-gray-50"> 
            {isReviewing && !reviewText ? ( 
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Analyzing your design, please wait...</p>
              </div>
            ) : !isReviewing && !reviewText && !error ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Upload a design and click "Start AI Review" to see the analysis here.</p>
              </div>
            ) : ( 
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reviewText}
                </ReactMarkdown>
                {isReviewing && ( 
                  <span className="inline-block w-2 h-4 bg-gray-700 animate-pulse ml-1" aria-hidden="true"></span>
                )}
              </div>
            )}
          </div>
        </div>
        {error && !isReviewing && selectedFile && ( 
             <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                 <strong>Error:</strong> {error}
             </div>
         )}
      </div>
    </div>
  );
};

export default DesignReview;