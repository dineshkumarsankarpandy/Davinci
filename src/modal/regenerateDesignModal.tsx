import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RegenerateDesignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
  sectionName?: string;
}

const RegenerateDesignDialog: React.FC<RegenerateDesignDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialPrompt = '',
  sectionName = 'home'
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Regenerate Design
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="changes" className="block text-sm font-medium text-gray-700 mb-2">
                Describe changes:
              </label>
              <Textarea
                id="changes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make this section about our team..."
                className="w-full border border-gray-300 rounded-md min-h-[120px] focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
              disabled={isLoading}
            >
              <Star className="mr-2 h-5 w-5" />
              Regenerate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateDesignDialog;