import React from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { ContentHighlightInfo } from '../useContentHighlights';
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

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentInfo: ContentHighlightInfo | null;
  editContentValue: string;
  setEditContentValue: (value: string) => void;
  onSubmit: (newContent: string) => void;
  isLoading: boolean;
}

const EditContentModal: React.FC<EditContentModalProps> = ({ 
  isOpen, 
  onClose, 
  contentInfo, 
  editContentValue, 
  setEditContentValue, 
  onSubmit, 
  isLoading 
}) => {
  if (!isOpen || contentInfo?.tagName === 'img') return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`Edit Content (<${contentInfo?.tagName}>)`}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-3">Modify text:</p>
          <Textarea 
            value={editContentValue} 
            onChange={(e) => setEditContentValue(e.target.value)} 
            className="min-h-[100px]"
          />
        </div>
        
        <DialogFooter>
          <Button
            onClick={() => onSubmit(editContentValue)}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? 
              <Loader2 size={16} className="mr-2 animate-spin" /> : 
              <Pencil size={14} className="mr-2" />
            }
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentModal;