import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormatToolbar } from '@/components/FormatToolbar';
import { BlockEditor, BlockEditorRef, FormatState } from '@/components/BlockEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { PageLayoutPanel } from '@/components/PageLayoutPanel';
import { FileUpload } from '@/components/FileUpload';
import { generatePDF } from '@/utils/pdfGenerator';
import { pdfExportLimiter, imageUploadLimiter } from '@/utils/rateLimiter';
import { PageLayout } from '@/types/editor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  PanelLeftClose, 
  PanelLeft, 
  Download, 
  Home,
  Pencil,
  Check,
  X
} from 'lucide-react';

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
  blockquote: false,
  codeBlock: false,
};

const Editor = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [content, setContent] = useState('<p><br></p>');
  const [hasSelection, setHasSelection] = useState(false);
  const [formatState, setFormatState] = useState<FormatState>(defaultFormatState);
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = useCallback((command: string, value?: string) => {
    editorRef.current?.applyFormat(command, value);
  }, []);

  const handleInsertImage = useCallback((file: File) => {
    if (!imageUploadLimiter.canMakeRequest()) {
      const timeUntilReset = imageUploadLimiter.getFormattedTimeUntilReset();
      toast.error(`Image upload limit reached. Try again in ${timeUntilReset}.`);
      return;
    }
    
    imageUploadLimiter.recordRequest();
    editorRef.current?.insertImage(file);
    
    const remaining = imageUploadLimiter.getRemainingRequests();
    if (remaining <= 3) {
      toast.warning(`${remaining} image upload${remaining !== 1 ? 's' : ''} remaining this hour`);
    }
  }, []);

  const handleInsertLink = useCallback((url: string) => {
    editorRef.current?.insertLink(url);
  }, []);

  const handleFileLoad = useCallback((fileContent: string) => {
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

    if (!pdfExportLimiter.canMakeRequest()) {
      const timeUntilReset = pdfExportLimiter.getFormattedTimeUntilReset();
      toast.error(`Export limit reached. Try again in ${timeUntilReset}.`);
      return;
    }

    try {
      pdfExportLimiter.recordRequest();
      generatePDF(content, pageLayout, documentName);
      toast.success('PDF exported successfully!');
      
      const remaining = pdfExportLimiter.getRemainingRequests();
      if (remaining <= 3) {
        toast.info(`${remaining} export${remaining !== 1 ? 's' : ''} remaining this hour`);
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  }, [content, pageLayout, hasContent, documentName]);

  const startEditingName = () => {
    setTempName(documentName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const saveName = () => {
    const newName = tempName.trim() || 'Untitled Document';
    setDocumentName(newName);
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setTempName('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      cancelEditingName();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-[#274364] border-b border-border">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
            title="Back to Home"
          >
            <Home className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src="/logo.svg" alt="Font and Format" className="w-6 h-6 md:w-8 md:h-8 rounded flex-shrink-0" />
            
            {/* Document Name */}
            {isEditingName ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  ref={nameInputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onBlur={saveName}
                  className="h-8 flex-1 min-w-0 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                  placeholder="Document name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveName}
                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditingName}
                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={startEditingName}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-2 py-1 rounded transition-colors group min-w-0 flex-1"
              >
                <span className="font-medium text-sm md:text-base truncate">{documentName}</span>
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Mobile Layout Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 p-2"
            title="Layout Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <FileUpload onFileLoad={handleFileLoad} />
          <Button 
            onClick={handleExport}
            disabled={!hasContent}
            className="gap-1 md:gap-2 bg-[#3FBCBA] hover:bg-[#35a5a3] text-white text-xs md:text-sm px-2 md:px-4"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </header>

      {/* Mobile Layout Panel - Collapsible */}
      {sidebarOpen && (
        <div className="lg:hidden border-b bg-card">
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-medium">Page Layout</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <PageLayoutPanel
            layout={pageLayout}
            onLayoutChange={setPageLayout}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar - Hidden on mobile */}
        <div className={`hidden lg:flex border-r bg-card transition-all duration-300 flex-col ${sidebarOpen ? 'w-64' : 'w-12'}`}>
          <div className="flex items-center justify-between p-2 border-b">
            {sidebarOpen && <span className="text-sm font-medium">Page Layout</span>}
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col p-3 md:p-6 gap-3 md:gap-4">
            <FormatToolbar
              onFormat={handleFormat}
              onInsertImage={handleInsertImage}
              onInsertLink={handleInsertLink}
              hasSelection={hasSelection}
              formatState={formatState}
            />

            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">
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

export default Editor;
