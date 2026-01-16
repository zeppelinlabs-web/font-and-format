import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  justifyFull: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
  heading: 'p' | 'h1' | 'h2' | 'h3';
  blockquote: boolean;
  codeBlock: boolean;
}

interface BlockEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSelectionChange: (hasSelection: boolean) => void;
  onFormatStateChange?: (formatState: FormatState) => void;
}

export interface BlockEditorRef {
  applyFormat: (command: string, value?: string) => void;
  insertImage: (file: File) => void;
  insertLink: (url: string, text: string) => void;
  getContent: () => string;
  focus: () => void;
}

const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(({ 
  content, 
  onContentChange,
  onSelectionChange,
  onFormatStateChange
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Get current format state from selection
  const getFormatState = useCallback((): FormatState => {
    const state: FormatState = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      heading: 'p',
      blockquote: false,
      codeBlock: false,
    };

    // Check heading level, blockquote, and code block
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'H1') {
          state.heading = 'h1';
        } else if (node.nodeName === 'H2') {
          state.heading = 'h2';
        } else if (node.nodeName === 'H3') {
          state.heading = 'h3';
        } else if (node.nodeName === 'BLOCKQUOTE') {
          state.blockquote = true;
        } else if (node.nodeName === 'PRE') {
          state.codeBlock = true;
        }
        node = node.parentNode;
      }
    }

    return state;
  }, []);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    applyFormat: (command: string, value?: string) => {
      // Ensure editor has focus before executing command
      editorRef.current?.focus();
      
      // Handle formatBlock specially for proper tag wrapping
      if (command === 'formatBlock') {
        document.execCommand(command, false, `<${value}>`);
      } else {
        document.execCommand(command, false, value);
      }
      
      // Trigger content change after formatting - use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          isInternalChange.current = true;
          onContentChange(newContent);
          
          // Update format state
          if (onFormatStateChange) {
            onFormatStateChange(getFormatState());
          }
          
          setTimeout(() => {
            isInternalChange.current = false;
          }, 0);
        }
      }, 0);
    },
    insertImage: (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          editorRef.current?.focus();
          
          // Create image element with styling
          const img = document.createElement('img');
          img.src = dataUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          img.style.margin = '10px 0';
          img.setAttribute('contenteditable', 'false');
          
          // Insert at cursor position
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move cursor after image
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            editorRef.current?.appendChild(img);
          }
          
          // Trigger content change
          setTimeout(() => {
            if (editorRef.current) {
              isInternalChange.current = true;
              onContentChange(editorRef.current.innerHTML);
              setTimeout(() => {
                isInternalChange.current = false;
              }, 0);
            }
          }, 0);
        }
      };
      reader.readAsDataURL(file);
    },
    insertLink: (url: string, text: string) => {
      editorRef.current?.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // If there's selected text, wrap it in a link
        if (!selection.isCollapsed) {
          document.execCommand('createLink', false, url);
        } else {
          // Insert new link with text
          const link = document.createElement('a');
          link.href = url;
          link.textContent = text;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          range.deleteContents();
          range.insertNode(link);
          
          // Move cursor after link
          range.setStartAfter(link);
          range.setEndAfter(link);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        // Trigger content change
        setTimeout(() => {
          if (editorRef.current) {
            isInternalChange.current = true;
            onContentChange(editorRef.current.innerHTML);
            setTimeout(() => {
              isInternalChange.current = false;
            }, 0);
          }
        }, 0);
      }
    },
    getContent: () => editorRef.current?.innerHTML || '',
    focus: () => editorRef.current?.focus()
  }));

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '<p><br></p>';
      }
    }
  }, [content]);

  // Handle selection changes and format state
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const hasSelection = selection && !selection.isCollapsed && 
        editorRef.current?.contains(selection.anchorNode);
      onSelectionChange(!!hasSelection);
      
      // Update format state when selection changes
      if (onFormatStateChange && editorRef.current?.contains(selection?.anchorNode || null)) {
        onFormatStateChange(getFormatState());
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [onSelectionChange, onFormatStateChange, getFormatState]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onContentChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isInternalChange.current = false;
      }, 0);
    }
  }, [onContentChange]);

  // Check if cursor is in a special block (heading, blockquote, pre)
  const getSpecialBlockContext = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      const nodeName = node.nodeName;
      if (nodeName === 'H1' || nodeName === 'H2' || nodeName === 'H3' || 
          nodeName === 'BLOCKQUOTE' || nodeName === 'PRE') {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  }, []);

  // Check if cursor is in a list item
  const getListContext = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    let node: Node | null = selection.anchorNode;
    let listItem: HTMLLIElement | null = null;
    let list: HTMLUListElement | HTMLOListElement | null = null;
    
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'LI') {
        listItem = node as HTMLLIElement;
      }
      if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        list = node as HTMLUListElement | HTMLOListElement;
        break;
      }
      node = node.parentNode;
    }
    
    return { listItem, list };
  }, []);

  // Check if list item is empty
  const isListItemEmpty = useCallback((li: HTMLLIElement) => {
    const text = li.textContent || '';
    return text.trim() === '' || text === '\u200B';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold', false);
          if (onFormatStateChange) onFormatStateChange(getFormatState());
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic', false);
          if (onFormatStateChange) onFormatStateChange(getFormatState());
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline', false);
          if (onFormatStateChange) onFormatStateChange(getFormatState());
          break;
      }
      return;
    }

    const listContext = getListContext();
    const specialBlock = getSpecialBlockContext();

    // Handle Enter in special blocks (headings, blockquote, pre) - create a new paragraph
    if (e.key === 'Enter' && !e.shiftKey && specialBlock) {
      const blockType = specialBlock.nodeName;
      const isHeading = blockType === 'H1' || blockType === 'H2' || blockType === 'H3';
      const isBlockquote = blockType === 'BLOCKQUOTE';
      const isPre = blockType === 'PRE';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // For headings and blockquotes: always exit to paragraph on Enter
        if (isHeading || isBlockquote) {
          e.preventDefault();
          
          // Get any text after the cursor
          const afterRange = document.createRange();
          afterRange.setStart(range.endContainer, range.endOffset);
          afterRange.setEndAfter(specialBlock);
          const afterContent = afterRange.extractContents();
          
          // Create a new paragraph
          const p = document.createElement('p');
          if (afterContent.textContent?.trim()) {
            p.appendChild(afterContent);
          } else {
            p.innerHTML = '<br>';
          }
          
          // Insert the paragraph after the block
          if (specialBlock.nextSibling) {
            specialBlock.parentNode?.insertBefore(p, specialBlock.nextSibling);
          } else {
            specialBlock.parentNode?.appendChild(p);
          }
          
          // If the original block is now empty, remove it
          if (!specialBlock.textContent?.trim()) {
            specialBlock.remove();
          }
          
          // Move cursor to the start of the new paragraph
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          // Trigger content change
          if (editorRef.current) {
            isInternalChange.current = true;
            onContentChange(editorRef.current.innerHTML);
            if (onFormatStateChange) {
              onFormatStateChange(getFormatState());
            }
            setTimeout(() => {
              isInternalChange.current = false;
            }, 0);
          }
          return;
        }
        
        // For pre/code blocks: exit on Enter at empty line
        if (isPre) {
          const currentText = range.startContainer.textContent || '';
          const lines = currentText.split('\n');
          const isLastLineEmpty = lines.length > 0 && lines[lines.length - 1].trim() === '';
          const isAtEnd = range.endOffset === currentText.length;
          
          if (isAtEnd && isLastLineEmpty) {
            e.preventDefault();
            
            // Remove trailing newline
            if (specialBlock.lastChild && specialBlock.lastChild.nodeType === Node.TEXT_NODE) {
              const text = specialBlock.lastChild.textContent || '';
              specialBlock.lastChild.textContent = text.replace(/\n$/, '');
            }
            
            // Create a new paragraph
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            if (specialBlock.nextSibling) {
              specialBlock.parentNode?.insertBefore(p, specialBlock.nextSibling);
            } else {
              specialBlock.parentNode?.appendChild(p);
            }
            
            // Move cursor to the new paragraph
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Trigger content change
            if (editorRef.current) {
              isInternalChange.current = true;
              onContentChange(editorRef.current.innerHTML);
              if (onFormatStateChange) {
                onFormatStateChange(getFormatState());
              }
              setTimeout(() => {
                isInternalChange.current = false;
              }, 0);
            }
            return;
          }
          
          // Allow normal Enter within pre
          return;
        }
      }
    }

    // Handle Tab for list indentation
    if (e.key === 'Tab' && listContext?.listItem) {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent', false);
      } else {
        document.execCommand('indent', false);
      }
      return;
    }

    // Handle Enter in lists
    if (e.key === 'Enter' && !e.shiftKey && listContext?.listItem && listContext?.list) {
      const { listItem, list } = listContext;
      
      if (isListItemEmpty(listItem)) {
        e.preventDefault();
        listItem.remove();
        
        if (list.children.length === 0) {
          list.remove();
        }
        
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        
        if (list.parentNode) {
          if (list.nextSibling) {
            list.parentNode.insertBefore(p, list.nextSibling);
          } else {
            list.parentNode.appendChild(p);
          }
        } else if (editorRef.current) {
          editorRef.current.appendChild(p);
        }
        
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        if (editorRef.current) {
          isInternalChange.current = true;
          onContentChange(editorRef.current.innerHTML);
          setTimeout(() => {
            isInternalChange.current = false;
          }, 0);
        }
        return;
      }
    }

    // Handle Backspace at the start of a list item
    if (e.key === 'Backspace' && listContext?.listItem) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (range.startOffset === 0 && range.collapsed) {
          const { listItem, list } = listContext;
          const isFirstItem = listItem === list?.firstElementChild;
          
          if (isFirstItem && isListItemEmpty(listItem)) {
            e.preventDefault();
            
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            if (list && list.parentNode) {
              list.parentNode.insertBefore(p, list);
              listItem.remove();
              
              if (list.children.length === 0) {
                list.remove();
              }
            }
            
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            if (editorRef.current) {
              isInternalChange.current = true;
              onContentChange(editorRef.current.innerHTML);
              setTimeout(() => {
                isInternalChange.current = false;
              }, 0);
            }
            return;
          }
        }
      }
    }
  }, [getListContext, isListItemEmpty, onContentChange, onFormatStateChange, getFormatState]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className="flex-1 bg-editor rounded-xl p-6 overflow-auto">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "editor-content min-h-[600px] outline-none",
          "prose prose-sm max-w-none",
          "[&>p]:my-2 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:my-4",
          "[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:my-3",
          "[&>h3]:text-xl [&>h3]:font-medium [&>h3]:my-2",
          "[&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2",
          "[&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2",
          "[&_ul]:list-disc [&_ul]:ml-6",
          "[&_ol]:list-decimal [&_ol]:ml-6",
          "[&_li]:my-1",
          "[&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:text-gray-600",
          "[&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:font-mono [&>pre]:text-sm [&>pre]:my-4 [&>pre]:overflow-x-auto",
          "[&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:my-2"
        )}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          lineHeight: 1.6,
        }}
      />
    </div>
  );
});

BlockEditor.displayName = 'BlockEditor';

export { BlockEditor };
