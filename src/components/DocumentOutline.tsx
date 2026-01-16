import { TextBlock, DocumentOutlineItem } from '@/types/editor';
import { cn } from '@/lib/utils';

interface DocumentOutlineProps {
  blocks: TextBlock[];
  selectedBlockIds: string[];
  onBlockSelect: (blockIds: string[]) => void;
  onBlockClick: (blockId: string) => void;
}

export const DocumentOutline = ({
  blocks,
  selectedBlockIds,
  onBlockSelect,
  onBlockClick,
}: DocumentOutlineProps) => {
  const generateOutline = (blocks: TextBlock[]): DocumentOutlineItem[] => {
    const outline: DocumentOutlineItem[] = [];
    
    blocks.forEach((block, index) => {
      if (block.style.headingLevel !== 'p' && block.content.trim()) {
        const level = block.style.headingLevel === 'h1' ? 1 :
                     block.style.headingLevel === 'h2' ? 2 : 3;
        
        outline.push({
          id: block.id,
          level,
          text: block.content.trim(),
          blockIndex: index,
        });
      }
    });
    
    return outline;
  };

  const outline = generateOutline(blocks);

  if (outline.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Document Outline</h3>
      <div className="space-y-1">
        {outline.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onBlockSelect([item.id]);
              onBlockClick(item.id);
            }}
            className={cn(
              "w-full text-left px-2 py-1 rounded text-sm hover:bg-accent transition-colors",
              selectedBlockIds.includes(item.id) && "bg-primary/10 text-primary",
              "block"
            )}
            style={{
              paddingLeft: `${(item.level - 1) * 12 + 8}px`,
            }}
          >
            <span className={cn(
              "font-medium",
              item.level === 1 && "text-base",
              item.level === 2 && "text-sm",
              item.level === 3 && "text-xs"
            )}>
              {item.level === 1 && "H1 "}
              {item.level === 2 && "H2 "}
              {item.level === 3 && "H3 "}
            </span>
            <span className="truncate">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};