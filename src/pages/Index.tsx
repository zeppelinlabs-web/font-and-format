import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FormatToolbar } from '@/components/FormatToolbar';
import { BlockEditor } from '@/components/BlockEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { DocumentOutline } from '@/components/DocumentOutline';
import { PageLayoutPanel } from '@/components/PageLayoutPanel';
import { generatePDF } from '@/utils/pdfGenerator';
import {
  TextBlock,
  BlockStyle,
  DEFAULT_BLOCK_STYLE,
  createBlock,
  DocumentSettings,
  PageLayout
} from '@/types/editor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileText, Settings, List } from 'lucide-react';

const Index = () => {
  const [blocks, setBlocks] = useState<TextBlock[]>([
    createBlock('', DEFAULT_BLOCK_STYLE),
  ]);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    fontFamily: 'sans',
    fontSize: 16,
    textColor: '#1a1a2e',
    textAlign: 'left',
    lineHeight: 1.6,
    headingLevel: 'p',
    showDocumentOutline: true,
    showRuler: false,
  });
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
  const [activePanel, setActivePanel] = useState<'outline' | 'layout' | null>('outline');
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedBlocks = blocks.filter(b => selectedBlockIds.includes(b.id));

  const handleStyleChange = useCallback((styleUpdate: Partial<BlockStyle>) => {
    if (selectedBlockIds.length === 0) return;
    
    setBlocks(prev => prev.map(block =>
      selectedBlockIds.includes(block.id)
        ? { ...block, style: { ...block.style, ...styleUpdate } }
        : block
    ));
  }, [selectedBlockIds]);

  const handleBlocksReorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    const reorderedBlocks = [...blocks];
    const [removed] = reorderedBlocks.splice(sourceIndex, 1);
    reorderedBlocks.splice(destinationIndex, 0, removed);
    setBlocks(reorderedBlocks);
  }, [blocks]);

  const handleFileLoad = useCallback((fileContent: string) => {
    // Split file content into paragraphs and create blocks
    const paragraphs = fileContent.split(/\n\n+/).filter(p => p.trim());
    const newBlocks = paragraphs.map(content => 
      createBlock(content.trim(), DEFAULT_BLOCK_STYLE)
    );
    
    if (newBlocks.length === 0) {
      newBlocks.push(createBlock('', DEFAULT_BLOCK_STYLE));
    }
    
    setBlocks(newBlocks);
    setSelectedBlockIds(newBlocks[0] ? [newBlocks[0].id] : []);
  }, []);

  const handleBlockClick = useCallback((blockId: string) => {
    // Scroll to block
    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!hasContent) {
      toast.error('Please add some content first');
      return;
    }

    try {
      generatePDF(blocks, pageLayout);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  }, [blocks, pageLayout, hasContent]);

  const hasContent = blocks.some(b => b.content.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onFileLoad={handleFileLoad}
        onExport={handleExport}
        hasContent={hasContent}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-card">
          <div className="flex border-b">
            <Button
              variant={activePanel === 'outline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'outline' ? null : 'outline')}
              className="flex-1 rounded-none"
            >
              <List className="w-4 h-4 mr-2" />
              Outline
            </Button>
            <Button
              variant={activePanel === 'layout' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'layout' ? null : 'layout')}
              className="flex-1 rounded-none"
            >
              <Settings className="w-4 h-4 mr-2" />
              Layout
            </Button>
          </div>

          {activePanel === 'outline' && (
            <DocumentOutline
              blocks={blocks}
              selectedBlockIds={selectedBlockIds}
              onBlockSelect={setSelectedBlockIds}
              onBlockClick={handleBlockClick}
            />
          )}

          {activePanel === 'layout' && (
            <PageLayoutPanel
              layout={pageLayout}
              onLayoutChange={setPageLayout}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col p-6 gap-4">
            <FormatToolbar
              currentStyle={selectedBlocks.length === 1 ? selectedBlocks[0].style : null}
              onStyleChange={handleStyleChange}
              hasSelection={selectedBlockIds.length > 0}
            />

            <div className="flex-1 flex gap-6 min-h-0">
              <BlockEditor
                blocks={blocks}
                selectedBlockIds={selectedBlockIds}
                onBlocksChange={setBlocks}
                onBlockSelect={setSelectedBlockIds}
                onBlocksReorder={handleBlocksReorder}
              />
              <PreviewPanel
                ref={previewRef}
                blocks={blocks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
