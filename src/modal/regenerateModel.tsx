import React from 'react';
import { Loader2, Star } from 'lucide-react';
import Modal from './modal';
import { SectionInfo } from '../types/type';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionInfo: SectionInfo | null;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const RegenerateModal: React.FC<RegenerateModalProps> = ({ isOpen, onClose, sectionInfo, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  return (
    <Modal title={`Regenerate Section (#${sectionInfo?.id})`} onClose={onClose}>
      <p className="text-sm text-gray-600 mb-3">Describe changes:</p>
      <textarea 
        placeholder="e.g., Make this section about our team..." 
        className="w-full p-2 border rounded mb-4 text-sm min-h-[60px]" 
        id="regenerate-prompt-textarea" 
      />
      <button 
        onClick={() => onSubmit((document.getElementById('regenerate-prompt-textarea') as HTMLTextAreaElement)?.value || '')} 
        disabled={isLoading} 
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {isLoading ? 
          <Loader2 size={16} className="animate-spin mr-2" /> : 
          <Star size={14} className="mr-2" />
        }
        Regenerate
      </button>
    </Modal>
  );
};

export default RegenerateModal;