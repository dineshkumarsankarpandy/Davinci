import React from 'react';
import { PanelLeftClose, PanelRightClose, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  projectName: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  projectName,
  isSidebarOpen,
  toggleSidebar,
  onSave,
  isSaving,
  canSave, 
}) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto max-w-md z-30 mt-3 px-1 py-1 bg-white rounded-lg shadow-md flex items-center justify-center gap-2 border border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-gray-600 hover:bg-gray-100"
        title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelRightClose size={18} />}
      </Button>
      <span className="text-sm font-medium text-gray-700 px-2 truncate" title={projectName}>
        {projectName || 'Loading Project...'}
      </span>
      <Button
        variant="default" 
        size="sm" 
        onClick={onSave}
        disabled={isSaving || !canSave} 
        className="h-8 px-3 bg-purple-500 hover:bg-purple-600 text-white"
        title={canSave ? 'Save Project' : 'Generate content to save'}
      >
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save size={16} className="mr-1.5" />
        )}
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
       <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')} className="h-8 w-8"><ArrowLeft   size={18}/></Button>
    </div>
  );
};

export default TopBar;