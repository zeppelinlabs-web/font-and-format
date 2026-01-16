import { useRef, useState } from 'react';
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
  Strikethrough,
  Image,
  Link,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Quote,
  Code,
  Minus,
  Highlighter,
  Palette
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FormatState } from './BlockEditor';

interface FormatToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onInsertImage: (file: File) => void;
  onInsertLink: (url: string, text: string) => void;
  hasSelection: boolean;
  formatState: FormatState;
}

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000', '#0000ff', '#ffa500', '#800080', '#008000',
];

export const FormatToolbar = ({
  onFormat,
  onInsertImage,
  onInsertLink,
  hasSelection,
  formatState,
}: FormatToolbarProps) => {
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  const fontFamilies = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Comic Sans MS', label: 'Comic Sans' },
  ];
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Prevent focus loss when clicking toolbar buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInsertImage(file);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkUrl('');
    setLinkText('');
    setLinkDialogOpen(true);
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      onInsertLink(linkUrl, linkText || linkUrl);
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-2 bg-toolbar rounded-lg border border-border animate-fade-in transition-opacity flex-wrap"
    )}>
      {/* Hidden file input for images */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Undo/Redo */}
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('undo')}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('redo')}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Font Family */}
      <Select
        defaultValue="Arial"
        onValueChange={(value) => onFormat('fontName', value)}
      >
        <SelectTrigger className="w-[120px] h-8 text-sm" onMouseDown={handleMouseDown}>
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value} onMouseDown={handleMouseDown}>
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="toolbar-button"
            onMouseDown={handleMouseDown}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" onMouseDown={handleMouseDown}>
          <div className="grid grid-cols-10 gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onFormat('foreColor', color)}
                onMouseDown={handleMouseDown}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="toolbar-button"
            onMouseDown={handleMouseDown}
            title="Highlight Color"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" onMouseDown={handleMouseDown}>
          <div className="grid grid-cols-5 gap-1">
            {HIGHLIGHT_COLORS.map((color, i) => (
              <button
                key={i}
                className={cn(
                  "w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform",
                  color === 'transparent' && "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iNSIgZmlsbD0iI2NjYyIvPjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIGZpbGw9IiNjY2MiLz48L3N2Zz4=')]"
                )}
                style={{ backgroundColor: color === 'transparent' ? undefined : color }}
                onClick={() => onFormat('hiliteColor', color)}
                onMouseDown={handleMouseDown}
                title={color === 'transparent' ? 'Remove highlight' : undefined}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

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
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('subscript')}
        title="Subscript"
      >
        <Subscript className="w-4 h-4" />
      </button>
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('superscript')}
        title="Superscript"
      >
        <Superscript className="w-4 h-4" />
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

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block Quote */}
      <button
        className={cn("toolbar-button", formatState.blockquote && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'blockquote')}
        title={formatState.blockquote ? "Remove Block Quote" : "Block Quote"}
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* Code Block */}
      <button
        className={cn("toolbar-button", formatState.codeBlock && "bg-primary/20 text-primary")}
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('formatBlock', 'pre')}
        title={formatState.codeBlock ? "Remove Code Block" : "Code Block"}
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Horizontal Rule */}
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => onFormat('insertHorizontalRule')}
        title="Horizontal Line"
      >
        <Minus className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Insert Image */}
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={() => imageInputRef.current?.click()}
        title="Insert Image"
      >
        <Image className="w-4 h-4" />
      </button>

      {/* Insert Link */}
      <button
        className="toolbar-button"
        onMouseDown={handleMouseDown}
        onClick={handleOpenLinkDialog}
        title="Insert Link"
      >
        <Link className="w-4 h-4" />
      </button>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Display text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertLink} disabled={!linkUrl}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
