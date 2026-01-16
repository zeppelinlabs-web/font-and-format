import { forwardRef } from 'react';
import { DocumentSettings, TextStyle, FONT_FAMILIES } from '@/types/editor';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  content: string;
  settings: DocumentSettings;
  textStyle: TextStyle;
}

export const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(
  ({ content, settings, textStyle }, ref) => {
    const fontClass = FONT_FAMILIES.find(f => f.value === settings.fontFamily)?.className || 'font-sans';

    const getHeadingStyles = () => {
      switch (settings.headingLevel) {
        case 'h1':
          return 'text-3xl font-bold mb-4';
        case 'h2':
          return 'text-2xl font-semibold mb-3';
        case 'h3':
          return 'text-xl font-medium mb-2';
        default:
          return '';
      }
    };

    const paragraphs = content.split('\n').filter(p => p.trim());

    return (
      <div className="flex-1 bg-preview rounded-xl p-6 overflow-auto flex justify-center">
        <div 
          ref={ref}
          className="preview-page animate-fade-in"
        >
          <div
            className={cn(
              "h-full",
              fontClass,
              textStyle.bold && "font-bold",
              textStyle.italic && "italic",
              textStyle.underline && "underline"
            )}
            style={{
              fontSize: `${settings.fontSize * 0.75}px`,
              color: settings.textColor,
              textAlign: settings.textAlign,
              lineHeight: settings.lineHeight,
            }}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => {
                const Tag = settings.headingLevel === 'p' ? 'p' : settings.headingLevel;
                return (
                  <Tag 
                    key={index} 
                    className={cn(
                      "mb-3 last:mb-0",
                      getHeadingStyles()
                    )}
                  >
                    {paragraph}
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
