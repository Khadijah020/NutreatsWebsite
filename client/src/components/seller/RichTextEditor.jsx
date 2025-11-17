import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const isUpdatingRef = useRef(false); // Prevent infinite loops

  // ✅ Initialize content when component mounts or value changes from parent
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || '';
      
      // Only update if content is different
      if (currentContent !== newValue) {
        console.log('🔄 Editor: Syncing from parent:', newValue);
        editorRef.current.innerHTML = newValue;
      }
    }
  }, [value]);

  const updateActiveFormats = () => {
    if (!editorRef.current) return;
    
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  };

  const applyFormat = (command) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, null);
    
    // ✅ Trigger onChange after formatting
    setTimeout(() => {
      handleInput();
      updateActiveFormats();
    }, 10);
  };

  // ✅ FIX: Make sure onChange is called on every input
  const handleInput = () => {
    if (!onChange || !editorRef.current) return;
    
    isUpdatingRef.current = true;
    const content = editorRef.current.innerHTML;
    
    console.log('✏️ Editor input detected:', content);
    onChange(content);
    
    // Reset flag after a tick
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
    
    updateActiveFormats();
  };

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        applyFormat('underline');
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    
    // ✅ Trigger onChange after paste
    setTimeout(() => {
      handleInput();
    }, 10);
  };

  const handleClick = () => {
    updateActiveFormats();
  };

  const handleBlur = () => {
    // ✅ Ensure onChange is called when losing focus
    if (onChange && editorRef.current) {
      const content = editorRef.current.innerHTML;
      console.log('👋 Editor blur, final content:', content);
      onChange(content);
    }
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, command }) => {
    const isActive = activeFormats[command];
    
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`p-2 rounded transition-colors ${
          isActive 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title={title}
        tabIndex={-1}
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => applyFormat('bold')}
          icon={Bold}
          title="Bold (Ctrl+B)"
          command="bold"
        />
        <ToolbarButton
          onClick={() => applyFormat('italic')}
          icon={Italic}
          title="Italic (Ctrl+I)"
          command="italic"
        />
        <ToolbarButton
          onClick={() => applyFormat('underline')}
          icon={Underline}
          title="Underline (Ctrl+U)"
          command="underline"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          onClick={() => applyFormat('insertUnorderedList')}
          icon={List}
          title="Bullet List"
          command="insertUnorderedList"
        />
        <ToolbarButton
          onClick={() => applyFormat('insertOrderedList')}
          icon={ListOrdered}
          title="Numbered List"
          command="insertOrderedList"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton
          onClick={() => applyFormat('justifyLeft')}
          icon={AlignLeft}
          title="Align Left"
          command="justifyLeft"
        />
        <ToolbarButton
          onClick={() => applyFormat('justifyCenter')}
          icon={AlignCenter}
          title="Align Center"
          command="justifyCenter"
        />
        <ToolbarButton
          onClick={() => applyFormat('justifyRight')}
          icon={AlignRight}
          title="Align Right"
          command="justifyRight"
        />
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onKeyUp={updateActiveFormats}
          onBlur={handleBlur}
          className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 focus:outline-none"
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          suppressContentEditableWarning
        />
        
        {(!value || value === '') && (
          <div 
            className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none"
            style={{ userSelect: 'none' }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* CSS for lists */}
      <style>{`
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          padding-left: 10px;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 20px;
          padding-left: 10px;
        }
        [contenteditable] li {
          margin: 4px 0;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;