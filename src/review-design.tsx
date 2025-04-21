import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { FileUp, Flame } from "lucide-react";

const DesignReview = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [selectedTab, setSelectedTab] = useState<string>("design-review");
  const [reviewText, setReviewText] = useState<string>("");
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle drag and drop functionality
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Simulate the review process
  const startReview = () => {
    if (!selectedFile) return;
    
    setReviewText("");
    setIsReviewing(true);
    
    // Simulate streaming text response
    const sampleReview = "Analyzing your design...\n\nStrengths:\n- Clean layout with good use of whitespace\n- Consistent color scheme that follows accessibility guidelines\n- Clear hierarchy of information\n\nAreas for improvement:\n- Consider increasing contrast for better readability\n- Button placement could be optimized for thumb reach on mobile\n- Add more visual cues for interactive elements";
    
    let i = 0;
    const interval = setInterval(() => {
      setReviewText(prev => prev + sampleReview.charAt(i));
      i++;
      if (i === sampleReview.length) {
        clearInterval(interval);
        setIsReviewing(false);
      }
    }, 20);
  };

  return (

    <div className="flex flex-row w-full min-h-screen bg-slate-50">
      {/* Left side - Form */}
      <div className="w-1/3 p-8 border-r border-gray-200">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800"> Design Review</h1>
          {/* <span className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-md flex items-center">
            + AI
          </span> */}
        </div>

        <p className="text-gray-600 mb-10">
          Enhance your designs, spark creativity with fresh ideas,
          and sharpen your UX skills with AI-based design reviews.
        </p>

        <div className="mb-8">
          <p className="text-gray-700 mb-4">1. Upload your design for UX review</p>
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p>Drag 'n' drop a single image here</p>
              <p className="my-2">- or -</p>
              <p>Click to select a file</p>
              {selectedFile && (
                <p className="mt-4 text-green-600 font-medium">Selected: {selectedFile.name}</p>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* <div className="mb-8">
          <p className="text-gray-700 mb-4">Use case</p>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="design-review" className="flex gap-2 justify-center">
                <div className={`p-2 ${selectedTab === 'design-review' ? 'text-purple-600' : 'text-gray-500'}`}>
                  <FileUp size={24} />
                </div>
                <span className={selectedTab === 'design-review' ? 'text-purple-600' : 'text-gray-500'}>
                  Design Review
                </span>
              </TabsTrigger>
              <TabsTrigger value="predictive-heatmap" className="flex gap-2 justify-center">
                <div className={`p-2 ${selectedTab === 'predictive-heatmap' ? 'text-purple-600' : 'text-gray-500'}`}>
                  <Flame size={24} />
                </div>
                <span className={selectedTab === 'predictive-heatmap' ? 'text-purple-600' : 'text-gray-500'}>
                  Predictive Heatmap
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div> */}

        <Button 
          onClick={startReview} 
          disabled={!selectedFile || isReviewing}
          className="w-full py-6 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
        >
          Start the review
        </Button>
      </div>

      {/* Right side - Response Area */}
      <div className="w-1/2 p-8 bg-white">
        <div className="h-full">
          {reviewText ? (
            <div className="whitespace-pre-line">
              {reviewText}
              {isReviewing && <span className="animate-pulse">|</span>}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {isReviewing ? (
                <p>Analyzing your design...</p>
              ) : (
                <p> AI-powered design review </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignReview;