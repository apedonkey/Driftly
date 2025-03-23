import React, {
  useRef,
  useState,
} from 'react';

import ReactQuill from 'react-quill';

interface Variable {
  name: string;
  placeholder: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  variables?: Variable[];
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Enter your email content here...',
  variables = []
}) => {
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  
  // Default variables if none provided
  const defaultVariables: Variable[] = [
    { name: 'firstName', placeholder: '{{firstName}}' },
    { name: 'lastName', placeholder: '{{lastName}}' },
    { name: 'email', placeholder: '{{email}}' },
    { name: 'company', placeholder: '{{company}}' },
  ];
  
  const allVariables = variables.length > 0 ? variables : defaultVariables;
  
  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
    }
  };
  
  // Quill formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];
  
  // Insert variable at current cursor position
  const insertVariable = (variable: Variable) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      
      // Insert the variable placeholder at cursor position
      editor.insertText(range.index, variable.placeholder);
      
      // Move cursor after the inserted variable
      editor.setSelection(range.index + variable.placeholder.length);
      
      // Close variable menu
      setShowVariableMenu(false);
      
      // Focus back on editor
      editor.focus();
    }
  };
  
  return (
    <div className="relative">
      <div className="mb-2 flex justify-between">
        <label className="block text-sm font-medium text-gray-400">
          Email Content
        </label>
        <button
          type="button"
          onClick={() => setShowVariableMenu(!showVariableMenu)}
          className="text-xs text-accent-blue hover:text-blue-400 focus:outline-none"
        >
          Insert Variable
        </button>
      </div>
      
      {showVariableMenu && (
        <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {allVariables.map((variable) => (
              <button
                key={variable.name}
                onClick={() => insertVariable(variable)}
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
              >
                {variable.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="bg-gray-800 text-white rounded-md"
      />
      
      <style>{`
        .ql-toolbar {
          background-color: #1f2937;
          border-color: #4b5563 !important;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        
        .ql-container {
          border-color: #4b5563 !important;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          min-height: 150px;
        }
        
        .ql-editor {
          min-height: 150px;
          color: white;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
        }
        
        .ql-snow .ql-picker {
          color: #e5e7eb;
        }
        
        .ql-snow .ql-stroke {
          stroke: #e5e7eb;
        }
        
        .ql-snow .ql-fill {
          fill: #e5e7eb;
        }
        
        .ql-snow .ql-picker-options {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 