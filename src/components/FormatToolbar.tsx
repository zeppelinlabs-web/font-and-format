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
  DocumentSettings, 
  TextStyle, 
  FONT_FAMILIES, 
  FONT_SIZES, 
  TEXT_COLORS,
  HeadingLevel,
  TextAlign
} from '@/types/editor';
import { cn } from '@/lib/utils';

interface FormatToolbarProps {
  textStyle: TextStyle;
  settings: DocumentSettings;
  onTextStyleChange: (style: Partial<TextStyle>) => void;
  onSettingsChange: (settings: Partial<DocumentSettings>) => void;
}

export const FormatToolbar = ({
  textStyle,
  settings,
  onTextStyleChange,
  onSettingsChange,
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

  return (
    <div className="flex items-center gap-1 p-2 bg-toolbar rounded-lg border border-border animate-fade-in">
      {/* Font Family */}
      <Select
        value={settings.fontFamily}
        onValueChange={(value) => onSettingsChange({ fontFamily: value as typeof settings.fontFamily })}
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
        value={settings.fontSize.toString()}
        onValueChange={(value) => onSettingsChange({ fontSize: parseInt(value) })}
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
            className="toolbar-button"
            title="Text Color"
          >
            <div 
              className="w-5 h-5 rounded border border-border" 
              style={{ backgroundColor: settings.textColor }}
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
                  settings.textColor === color ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onSettingsChange({ textColor: color })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Style */}
      <button
        className={cn("toolbar-button", textStyle.bold && "active")}
        onClick={() => onTextStyleChange({ bold: !textStyle.bold })}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", textStyle.italic && "active")}
        onClick={() => onTextStyleChange({ italic: !textStyle.italic })}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", textStyle.underline && "active")}
        onClick={() => onTextStyleChange({ underline: !textStyle.underline })}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      {headingButtons.map((btn) => (
        <button
          key={btn.level}
          className={cn("toolbar-button", settings.headingLevel === btn.level && "active")}
          onClick={() => onSettingsChange({ headingLevel: btn.level })}
          title={btn.label}
        >
          {btn.icon}
        </button>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      {alignButtons.map((btn) => (
        <button
          key={btn.align}
          className={cn("toolbar-button", settings.textAlign === btn.align && "active")}
          onClick={() => onSettingsChange({ textAlign: btn.align })}
          title={`Align ${btn.align}`}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};
