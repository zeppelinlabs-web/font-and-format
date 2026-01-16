import { FileText, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';

interface HeaderProps {
  onFileLoad: (content: string) => void;
  onExport: () => void;
  hasContent: boolean;
}

export const Header = ({ onFileLoad, onExport, hasContent }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            TXT to PDF
            <Sparkles className="w-4 h-4 text-accent" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Convert text to beautifully formatted PDFs
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FileUpload onFileLoad={onFileLoad} />
        <Button 
          onClick={onExport}
          disabled={!hasContent}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
    </header>
  );
};
