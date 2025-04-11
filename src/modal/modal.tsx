import React from 'react';
import { X } from 'lucide-react';

interface ModalProps { 
  title: string; 
  onClose: () => void; 
  children: React.ReactNode; 
  maxWidth?: string; 
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth = 'max-w-md' }) => (
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1050] flex items-center justify-center p-4" 
    onClick={onClose} 
    aria-modal="true" 
    role="dialog"
  >
    <div 
      className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} overflow-hidden`} 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" 
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default Modal;