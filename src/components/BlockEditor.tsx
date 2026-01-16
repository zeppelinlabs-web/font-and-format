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

  const getListPrefix = (block: TextBlock, index: number): string => {
    if (block.style.listType === 'unordered') {
      return '• ';
    } else if (block.style.listType === 'ordered') {
      // Count preceding ordered list items
      let count = 1;
      for (let i = index - 1; i >= 0; i--) {
        if (blocks[i].style.listType === 'ordered') {
          count++;
        } else {
          break;
        }
      }
      return `${count}. `;
    }
    return '';
  };

  const getDisplayContent = (block: TextBlock, index: number): string => {
    const prefix = getListPrefix(block, index);
    return prefix + (block.content || '');
  };

  const handleBlockChange = useCallback((blockId: string, newContent: string, blockIndex: number) => {
    const block = blocks[blockIndex];
    const prefix = getListPrefix(block, blockIndex);
    
    // Remove prefix from content if it exists
    let cleanContent = newContent;
    if (newContent.startsWith(prefix)) {
      cleanContent = newContent.substring(prefix.length);
    }
    
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content: cleanContent } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string, blockIndex: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentBlock = blocks[blockIndex];
      const target = e.target as HTMLElement;
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(target);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const cursorPosition = preCaretRange.toString().length;
        
        // Get the full text content (including prefix)
        const fullText = target.innerText;
        const prefix = getListPrefix(currentBlock, blockIndex);
        
        // Calculate actual content position (excluding prefix)
        const contentStartPosition = prefix.length;
        const relativeCursorPosition = Math.max(0, cursorPosition - contentStartPosition);
        
        // Check if current block is empty and is a list item - exit the list
        if (fullText.trim() === prefix.trim() && currentBlock.style.listType !== 'none') {
          const newBlock = {
            id: crypto.randomUUID(),
            content: '',
            style: { ...currentBlock.style, listType: 'none' as const },
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
          return;
        }
        
        // Split the content at cursor position
        const textBeforeCursor = fullText.substring(contentStartPosition, contentStartPosition + relativeCursorPosition);
        const textAfterCursor = fullText.substring(contentStartPosition + relativeCursorPosition);
        
        // Update current block with text before cursor
        const updatedCurrentBlock = {
          ...currentBlock,
          content: textBeforeCursor,
        };
        
        // Create new block with text after cursor (same style for lists, normal for others)
        const newBlock = {
          id: crypto.randomUUID(),
          content: textAfterCursor,
          style: { ...currentBlock.style },
        };
        
        const updatedBlocks = [
          ...blocks.slice(0, blockIndex),
          updatedCurrentBlock,
          newBlock,
          ...blocks.slice(blockIndex + 1),
        ];
        
        onBlocksChange(updatedBlocks);
        
        // Focus new block after render
        setTimeout(() => {
          const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
          if (newBlockElement) {
            newBlockElement.focus();
            // Position cursor at the beginning of the content (after prefix)
            const range = document.createRange();
            const selection = window.getSelection();
            const prefix = getListPrefix(newBlock, blockIndex + 1);
            range.setStart(newBlockElement.firstChild || newBlockElement, prefix.length);
            range.setEnd(newBlockElement.firstChild || newBlockElement, prefix.length);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          onBlockSelect(newBlock.id);
        }, 0);
      } else {
        // Fallback: create empty new block if no selection
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

  const getBlockStyles = (style: BlockStyle, isListItem: boolean = false) => {
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
      style.underline && 'underline',
      isListItem && 'ml-6'
    );
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-editor rounded-xl p-6 overflow-auto"
    >
      <div className="editor-content min-h-[600px]">
        {blocks.map((block, index) => {
          const displayContent = getDisplayContent(block, index);
          
          return (
            <div
              key={block.id}
              data-block-id={block.id}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "outline-none py-1 px-2 rounded transition-colors min-h-[1.5em]",
                getBlockStyles(block.style, block.style.listType !== 'none'),
                selectedBlockId === block.id && "bg-primary/5 ring-2 ring-primary/20"
              )}
              style={{
                fontSize: `${block.style.fontSize}px`,
                color: block.style.textColor,
                textAlign: block.style.textAlign,
                lineHeight: block.style.lineHeight,
              }}
              onFocus={() => onBlockSelect(block.id)}
              onInput={(e) => handleBlockChange(block.id, (e.target as HTMLElement).innerText, index)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              dangerouslySetInnerHTML={{ __html: displayContent || '<br>' }}
            />
          );
        })}
        
        {blocks.length === 0 && (
          <div 
            className="text-muted-foreground italic cursor-text"
            onClick={() => {
              const newBlock = {
                id: crypto.randomUUID(),
                content: '',
                style: { ...DEFAULT_BLOCK_STYLE },
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
