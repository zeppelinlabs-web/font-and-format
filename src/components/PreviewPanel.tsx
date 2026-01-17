import { forwardRef } from 'react';

interface PreviewPanelProps {
  content: string;
}

export const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(
  ({ content }, ref) => {
    const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0 || 
                       content.includes('<img');

    return (
      <div className="flex-1 bg-preview rounded-xl p-3 md:p-6 overflow-auto flex justify-center">
        <div 
          ref={ref}
          className="preview-page animate-fade-in w-full"
        >
          {hasContent ? (
            <div 
              className="preview-content h-full"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          ) : (
            <p className="text-muted-foreground italic text-sm md:text-base">
              Your preview will appear here...
            </p>
          )}
        </div>
      </div>
    );
  }
);

PreviewPanel.displayName = 'PreviewPanel';
