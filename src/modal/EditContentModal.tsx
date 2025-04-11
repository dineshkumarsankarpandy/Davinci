import React from 'react';
import { Loader2, Pencil } from 'lucide-react';
import Modal from './modal';
import { ContentHighlightInfo } from '../useContentHighlights';

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
    <Modal title={`Edit Content (<${contentInfo?.tagName}>)`} onClose={onClose}>
      <p className="text-sm text-gray-600 mb-3">Modify text:</p>
      <textarea 
        value={editContentValue} 
        onChange={(e) => setEditContentValue(e.target.value)} 
        className="w-full p-2 border rounded mb-4 text-sm min-h-[100px]" 
      />
      <button 
        onClick={() => onSubmit(editContentValue)} 
        disabled={isLoading} 
        className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {isLoading ? 
          <Loader2 size={16} className="animate-spin mr-2" /> : 
          <Pencil size={14} className="mr-2" />
        }
        Save Changes
      </button>
    </Modal>
  );
};

export default EditContentModal;