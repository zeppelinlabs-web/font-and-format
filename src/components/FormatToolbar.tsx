import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Type
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  BlockStyle,
  FONT_FAMILIES, 
  FONT_SIZES, 
  TEXT_COLORS,
  HeadingLevel,
  TextAlign,
  FontFamily
} from '@/types/editor';
import { cn } from '@/lib/utils';

interface FormatToolbarProps {
  currentStyle: BlockStyle | null;
  onStyleChange: (style: Partial<BlockStyle>) => void;
  hasSelection: boolean;
}

export const FormatToolbar = ({
  currentStyle,
  onStyleChange,
  hasSelection,
}: FormatToolbarProps) => {
  const headingButtons: { level: HeadingLevel; icon: React.ReactNode; label: string }[] = [
    { level: 'p', icon: <Type className="w-4 h-4" />, label: 'Paragraph' },
    { level: 'h1', icon: <Heading1 className="w-4 h-4" />, label: 'Heading 1' },
    { level: 'h2', icon: <Heading2 className="w-4 h-4" />, label: 'Heading 2' },
    { level: 'h3', icon: <Heading3 className="w-4 h-4" />, label: 'Heading 3' },
  ];

  const alignButtons: { align: TextAlign; icon: React.ReactNode }[] = [
    { align: 'left', icon: <AlignLeft className="w-4 h-4" /> },
    { align: 'center', icon: <AlignCenter className="w-4 h-4" /> },
    { align: 'right', icon: <AlignRight className="w-4 h-4" /> },
    { align: 'justify', icon: <AlignJustify className="w-4 h-4" /> },
  ];

  const style = currentStyle || {
    fontFamily: 'sans' as FontFamily,
    fontSize: 16,
    textColor: '#1a1a2e',
    textAlign: 'left' as TextAlign,
    lineHeight: 1.6,
    headingLevel: 'p' as HeadingLevel,
    bold: false,
    italic: false,
    underline: false,
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-2 bg-toolbar rounded-lg border border-border animate-fade-in transition-opacity",
      !hasSelection && "opacity-60"
    )}>
      {/* Selection indicator */}
      <div className={cn(
        "px-2 py-1 rounded text-xs font-medium mr-2 transition-colors",
        hasSelection 
          ? "bg-primary/10 text-primary" 
          : "bg-muted text-muted-foreground"
      )}>
        {hasSelection ? "Editing block" : "Select a block"}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Font Family */}
      <Select
        value={style.fontFamily}
        onValueChange={(value) => onStyleChange({ fontFamily: value as FontFamily })}
        disabled={!hasSelection}
      >
        <SelectTrigger className="w-[130px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value} className={font.className}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select
        value={style.fontSize.toString()}
        onValueChange={(value) => onStyleChange({ fontSize: parseInt(value) })}
        disabled={!hasSelection}
      >
        <SelectTrigger className="w-[70px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className={cn("toolbar-button", !hasSelection && "pointer-events-none")}
            title="Text Color"
            disabled={!hasSelection}
          >
            <div 
              className="w-5 h-5 rounded border border-border" 
              style={{ backgroundColor: style.textColor }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="grid grid-cols-6 gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  style.textColor === color ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onStyleChange({ textColor: color })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Style */}
      <button
        className={cn("toolbar-button", style.bold && "active", !hasSelection && "pointer-events-none opacity-50")}
        onClick={() => onStyleChange({ bold: !style.bold })}
        title="Bold"
        disabled={!hasSelection}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", style.italic && "active", !hasSelection && "pointer-events-none opacity-50")}
        onClick={() => onStyleChange({ italic: !style.italic })}
        title="Italic"
        disabled={!hasSelection}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", style.underline && "active", !hasSelection && "pointer-events-none opacity-50")}
        onClick={() => onStyleChange({ underline: !style.underline })}
        title="Underline"
        disabled={!hasSelection}
      >
        <Underline className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      {headingButtons.map((btn) => (
        <button
          key={btn.level}
          className={cn(
            "toolbar-button", 
            style.headingLevel === btn.level && "active",
            !hasSelection && "pointer-events-none opacity-50"
          )}
          onClick={() => onStyleChange({ headingLevel: btn.level })}
          title={btn.label}
          disabled={!hasSelection}
        >
          {btn.icon}
        </button>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      {alignButtons.map((btn) => (
        <button
          key={btn.align}
          className={cn(
            "toolbar-button", 
            style.textAlign === btn.align && "active",
            !hasSelection && "pointer-events-none opacity-50"
          )}
          onClick={() => onStyleChange({ textAlign: btn.align })}
          title={`Align ${btn.align}`}
          disabled={!hasSelection}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};
