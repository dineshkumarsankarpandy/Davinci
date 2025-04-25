import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';

interface ColorPickerProps {
  initialColor: string; 
  onColorChange: (hsl: { h: number; s: number; l: number }) => void;
  isOpen: boolean;
  onClose: () => void;
}

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Number(s.toFixed(3)),
    l: Number(l.toFixed(3))
  };
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor,
  onColorChange,
  isOpen,
  onClose
}) => {
  const [tempColor, setTempColor] = useState(initialColor);
  
  useEffect(() => {
    setTempColor(initialColor);
  }, [initialColor, isOpen]);

  const handleTempColorChange = (color: any) => {
    setTempColor(color.hex);
  };
  
  const handleApplyColor = () => {
    const hsl = hexToHsl(tempColor);
    onColorChange(hsl);
    onClose();
  };

  return (
    <Dialog  open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      
      <DialogContent className="sm:max-w-[280px] p-2 gap-8 ml-150">
        <DialogTitle className="text-sm font-medium text-gray-900 p-4 border-b border-gray-200">
          pick a Color  
        </DialogTitle>
        <div className="p-4">
          <ChromePicker
            color={tempColor}
            onChange={handleTempColorChange}
            disableAlpha={true}
            styles={{
              default: {
                picker: {
                  width: '225px',  
                  boxShadow: 'none',
                },
              },
            }}
          />
        </div>
        
        <DialogFooter className="px-4 pb-4 gap-2 flex sm:justify-end">
          <button
            className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
            onClick={handleApplyColor}
          >
            Apply
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
};

export default ColorPicker;