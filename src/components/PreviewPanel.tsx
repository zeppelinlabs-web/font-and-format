import { forwardRef } from 'react';
import { TextBlock, FONT_FAMILIES } from '@/types/editor';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  blocks: TextBlock[];
}

export const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(
  ({ blocks }, ref) => {
    const getBlockStyles = (block: TextBlock) => {
      const fontClass = FONT_FAMILIES.find(f => f.value === block.style.fontFamily)?.className || 'font-sans';
      
      let headingClass = '';
      switch (block.style.headingLevel) {
        case 'h1':
          headingClass = 'text-3xl font-bold mb-4';
          break;
        case 'h2':
          headingClass = 'text-2xl font-semibold mb-3';
          break;
        case 'h3':
          headingClass = 'text-xl font-medium mb-2';
          break;
        default:
          headingClass = 'mb-2';
      }

      return cn(
        fontClass,
        headingClass,
        block.style.bold && 'font-bold',
        block.style.italic && 'italic',
        block.style.underline && 'underline'
      );
    };

    const nonEmptyBlocks = blocks.filter(b => b.content.trim());

    return (
      <div className="flex-1 bg-preview rounded-xl p-6 overflow-auto flex justify-center">
        <div 
          ref={ref}
          className="preview-page animate-fade-in"
        >
          <div className="h-full">
            {nonEmptyBlocks.length > 0 ? (
              nonEmptyBlocks.map((block) => {
                const Tag = block.style.headingLevel === 'p' ? 'p' : block.style.headingLevel;
                return (
                  <Tag 
                    key={block.id}
                    className={getBlockStyles(block)}
                    style={{
                      fontSize: `${block.style.fontSize * 0.75}px`,
                      color: block.style.textColor,
                      textAlign: block.style.textAlign,
                      lineHeight: block.style.lineHeight,
                    }}
                  >
                    {block.content}
                  </Tag>
                );
              })
            ) : (
              <p className="text-muted-foreground italic">
                Your preview will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PreviewPanel.displayName = 'PreviewPanel';
