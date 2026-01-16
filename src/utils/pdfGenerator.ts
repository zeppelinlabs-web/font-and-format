import jsPDF from 'jspdf';
import { TextBlock, FontFamily, PageLayout } from '@/types/editor';

const FONT_MAP: Record<FontFamily, string> = {
  sans: 'helvetica',
  serif: 'times',
  mono: 'courier',
};

export const generatePDF = (blocks: TextBlock[], pageLayout: PageLayout): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = {
    top: pageLayout.marginTop + (pageLayout.showHeader ? pageLayout.headerHeight : 0),
    bottom: pageLayout.marginBottom + (pageLayout.showFooter ? pageLayout.footerHeight : 0),
    left: pageLayout.marginLeft,
    right: pageLayout.marginRight,
  };
  const maxWidth = pageWidth - margin.left - margin.right;

  // Parse hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  let yPosition = margin.top;
  let pageNumber = 1;

  // Function to add header
  const addHeader = () => {
    if (pageLayout.showHeader && pageLayout.headerText) {
      const headerY = pageLayout.marginTop;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);

      let headerText = pageLayout.headerText
        .replace('{page}', pageNumber.toString())
        .replace('{date}', new Date().toLocaleDateString())
        .replace('{title}', 'Document');

      pdf.text(headerText, margin.left, headerY + 5);
    }
  };

  // Function to add footer
  const addFooter = () => {
    if (pageLayout.showFooter && pageLayout.footerText) {
      const footerY = pageHeight - pageLayout.marginBottom;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);

      let footerText = pageLayout.footerText
        .replace('{page}', pageNumber.toString())
        .replace('{total}', '1') // We'll update this later if we add page counting
        .replace('{date}', new Date().toLocaleDateString())
        .replace('{title}', 'Document');

      pdf.text(footerText, margin.left, footerY - 5);
    }
  };

  // Add header and footer to first page
  addHeader();
  addFooter();

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

    // Handle list items
    let content = block.content;
    if (style.listType === 'unordered') {
      content = '• ' + content;
    } else if (style.listType === 'ordered') {
      // For ordered lists, we would need to track the numbering
      // For now, just add a placeholder
      content = '1. ' + content;
    }

    // Wrap text
    const lines = pdf.splitTextToSize(content, maxWidth);

    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin.bottom) {
        pdf.addPage();
        pageNumber++;
        yPosition = margin.top;
        addHeader();
        addFooter();
      }

      // Calculate x position based on alignment
      let xPosition = margin.left;
      const textWidth = pdf.getTextWidth(line);

      switch (style.textAlign) {
        case 'center':
          xPosition = margin.left + (maxWidth - textWidth) / 2;
          break;
        case 'right':
          xPosition = margin.left + maxWidth - textWidth;
          break;
        default:
          xPosition = margin.left;
      }

      pdf.text(line, xPosition, yPosition);
      yPosition += lineHeight;
    });

    // Add spacing after block
    yPosition += lineHeight * 0.5;
  });

  pdf.save('document.pdf');
};
