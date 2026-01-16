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
  Type,
  List,
  ListOrdered,
  Strikethrough
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormatState } from './BlockEditor';

interface FormatToolbarProps {
  onFormat: (command: string, value?: string) => void;
  hasSelection: boolean;
  formatState: FormatState;
}

export const FormatToolbar = ({
  onFormat,
  hasSelection,
  formatState,
}: FormatToolbarProps) => {
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];

  // Prevent focus loss when clicking toolbar buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-2 bg-toolbar rounded-lg border border-border animate-fade-in transition-opacity flex-wrap"
    )}>
      {/* Selection indicator */}
      <div className={cn(
        "px-2 py-1 rounded text-xs font-medium mr-2 transition-colors",
        hasSelection 
          ? "bg-primary/10 text-primary" 
          : "bg-muted text-muted-foreground"
      )}>
        {hasSelection ? "Text selected" : "Select text to format"}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Font Size */}
      <Select
        defaultValue="3"
        onValueChange={(value) => onFormat('fontSize', value)}
      >
        <SelectTrigger className="w-[80px] h-8 text-sm" onMouseDown={handleMouseDown}>
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size} onMouseDown={handleMouseDown}>
              Size {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Style */}
      <button
        className={cn("toolbar-button", formatState.bold && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('bold')}
        title={formatState.bold ? "Remove Bold (Ctrl+B)" : "Bold (Ctrl+B)"}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.italic && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('italic')}
        title={formatState.italic ? "Remove Italic (Ctrl+I)" : "Italic (Ctrl+I)"}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.underline && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('underline')}
        title={formatState.underline ? "Remove Underline (Ctrl+U)" : "Underline (Ctrl+U)"}
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.strikeThrough && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('strikeThrough')}
        title={formatState.strikeThrough ? "Remove Strikethrough" : "Strikethrough"}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <button
        className={cn("toolbar-button", formatState.heading === 'p' && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'p')}
        title="Paragraph"
      >
        <Type className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.heading === 'h1' && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'h1')}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.heading === 'h2' && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'h2')}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.heading === 'h3' && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'h3')}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <button
        className={cn("toolbar-button", formatState.justifyLeft && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('justifyLeft')}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.justifyCenter && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('justifyCenter')}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.justifyRight && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('justifyRight')}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.justifyFull && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('justifyFull')}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <button
        className={cn("toolbar-button", formatState.insertUnorderedList && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('insertUnorderedList')}
        title={formatState.insertUnorderedList ? "Remove Bullet List" : "Bullet List"}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        className={cn("toolbar-button", formatState.insertOrderedList && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('insertOrderedList')}
        title={formatState.insertOrderedList ? "Remove Numbered List" : "Numbered List"}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};
