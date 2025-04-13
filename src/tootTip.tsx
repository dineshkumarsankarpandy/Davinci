import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo 
} from 'lucide-react';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';

export const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUndo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const formatRedo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const formatHeading = (level: 1 | 2) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const buttonClass = "p-1 rounded hover:bg-gray-200 transition-colors";

  return (
    <div className="flex items-center space-x-1 overflow-x-auto">
      <button 
        onClick={formatBold} 
        className={buttonClass} 
        title="Bold"
        type="button"
      >
        <Bold size={18} />
      </button>
      <button 
        onClick={formatItalic} 
        className={buttonClass} 
        title="Italic"
        type="button"
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <button 
        onClick={() => formatHeading(1)} 
        className={buttonClass} 
        title="Heading 1"
        type="button"
      >
        <Heading1 size={18} />
      </button>
      <button 
        onClick={() => formatHeading(2)} 
        className={buttonClass} 
        title="Heading 2"
        type="button"
      >
        <Heading2 size={18} />
      </button>
      <button 
        onClick={formatParagraph} 
        className={buttonClass} 
        title="Paragraph"
        type="button"
      >
        <AlignLeft size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <button 
        onClick={formatUndo} 
        className={buttonClass} 
        title="Undo"
        type="button"
      >
        <Undo size={18} />
      </button>
      <button 
        onClick={formatRedo} 
        className={buttonClass} 
        title="Redo"
        type="button"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default ToolbarPlugin;