import { useRef, useEffect, useCallback, useState } from 'react';
import { TextBlock, FONT_FAMILIES, BlockStyle } from '@/types/editor';
import { cn } from '@/lib/utils';
import { generateUUID } from '@/utils/uuid';

interface BlockEditorProps {
  blocks: TextBlock[];
  selectedBlockIds: string[];
  onBlocksChange: (blocks: TextBlock[]) => void;
  onBlockSelect: (blockIds: string[]) => void;
  onBlocksReorder?: (sourceIndex: number, destinationIndex: number) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, selectedBlockIds, onBlocksChange, onBlockSelect, onBlocksReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
    
    // Remove prefix from content (it's added by getDisplayContent)
    let cleanContent = newContent;
    if (prefix && newContent.startsWith(prefix)) {
      cleanContent = newContent.substring(prefix.length);
    }
    
    const updatedBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, content: cleanContent } : b
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
            id: generateUUID(),
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
          id: generateUUID(),
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
          id: generateUUID(),
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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in a contentEditable
      if (e.target instanceof HTMLElement && e.target.contentEditable === 'true') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            onBlockSelect(blocks.map(b => b.id));
            break;
          case 'c':
            // Copy selected blocks
            if (selectedBlockIds.length > 0) {
              const selectedBlocks = blocks.filter(b => selectedBlockIds.includes(b.id));
              const copyData = JSON.stringify(selectedBlocks);
              navigator.clipboard.writeText(copyData);
            }
            break;
          case 'v':
            // Paste blocks
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
              try {
                const pastedBlocks: TextBlock[] = JSON.parse(text);
                if (Array.isArray(pastedBlocks) && pastedBlocks.length > 0) {
                  const newBlocks = pastedBlocks.map(block => ({
                    ...block,
                    id: generateUUID(),
                  }));
                  const insertIndex = selectedBlockIds.length > 0 
                    ? blocks.findIndex(b => b.id === selectedBlockIds[0]) + 1
                    : blocks.length;
                  const updatedBlocks = [
                    ...blocks.slice(0, insertIndex),
                    ...newBlocks,
                    ...blocks.slice(insertIndex),
                  ];
                  onBlocksChange(updatedBlocks);
                  onBlockSelect(newBlocks.map(b => b.id));
                }
              } catch (error) {
                // Not valid block data, ignore
              }
            });
            break;
        }
      } else {
        switch (e.key) {
          case 'Escape':
            onBlockSelect([]);
            break;
          case 'Delete':
          case 'Backspace':
            if (selectedBlockIds.length > 0 && selectedBlockIds.length < blocks.length) {
              e.preventDefault();
              const updatedBlocks = blocks.filter(b => !selectedBlockIds.includes(b.id));
              onBlocksChange(updatedBlocks);
              onBlockSelect([]);
            }
            break;
          case 'ArrowUp':
            if (selectedBlockIds.length === 1) {
              const currentIndex = blocks.findIndex(b => b.id === selectedBlockIds[0]);
              if (currentIndex > 0) {
                onBlockSelect([blocks[currentIndex - 1].id]);
              }
            }
            break;
          case 'ArrowDown':
            if (selectedBlockIds.length === 1) {
              const currentIndex = blocks.findIndex(b => b.id === selectedBlockIds[0]);
              if (currentIndex < blocks.length - 1) {
                onBlockSelect([blocks[currentIndex + 1].id]);
              }
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [blocks, selectedBlockIds, onBlocksChange, onBlockSelect]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onBlocksReorder) {
      onBlocksReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onBlocksReorder]);

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
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && dragOverIndex !== draggedIndex && "border-t-2 border-primary"
              )}
            >
              {/* Drag handle */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary/20 transition-colors cursor-move opacity-0 group-hover:opacity-100" />
              
              <div
                data-block-id={block.id}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                  "outline-none py-1 px-2 rounded transition-colors min-h-[1.5em] cursor-pointer pl-6",
                  getBlockStyles(block.style, block.style.listType !== 'none'),
                  selectedBlockIds.includes(block.id) && "bg-primary/5 ring-2 ring-primary/20"
                )}
                style={{
                  fontSize: `${block.style.fontSize}px`,
                  color: block.style.textColor,
                  textAlign: block.style.textAlign,
                  lineHeight: block.style.lineHeight,
                }}
                onFocus={() => onBlockSelect([block.id])}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    // Multi-select with Ctrl/Cmd
                    const newSelection = selectedBlockIds.includes(block.id)
                      ? selectedBlockIds.filter(id => id !== block.id)
                      : [...selectedBlockIds, block.id];
                    onBlockSelect(newSelection);
                  } else {
                    // Single select
                    onBlockSelect([block.id]);
                  }
                }}
                onInput={(e) => handleBlockChange(block.id, (e.target as HTMLElement).innerText, index)}
                onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                dangerouslySetInnerHTML={{ __html: displayContent || '<br>' }}
              />
            </div>
          );
        })}
        
        {blocks.length === 0 && (
          <div 
            className="text-muted-foreground italic cursor-text"
            onClick={() => {
              const newBlock = {
                id: generateUUID(),
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

export { BlockEditor };
