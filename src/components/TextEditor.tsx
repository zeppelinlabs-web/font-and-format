import { useRef, useEffect } from 'react';
import { DocumentSettings, TextStyle, FONT_FAMILIES } from '@/types/editor';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  content: string;
  settings: DocumentSettings;
  textStyle: TextStyle;
  onContentChange: (content: string) => void;
}

export const TextEditor = ({ 
  content, 
  settings, 
  textStyle,
  onContentChange 
}: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== content) {
      editorRef.current.innerText = content;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerText);
    }
  };

  const fontClass = FONT_FAMILIES.find(f => f.value === settings.fontFamily)?.className || 'font-sans';

  const getHeadingStyles = () => {
    switch (settings.headingLevel) {
      case 'h1':
        return 'text-4xl font-bold';
      case 'h2':
        return 'text-2xl font-semibold';
      case 'h3':
        return 'text-xl font-medium';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 bg-editor rounded-xl p-6 overflow-auto">
      <div
        ref={editorRef}
        className={cn(
          "editor-content min-h-[600px] whitespace-pre-wrap outline-none",
          fontClass,
          getHeadingStyles(),
          textStyle.bold && "font-bold",
          textStyle.italic && "italic",
          textStyle.underline && "underline"
        )}
        contentEditable
        onInput={handleInput}
        style={{
          fontSize: `${settings.fontSize}px`,
          color: settings.textColor,
          textAlign: settings.textAlign,
          lineHeight: settings.lineHeight,
        }}
        data-placeholder="Start typing or paste your text here..."
        suppressContentEditableWarning
      />
    </div>
  );
};
