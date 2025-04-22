// src/components/BottomBar.tsx
import React, { useCallback } from 'react';
import { ReactInfiniteCanvasHandle } from 'react-infinite-canvas';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, Frame } from 'lucide-react';
import toast from 'react-hot-toast';

import { Selection } from 'd3-selection';
import 'd3-transition';
import { ZoomBehavior } from 'd3-zoom';

interface BottomBarProps {
  canvasRef: React.RefObject<ReactInfiniteCanvasHandle | null>;
  currentZoom: number;
}

type CanvasNodeType = SVGSVGElement | HTMLDivElement;
type CanvasSelection = Selection<CanvasNodeType, unknown, null, undefined>;
type CanvasZoomBehavior = ZoomBehavior<CanvasNodeType, unknown>;


const BottomBar: React.FC<BottomBarProps> = ({ canvasRef, currentZoom }) => {

  const handleZoom = useCallback((factor: number) => {
    const currentRef = canvasRef.current;
    if (!currentRef) {
        console.warn("Canvas ref not available yet for zoom action.");
        toast.error("Canvas not ready.");
        return;
    }

    try {
        const canvasState = currentRef.getCanvasState();

        // Use specific types and provide checks
        const zoomBehavior = canvasState?.d3Zoom as CanvasZoomBehavior | undefined;
        const canvasNodeSelection = canvasState?.canvasNode as CanvasSelection | undefined;

        if (!zoomBehavior || !canvasNodeSelection || canvasNodeSelection.empty()) {
            console.warn("Canvas state, selection, or zoom behavior not available.");
            toast.error("Zoom controls unavailable.");
            return;
        }

        // --- D3 Transition and Zoom ---
        // 1. Start a transition on the selection.
        // 2. Set the duration for this transition.
        // 3. Call the zoom behavior's method on the transitioning selection.
        canvasNodeSelection
            .transition() // Start a default transition
            .duration(150) // Set the duration on the transition object
            .call(zoomBehavior.scaleBy, factor); // Call scaleBy

    } catch (error) {
        console.error("Error during zoom action:", error);
        toast.error("Zoom failed.");
    }
  }, [canvasRef]);

  // handleZoomIn and handleZoomOut remain the same
  const handleZoomIn = useCallback(() => {
    handleZoom(1.2);
  }, [handleZoom]);

  const handleZoomOut = useCallback(() => {
    handleZoom(1 / 1.2);
  }, [handleZoom]);

  // handleFitContent remains the same
  const handleFitContent = useCallback(() => {
    if (!canvasRef.current) {
        console.warn("Canvas ref not available yet for fit content action.");
        toast.error("Canvas not ready.");
        return;
    }
    canvasRef.current.fitContentToView({ duration: 300 });
  }, [canvasRef]);

  const formattedZoom = `${Math.round(currentZoom * 100)}%`;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-md flex items-center space-x-1 border border-gray-200 dark:border-gray-700">
        {/* Zoom Out Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomOut} aria-label="Zoom Out">
              <ZoomOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Zoom Out</p></TooltipContent>
        </Tooltip>

        {/* Zoom Level Display */}
        <Tooltip>
           <TooltipTrigger asChild>
             <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 min-w-[50px] text-center tabular-nums cursor-default">
                {formattedZoom}
             </span>
          </TooltipTrigger>
           <TooltipContent><p>Current Zoom</p></TooltipContent>
        </Tooltip>

        {/* Zoom In Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} aria-label="Zoom In">
              <ZoomIn className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Zoom In</p></TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="h-6 border-l border-gray-300 dark:border-gray-600 mx-1"></div>

        {/* Fit Content Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleFitContent} aria-label="Fit Content">
              <Frame className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Fit Content to View</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default BottomBar;