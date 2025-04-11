import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  isUpdating: boolean;
  progress?: number; // Optional progress percentage (0-100)
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  isUpdating,
  progress 
}) => {
  if (!isLoading && !isUpdating) return null;

  // Figma-style loading indicator
  if (isUpdating) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
          {/* Progress bar (Figma style) */}
          <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out" 
              style={{ width: progress ? `${progress}%` : '60%', 
                       animation: !progress ? 'pulse 1.5s infinite' : 'none' }}
            />
          </div>
          <p className="text-gray-600 text-sm font-medium">
            {progress ? `${Math.round(progress)}% complete` : 'Updating...'}
          </p>
        </div>
      </div>
    );
  }

  // Full-screen loading (Figma file opening style)
  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
      <div className="flex flex-col items-center">
        {/* Figma-style pulsing dot loader */}
        <div className="flex space-x-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full"
              style={{
                animation: `fadeInOut 1.5s infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>
        <p className="text-gray-700 font-medium">Loading content</p>
        <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
      </div>

      {/* Global animation styles */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { width: 20%; }
          50% { width: 60%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;