import React from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './modal';
import { ContentHighlightInfo } from '../useContentHighlights';

interface AskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentInfo: ContentHighlightInfo | null;
  onSubmit: (action: string) => void;
  isLoading: boolean;
}

const AskAIModal: React.FC<AskAIModalProps> = ({ isOpen, onClose, contentInfo, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  const aiActions = [
    'Summarize', 
    'Make Shorter', 
    'Make Longer', 
    'Improve Writing', 
    'Change Tone (Professional)', 
    'Change Tone (Casual)'
  ];

  const filteredActions = aiActions.filter(
    action => contentInfo?.tagName !== 'img' || !['Make Shorter', 'Make Longer'].includes(action)
  );

  return (
    <Modal title="Ask AI" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-3">Choose AI action:</p>
      <div className="text-xs p-2 border bg-gray-50 rounded mb-4 max-h-24 overflow-auto custom-scrollbar">
        {contentInfo?.tagName === 'img' ? (
          <img src={contentInfo.src || ''} alt="Selected" className="max-h-20 mx-auto" />
        ) : (
          <p className="italic">
            "{contentInfo?.textContent?.substring(0, 150)}
            {contentInfo?.textContent && contentInfo.textContent.length > 150 ? '...' : ''}"
          </p>
        )}
      </div>
      <div className="space-y-2">
        {filteredActions.map(action => (
          <button 
            key={action} 
            onClick={() => onSubmit(action)} 
            disabled={isLoading} 
            className="w-full text-left text-sm px-3 py-2 border rounded hover:bg-sky-50 hover:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50"
          >
            {action}
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="mt-3 flex items-center justify-center text-sm text-sky-600">
          <Loader2 size={16} className="animate-spin mr-2" /> Processing...
        </div>
      )}
    </Modal>
  );
};

export default AskAIModal;