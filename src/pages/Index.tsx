import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { FormatToolbar } from '@/components/FormatToolbar';
import { TextEditor } from '@/components/TextEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { generatePDF } from '@/utils/pdfGenerator';
import { DocumentSettings, TextStyle } from '@/types/editor';
import { toast } from 'sonner';

const Index = () => {
  const [content, setContent] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
  });

  const [settings, setSettings] = useState<DocumentSettings>({
    fontFamily: 'sans',
    fontSize: 16,
    textColor: '#1a1a2e',
    textAlign: 'left',
    lineHeight: 1.6,
    headingLevel: 'p',
  });

  const handleTextStyleChange = (style: Partial<TextStyle>) => {
    setTextStyle((prev) => ({ ...prev, ...style }));
  };

  const handleSettingsChange = (newSettings: Partial<DocumentSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleFileLoad = (fileContent: string) => {
    setContent(fileContent);
  };

  const handleExport = () => {
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    try {
      generatePDF(content, settings, textStyle);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onFileLoad={handleFileLoad}
        onExport={handleExport}
        hasContent={content.trim().length > 0}
      />

      <div className="flex-1 flex flex-col p-6 gap-4">
        <FormatToolbar
          textStyle={textStyle}
          settings={settings}
          onTextStyleChange={handleTextStyleChange}
          onSettingsChange={handleSettingsChange}
        />

        <div className="flex-1 flex gap-6 min-h-0">
          <TextEditor
            content={content}
            settings={settings}
            textStyle={textStyle}
            onContentChange={setContent}
          />
          <PreviewPanel
            ref={previewRef}
            content={content}
            settings={settings}
            textStyle={textStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
