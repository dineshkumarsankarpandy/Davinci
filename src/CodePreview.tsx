// src/components/CodePreview.tsx

import React, { useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import MonacoEditor from '@monaco-editor/react';

interface CodePreviewProps {
  code: string;
  language: string;
  readOnly?: boolean;
  options?: any;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language, readOnly = false, options }) => {
  const [editorHeight, setEditorHeight] = useState(200); // Initial height
  const editorRef = useRef<any | null>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Set a fixed height, or calculate based on content if needed
    const lineCount = editor.getModel()?.getLineCount() || 10;
    const lineHeight = editor.getOptions().get(monaco.editor.EditorOption.lineHeight);
    const calculatedHeight = lineCount * lineHeight + 20; // Add some padding
    setEditorHeight(calculatedHeight);
  };

  const editorOptions = {
    ...options,
    readOnly: readOnly, //Enables the monaco from being edited 
    automaticLayout: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  };

  return (
    
      <MonacoEditor
        height={editorHeight}
        language={language}
        value={code}
        options={editorOptions}
        onMount={handleEditorDidMount}
      />
    
  );
};

export default CodePreview;