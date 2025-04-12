import React, { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { SectionInfo } from '../types/type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionInfo: SectionInfo | null;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const RegenerateModal: React.FC<RegenerateModalProps> = ({ 
  isOpen, 
  onClose, 
  sectionInfo, 
  onSubmit, 
  isLoading 
}) => {
  const [promptValue, setPromptValue] = useState('');
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setPromptValue(''); // Reset prompt value when closing
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`Regenerate Section: ${sectionInfo?.id}`}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-3">Describe changes:</p>
          <Textarea 
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="e.g., Make this section about our team..." 
            className="min-h-[60px]"
          />
        </div>
        
        <DialogFooter>
          <Button
            onClick={() => onSubmit(promptValue)}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 
              <Loader2 size={16} className="mr-2 animate-spin" /> : 
              <Star size={14} className="mr-2" />
            }
            Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateModal;