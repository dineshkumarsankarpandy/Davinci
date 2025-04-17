// components/FontSelector.tsx
import React, { useState } from 'react';
import { X, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FontSelectorProps {
  selectedFont: string | null;
  onFontChange: (font: string | null) => void;
  availableFonts: string[];
}

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
  availableFonts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedFont, setTempSelectedFont] = useState<string | null>(selectedFont);
  
  // Filter fonts based on search query
  const filteredFonts = searchQuery 
    ? availableFonts.filter(font => 
        font.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableFonts;

  const handleFontSelect = (font: string) => {
    setTempSelectedFont(font);
  };

  const handleClearFont = () => {
    setTempSelectedFont(null);
  };

  const handleSave = () => {
    onFontChange(tempSelectedFont);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When opening, set temp selection to current selection
      setTempSelectedFont(selectedFont);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="flex items-center px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Type size={14} className="mr-1.5" />
          <span className="mr-1">
            {selectedFont || "Default Font"}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" style={{ maxWidth: "400px", marginLeft:'575px' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Font Styling</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X size={18} />
          </DialogClose>
        </DialogHeader>
        
        {/* Search bar */}
        <div className="py-3">
          <input
            type="text"
            placeholder="Search fonts..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Font grid */}
        <div className="grid grid-cols-2 gap-4 p-1 overflow-y-auto" style={{ maxHeight: '350px' }}>
          {filteredFonts.map((font) => (
            <div 
              key={font}
              className={`p-4 border rounded-md text-center cursor-pointer transition-colors duration-150 ${tempSelectedFont === font ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-400'}`}
              onClick={() => handleFontSelect(font)}
              style={{ fontFamily: `"${font}", sans-serif` }}
            >
              <div className="text-4xl mb-1">Ag</div>
              <div className="text-sm text-gray-600">{font}</div>
            </div>
          ))}
        </div>
        
        {/* Save button */}
        <DialogClose asChild>
          <button
            onClick={handleSave}
            className="w-full mt-4 py-3 font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Save
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default FontSelector;