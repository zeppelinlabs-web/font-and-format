import jsPDF from 'jspdf';
import { DocumentSettings, TextStyle, FontFamily } from '@/types/editor';

const FONT_MAP: Record<FontFamily, string> = {
  sans: 'helvetica',
  serif: 'times',
  mono: 'courier',
};

export const generatePDF = (
  content: string,
  settings: DocumentSettings,
  textStyle: TextStyle
): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  // Set font
  const fontName = FONT_MAP[settings.fontFamily];
  let fontStyle = 'normal';
  if (textStyle.bold && textStyle.italic) {
    fontStyle = 'bolditalic';
  } else if (textStyle.bold) {
    fontStyle = 'bold';
  } else if (textStyle.italic) {
    fontStyle = 'italic';
  }

  // Calculate font size for PDF (points to mm conversion)
  const fontSize = settings.fontSize * 0.352778;

  pdf.setFont(fontName, fontStyle);
  pdf.setFontSize(settings.fontSize);

  // Parse hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const color = hexToRgb(settings.textColor);
  pdf.setTextColor(color.r, color.g, color.b);

  // Split content into lines
  const paragraphs = content.split('\n');
  let yPosition = margin;
  const lineHeight = settings.fontSize * settings.lineHeight * 0.352778;

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      yPosition += lineHeight;
      return;
    }

    // Adjust font size for headings
    let currentFontSize = settings.fontSize;
    if (settings.headingLevel === 'h1') {
      currentFontSize = settings.fontSize * 1.5;
      pdf.setFont(fontName, 'bold');
    } else if (settings.headingLevel === 'h2') {
      currentFontSize = settings.fontSize * 1.25;
      pdf.setFont(fontName, 'bold');
    } else if (settings.headingLevel === 'h3') {
      currentFontSize = settings.fontSize * 1.1;
      pdf.setFont(fontName, 'bold');
    } else {
      pdf.setFont(fontName, fontStyle);
    }
    pdf.setFontSize(currentFontSize);

    // Wrap text
    const lines = pdf.splitTextToSize(paragraph, maxWidth);

    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      // Calculate x position based on alignment
      let xPosition = margin;
      const textWidth = pdf.getTextWidth(line);

      switch (settings.textAlign) {
        case 'center':
          xPosition = (pageWidth - textWidth) / 2;
          break;
        case 'right':
          xPosition = pageWidth - margin - textWidth;
          break;
        case 'justify':
          // jsPDF doesn't support true justify, use left alignment
          xPosition = margin;
          break;
        default:
          xPosition = margin;
      }

      pdf.text(line, xPosition, yPosition);
      yPosition += lineHeight;
    });

    // Add extra spacing after paragraph
    yPosition += lineHeight * 0.5;
  });

  // Add underline if enabled (note: jsPDF doesn't have native underline support)
  // This would require custom implementation

  // Download the PDF
  pdf.save('document.pdf');
};
