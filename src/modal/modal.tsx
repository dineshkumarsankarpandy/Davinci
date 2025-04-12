import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ModalProps { 
  title: string; 
  onClose: () => void; 
  children: React.ReactNode; 
  maxWidth?: string; 
  isOpen: boolean; // Added isOpen prop to control dialog state
}

const Modal: React.FC<ModalProps> = ({ 
  title, 
  onClose, 
  children, 
  maxWidth = 'max-w-md',
  isOpen 
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent 
      className={`${maxWidth}`} 
      onInteractOutside={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <DialogHeader className="border-b pb-2">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" asChild>
            <button aria-label="Close">
              <X size={20} />
            </button>
          </DialogClose>
        </div>
      </DialogHeader>
      <div className="p-2">{children}</div>
    </DialogContent>
  </Dialog>
);

export default Modal;