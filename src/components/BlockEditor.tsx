import { useRef, useEffect, useCallback } from 'react';
import { TextBlock, FONT_FAMILIES, BlockStyle } from '@/types/editor';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: TextBlock[];
  selectedBlockId: string | null;
  onBlocksChange: (blocks: TextBlock[]) => void;
  onBlockSelect: (blockId: string | null) => void;
}

export const BlockEditor = ({
  blocks,
  selectedBlockId,
  onBlocksChange,
  onBlockSelect,
}: BlockEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlockChange = useCallback((blockId: string, newContent: string) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string, blockIndex: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentBlock = blocks[blockIndex];
      const newBlock = {
        id: crypto.randomUUID(),
        content: '',
        style: { ...currentBlock.style },
      };
      const updatedBlocks = [
        ...blocks.slice(0, blockIndex + 1),
        newBlock,
        ...blocks.slice(blockIndex + 1),
      ];
      onBlocksChange(updatedBlocks);
      
      // Focus new block after render
      setTimeout(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
        newBlockElement?.focus();
        onBlockSelect(newBlock.id);
      }, 0);
    }

    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      const content = target.innerText;
      
      if (content === '' && blocks.length > 1) {
        e.preventDefault();
        const updatedBlocks = blocks.filter(b => b.id !== blockId);
        onBlocksChange(updatedBlocks);
        
        // Focus previous block
        const prevIndex = Math.max(0, blockIndex - 1);
        setTimeout(() => {
          const prevBlockElement = document.querySelector(`[data-block-id="${updatedBlocks[prevIndex]?.id}"]`) as HTMLElement;
          prevBlockElement?.focus();
          onBlockSelect(updatedBlocks[prevIndex]?.id || null);
        }, 0);
      }
    }
  }, [blocks, onBlocksChange, onBlockSelect]);

  const getBlockStyles = (style: BlockStyle) => {
    const fontClass = FONT_FAMILIES.find(f => f.value === style.fontFamily)?.className || 'font-sans';
    
    let headingClass = '';
    switch (style.headingLevel) {
      case 'h1':
        headingClass = 'text-4xl font-bold';
        break;
      case 'h2':
        headingClass = 'text-2xl font-semibold';
        break;
      case 'h3':
        headingClass = 'text-xl font-medium';
        break;
    }

    return cn(
      fontClass,
      headingClass,
      style.bold && 'font-bold',
      style.italic && 'italic',
      style.underline && 'underline'
    );
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-editor rounded-xl p-6 overflow-auto"
    >
      <div className="editor-content min-h-[600px]">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            data-block-id={block.id}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "outline-none py-1 px-2 rounded transition-colors min-h-[1.5em]",
              getBlockStyles(block.style),
              selectedBlockId === block.id && "bg-primary/5 ring-2 ring-primary/20"
            )}
            style={{
              fontSize: `${block.style.fontSize}px`,
              color: block.style.textColor,
              textAlign: block.style.textAlign,
              lineHeight: block.style.lineHeight,
            }}
            onFocus={() => onBlockSelect(block.id)}
            onInput={(e) => handleBlockChange(block.id, (e.target as HTMLElement).innerText)}
            onKeyDown={(e) => handleKeyDown(e, block.id, index)}
            dangerouslySetInnerHTML={{ __html: block.content || '<br>' }}
          />
        ))}
        
        {blocks.length === 0 && (
          <div 
            className="text-muted-foreground italic cursor-text"
            onClick={() => {
              const newBlock = {
                id: crypto.randomUUID(),
                content: '',
                style: { ...blocks[0]?.style || {} } as BlockStyle,
              };
              onBlocksChange([newBlock]);
              setTimeout(() => {
                const el = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
                el?.focus();
              }, 0);
            }}
          >
            Click here to start typing...
          </div>
        )}
      </div>
    </div>
  );
};
