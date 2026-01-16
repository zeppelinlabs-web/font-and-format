import jsPDF from 'jspdf';
import { TextBlock, FontFamily } from '@/types/editor';

const FONT_MAP: Record<FontFamily, string> = {
  sans: 'helvetica',
  serif: 'times',
  mono: 'courier',
};

export const generatePDF = (blocks: TextBlock[]): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  // Parse hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  let yPosition = margin;

  blocks.forEach((block) => {
    if (!block.content.trim()) return;

    const style = block.style;
    const fontName = FONT_MAP[style.fontFamily];
    
    // Determine font style
    let fontStyle = 'normal';
    if (style.bold && style.italic) {
      fontStyle = 'bolditalic';
    } else if (style.bold) {
      fontStyle = 'bold';
    } else if (style.italic) {
      fontStyle = 'italic';
    }

    // Adjust font size for headings
    let fontSize = style.fontSize;
    if (style.headingLevel === 'h1') {
      fontSize = style.fontSize * 1.5;
      fontStyle = 'bold';
    } else if (style.headingLevel === 'h2') {
      fontSize = style.fontSize * 1.25;
      fontStyle = 'bold';
    } else if (style.headingLevel === 'h3') {
      fontSize = style.fontSize * 1.1;
      fontStyle = 'bold';
    }

    pdf.setFont(fontName, fontStyle);
    pdf.setFontSize(fontSize);

    const color = hexToRgb(style.textColor);
    pdf.setTextColor(color.r, color.g, color.b);

    const lineHeight = fontSize * style.lineHeight * 0.352778;

    // Wrap text
    const lines = pdf.splitTextToSize(block.content, maxWidth);

    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      // Calculate x position based on alignment
      let xPosition = margin;
      const textWidth = pdf.getTextWidth(line);

      switch (style.textAlign) {
        case 'center':
          xPosition = (pageWidth - textWidth) / 2;
          break;
        case 'right':
          xPosition = pageWidth - margin - textWidth;
          break;
        default:
          xPosition = margin;
      }

      pdf.text(line, xPosition, yPosition);
      yPosition += lineHeight;
    });

    // Add spacing after block
    yPosition += lineHeight * 0.5;
  });

  pdf.save('document.pdf');
};
