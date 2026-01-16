import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FormatToolbar } from '@/components/FormatToolbar';
import { BlockEditor, BlockEditorRef, FormatState } from '@/components/BlockEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { PageLayoutPanel } from '@/components/PageLayoutPanel';
import { generatePDF } from '@/utils/pdfGenerator';
import { PageLayout } from '@/types/editor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Settings, PanelLeftClose, PanelLeft } from 'lucide-react';

const defaultFormatState: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  justifyLeft: true,
  justifyCenter: false,
  justifyRight: false,
  justifyFull: false,
  insertUnorderedList: false,
  insertOrderedList: false,
  heading: 'p',
};

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [content, setContent] = useState('<p><br></p>');
  const [hasSelection, setHasSelection] = useState(false);
  const [formatState, setFormatState] = useState<FormatState>(defaultFormatState);
  const [pageLayout, setPageLayout] = useState<PageLayout>({
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerText: '',
    footerText: '',
    headerHeight: 10,
    footerHeight: 10,
    showHeader: false,
    showFooter: false,
  });
  
  const editorRef = useRef<BlockEditorRef>(null);

  const handleFormat = useCallback((command: string, value?: string) => {
    editorRef.current?.applyFormat(command, value);
  }, []);

  const handleFileLoad = useCallback((fileContent: string) => {
    // Convert plain text to HTML paragraphs
    const paragraphs = fileContent.split(/\n\n+/).filter(p => p.trim());
    const htmlContent = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    setContent(htmlContent || '<p><br></p>');
  }, []);

  const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0;

  const handleExport = useCallback(() => {
    if (!hasContent) {
      toast.error('Please add some content first');
      return;
    }

    try {
      generatePDF(content, pageLayout);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  }, [content, pageLayout, hasContent]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onFileLoad={handleFileLoad}
        onExport={handleExport}
        hasContent={hasContent}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className={`border-r bg-card transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-12'}`}>
          {/* Toggle Button */}
          <div className="flex items-center justify-between p-2 border-b">
            {sidebarOpen && <span className="text-sm font-medium">Sidebar</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 h-8 w-8"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
          </div>

          {sidebarOpen ? (
            <PageLayoutPanel
              layout={pageLayout}
              onLayoutChange={setPageLayout}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-1 h-8 w-8"
                title="Layout Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col p-6 gap-4">
            <FormatToolbar
              onFormat={handleFormat}
              hasSelection={hasSelection}
              formatState={formatState}
            />

            <div className="flex-1 flex gap-6 min-h-0">
              <BlockEditor
                ref={editorRef}
                content={content}
                onContentChange={setContent}
                onSelectionChange={setHasSelection}
                onFormatStateChange={setFormatState}
              />
              <PreviewPanel
                content={content}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
