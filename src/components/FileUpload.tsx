import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileLoad(content);
      toast.success('File loaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileLoad(content);
      toast.success('File loaded successfully!');
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <label
      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Upload className="w-4 h-4" />
      <span className="text-sm font-medium">Upload .txt</span>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};
