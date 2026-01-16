import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FormatToolbar } from '@/components/FormatToolbar';
import { BlockEditor } from '@/components/BlockEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { generatePDF } from '@/utils/pdfGenerator';
import { TextBlock, BlockStyle, DEFAULT_BLOCK_STYLE, createBlock } from '@/types/editor';
import { toast } from 'sonner';

const Index = () => {
  const [blocks, setBlocks] = useState<TextBlock[]>([
    createBlock('', DEFAULT_BLOCK_STYLE),
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const handleStyleChange = useCallback((styleUpdate: Partial<BlockStyle>) => {
    if (!selectedBlockId) return;
    
    setBlocks(prev => prev.map(block =>
      block.id === selectedBlockId
        ? { ...block, style: { ...block.style, ...styleUpdate } }
        : block
    ));
  }, [selectedBlockId]);

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
    setSelectedBlockId(newBlocks[0]?.id || null);
  }, []);

  const handleExport = useCallback(() => {
    const hasContent = blocks.some(b => b.content.trim());
    if (!hasContent) {
      toast.error('Please add some content first');
      return;
    }

    try {
      generatePDF(blocks);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  }, [blocks]);

  const hasContent = blocks.some(b => b.content.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onFileLoad={handleFileLoad}
        onExport={handleExport}
        hasContent={hasContent}
      />

      <div className="flex-1 flex flex-col p-6 gap-4">
        <FormatToolbar
          currentStyle={selectedBlock?.style || null}
          onStyleChange={handleStyleChange}
          hasSelection={!!selectedBlockId}
        />

        <div className="flex-1 flex gap-6 min-h-0">
          <BlockEditor
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onBlocksChange={setBlocks}
            onBlockSelect={setSelectedBlockId}
          />
          <PreviewPanel
            ref={previewRef}
            blocks={blocks}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
