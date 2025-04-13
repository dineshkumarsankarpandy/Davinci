import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { ToolbarPlugin } from './tootTip'

interface MarkdownEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (content: string) => void;
  pages?: string[];
  onPagesChange?: (pages: string[]) => void;
  referenceImagePreview?: string | null;
}

const InitializePlugin: React.FC<{ initialValue: string }> = ({ initialValue }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      const text = $createTextNode(initialValue);
      paragraph.append(text);
      root.append(paragraph);
    });
  }, [editor, initialValue]);

  return null;
};

const MarkdownEditorDialog: React.FC<MarkdownEditorDialogProps> = ({
  isOpen,
  onClose,
  initialValue,
  onSave,
  pages = [],
  onPagesChange,
  referenceImagePreview = null,
}) => {
  const [markdown, setMarkdown] = useState<string>(initialValue);
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'flow'>('write');
  const [localPages, setLocalPages] = useState<string[]>(pages);
  const [newPageName, setNewPageName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMarkdown(initialValue);
      setLocalPages(pages);
    }
  }, [isOpen, initialValue, pages]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(markdown);
    if (onPagesChange) {
      onPagesChange(localPages);
    }
    onClose();
  };

  const handleAddPage = () => {
    if (newPageName.trim()) {
      setLocalPages(prevPages => [...prevPages, newPageName.trim()]);
      setNewPageName('');
    }
  };

  const handleRemovePage = (indexToRemove: number) => {
    setLocalPages(prevPages => prevPages.filter((_, index) => index !== indexToRemove));
  };

  // Lexical configuration for editor
  const editorConfig = {
    namespace: 'MarkdownEditor',
    onError: (error: Error) => console.error(error),
  };

  // Plugin to capture editor state changes
  const EditorStatePlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const textContent = root.getTextContent();
          setMarkdown(textContent);
        });
      });
    }, [editor]);
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-3/4 h-3/4 max-w-4xl flex flex-col">
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Context Editor</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 rounded-lg flex text-sm">
             
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-0 overflow-hidden">
          {activeTab === 'write' && (
            <div className="h-full flex flex-col">
              {/* If you have a reference image, display it at the top */}
              {referenceImagePreview && (
                <div className="p-4 border-b">
                  <div className="relative border rounded-md overflow-hidden w-full max-h-32">
                    <img
                      src={referenceImagePreview}
                      alt="Reference"
                      className="w-full h-32 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex-grow overflow-hidden">
                <LexicalComposer initialConfig={editorConfig}>
                  {/* Optional toolbar plugin */}
                  <div className="border-b p-2 bg-gray-50 flex items-center">
                    <ToolbarPlugin />
                  </div>
                  
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable className="w-full h-full p-4 resize-none focus:outline-none border-2 border-transparent focus:border-blue-200 overflow-auto transition-colors" />
                    }
                    placeholder={
                      <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                        Write your markdown content here...
                      </div>
                    }
                    ErrorBoundary={({ children }) => <>{children}</>}
                  />
                  <HistoryPlugin />
                  <InitializePlugin initialValue={initialValue} />
                  <EditorStatePlugin />
                </LexicalComposer>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <ScrollArea className="h-full w-full">
              <div className="p-4 prose max-w-none">
                {/* You can use a markdown renderer here, or simple formatting */}
                <div className="whitespace-pre-wrap">{markdown}</div>
              </div>
            </ScrollArea>
          )}

          {activeTab === 'flow' && (
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-page">Add Page to Flow</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-page"
                      type="text"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      placeholder="Page Name (e.g., About Us)"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPage(); } }}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      onClick={handleAddPage}
                      disabled={!newPageName.trim()}
                      variant="secondary"
                      size="icon"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Added Pages:</Label>
                  {localPages.length > 0 ? (
                    <ul className="space-y-2 max-h-80 overflow-auto">
                      {localPages.map((page, index) => (
                        <li key={`${page}-${index}`} className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded-md">
                          <Badge variant="outline" className="px-2 py-1 font-normal break-all text-left">
                            {page}
                          </Badge>
                          <Button
                            type="button"
                            onClick={() => handleRemovePage(index)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-md">
                      No pages added yet. Add pages to create a flow.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Context
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MarkdownEditorDialog;