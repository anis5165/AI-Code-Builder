'use client';
import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Babel from '@babel/standalone';
import React from 'react';
import ReactDOM from 'react-dom/client';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState('html');
  const [generatedCode, setGeneratedCode] = useState('');
  const [editableCode, setEditableCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [modelUsed, setModelUsed] = useState(null);
  const previewRef = useRef(null);
  const editorRef = useRef(null);
  
  // New state for theme options
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedFont, setSelectedFont] = useState('sans');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6'); // Default blue
  const [showOptions, setShowOptions] = useState(false);

  // Theme options
  const themes = {
    light: { bg: 'bg-white', text: 'text-gray-900' },
    dark: { bg: 'bg-gray-900', text: 'text-white' },
    colorful: { bg: 'bg-gradient-to-r from-blue-500 to-purple-600', text: 'text-white' },
  };

  // Font options
  const fonts = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Clean HTML content to remove any text outside of HTML tags
  const cleanHtmlContent = (html) => {
    if (!html) return '';
    
    // Check if the content has HTML tags
    if (html.includes('<html') || html.includes('<!DOCTYPE')) {
      // Get only the content between opening and closing HTML tags
      const htmlMatch = html.match(/<html.*>[\s\S]*<\/html>/i);
      if (htmlMatch) {
        return htmlMatch[0];
      }
      
      // If no complete HTML tag found, try to extract up to the closing body
      const bodyMatch = html.match(/[\s\S]*<\/body>/i);
      if (bodyMatch) {
        return bodyMatch[0];
      }
    }
    
    return html;
  };

  // Apply theme to HTML preview
  const applyThemeToHTML = (html) => {
    if (!html) return html;
    
    // First clean the HTML content
    const cleanedHtml = cleanHtmlContent(html);
    
    // CSS to inject
    const customCSS = `
      :root {
        --primary-color: ${primaryColor};
      }
      body {
        font-family: ${selectedFont === 'sans' ? 'ui-sans-serif, system-ui, sans-serif' : 
                       selectedFont === 'serif' ? 'ui-serif, Georgia, serif' : 
                       'ui-monospace, monospace'};
        background-color: ${selectedTheme === 'light' ? 'white' : 
                           selectedTheme === 'dark' ? '#111827' : 
                           'transparent'};
        color: ${selectedTheme === 'light' ? '#111827' : 
                selectedTheme === 'dark' ? 'white' : 
                'white'};
      }
      ${selectedTheme === 'colorful' ? `
        body {
          background: linear-gradient(to right, #3B82F6, #8B5CF6);
        }
      ` : ''}
      button, .btn, a.btn, input[type="button"], input[type="submit"] {
        background-color: var(--primary-color) !important;
      }
    `;
    
    // Add style tag if head exists, otherwise create minimal HTML structure
    if (cleanedHtml.includes('<head>')) {
      return cleanedHtml.replace('</head>', `<style>${customCSS}</style></head>`);
    } else if (cleanedHtml.toLowerCase().includes('<html')) {
      return cleanedHtml.replace('<html', `<html><head><style>${customCSS}</style></head><html`);
    } else {
      return `<!DOCTYPE html><html><head><style>${customCSS}</style></head>${cleanedHtml}</html>`;
    }
  };

  // Improved React component rendering with better error handling
// Inside the renderReactComponent function, the issue is in the StyledContainer component
// Replace the problematic code with this corrected version:

const renderReactComponent = (code) => {
  if (!previewRef.current) return;
  
  try {
    // Clear previous content
    previewRef.current.innerHTML = '<div id="react-preview" class="p-4 h-full w-full"></div>';
    
    // Process the input code to ensure it's valid JSX that can be wrapped
    let processedCode = code.trim();
    
    // Handle different code structures
    let finalCode;
    if (processedCode.includes('return') && processedCode.includes('(') && processedCode.includes(')')) {
      // Code already has a return statement with JSX
      finalCode = `
        function GeneratedComponent() {
          ${processedCode}
        }
      `;
    } else if (processedCode.startsWith('<') && processedCode.endsWith('>')) {
      // Code is just JSX without a return
      finalCode = `
        function GeneratedComponent() {
          return ${processedCode};
        }
      `;
    } else {
      // For any other case, we'll try to wrap it safely
      finalCode = `
        function GeneratedComponent() {
          return (
            <div>${processedCode}</div>
          );
        }
      `;
    }
    
    // Add styling and rendering - FIXED VERSION
    finalCode += `
      function StyledContainer() {
        const containerStyle = {
          fontFamily: ${selectedFont === 'sans' ? '"ui-sans-serif, system-ui, sans-serif"' : 
                       selectedFont === 'serif' ? '"ui-serif, Georgia, serif"' : 
                       '"ui-monospace, monospace"'},
          backgroundColor: ${selectedTheme === 'light' ? '"white"' : 
                            selectedTheme === 'dark' ? '"#111827"' : 
                            '"transparent"'},
          color: ${selectedTheme === 'light' ? '"#111827"' : 
                  selectedTheme === 'dark' ? '"white"' : 
                  '"white"'},
          background: ${selectedTheme === 'colorful' ? 
                       '"linear-gradient(to right, #3B82F6, #8B5CF6)"' : 
                       '"none"'},
          minHeight: "100%",
          padding: "1rem"
        };
        
        return (
          <div style={containerStyle}>
            <GeneratedComponent />
          </div>
        );
      }
      
      const container = document.getElementById('react-preview');
      if (container) {
        ReactDOM.createRoot(container).render(<StyledContainer />);
      }
    `;

    // Transpile the code
    const transpiledCode = Babel.transform(finalCode, {
      presets: ['react', 'env'],
    }).code;

    // Execute the transpiled code
    new Function('React', 'ReactDOM', transpiledCode)(React, ReactDOM);
  } catch (err) {
    console.error('Component compilation error:', err);
    if (previewRef.current) {
      previewRef.current.innerHTML = `
        <div class="text-red-500 p-4">
          <h3 class="font-bold mb-2">Error compiling component:</h3>
          <pre class="bg-gray-800 p-3 rounded text-sm overflow-auto">${err.message}</pre>
          <p class="mt-3">Try updating your code in the editor.</p>
        </div>
      `;
    }
  }
};
  
  // Update preview based on edited code
  const updatePreview = () => {
    if (generationType === 'html') {
      // For HTML, just update the iframe src
      const themedHTML = applyThemeToHTML(editableCode);
      const iframe = document.querySelector('iframe[title="Preview"]');
      if (iframe) {
        iframe.srcdoc = themedHTML;
      }
    } else {
      // For React, re-render component
      renderReactComponent(editableCode);
    }
  };

  useEffect(() => {
    // Initialize editable code when generated code changes
    if (generatedCode) {
      setEditableCode(generatedCode);
    }
  }, [generatedCode]);

  useEffect(() => {
    // Re-render component when theme options change
    if (generationType === 'react' && editableCode) {
      renderReactComponent(editableCode);
    } else if (generationType === 'html' && editableCode) {
      updatePreview();
    }
  }, [selectedTheme, selectedFont, primaryColor, editableCode, generationType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: generationType })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate content');

      // Clean up content if HTML
      const cleanedContent = generationType === 'html' ? cleanHtmlContent(data.content) : data.content;
      
      setGeneratedCode(cleanedContent);
      setEditableCode(cleanedContent);
      setModelUsed(data.modelUsed);
      setActiveTab('preview');

      // Render the component or HTML with a slight delay to ensure DOM is ready
      setTimeout(() => {
        if (generationType === 'react') {
          renderReactComponent(cleanedContent);
        }
      }, 100);
    } catch (error) {
      setError(error.message);
      setGeneratedCode('');
      setEditableCode('');
      setModelUsed(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle code editing
  const handleCodeEdit = (e) => {
    setEditableCode(e.target.value);
  };
  
  // Apply changes button handler
  const applyChanges = () => {
    updatePreview();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Input */}
      <div className="w-1/4 h-screen bg-gray-900 p-6 fixed left-0 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Webpage Generator
        </h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Describe your webpage or component..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />

          {/* Generation Type Selector */}
          <div className="mb-4">
            <label className="block text-white mb-2">Generation Type</label>
            <select
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="html">HTML Page</option>
              <option value="react">React Component</option>
            </select>
          </div>

          {/* Theme Options Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 mb-2"
            >
              {showOptions ? 'Hide Theme Options' : 'Show Theme Options'}
            </button>
            
            {showOptions && (
              <div className="bg-gray-800 p-3 rounded mt-2 shadow">
                {/* Theme selector */}
                <div className="mb-3">
                  <label className="block text-white text-sm mb-1">Theme</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="colorful">Colorful Gradient</option>
                  </select>
                </div>
                
                {/* Font selector */}
                <div className="mb-3">
                  <label className="block text-white text-sm mb-1">Font Family</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="sans">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>
                
                {/* Color picker */}
                <div className="mb-2">
                  <label className="block text-white text-sm mb-1">Primary Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 mr-2 border-0 rounded p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={loading || !prompt}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 p-4 rounded">
            <p className="text-red-700 font-bold">Error:</p>
            <pre className="text-red-600 overflow-x-auto">{error}</pre>
          </div>
        )}
      </div>

      {/* Right Section - Preview/Code */}
      <div className="w-3/4 min-h-screen ml-[25%]">
        {generatedCode && !error ? (
          <div className="h-screen flex flex-col">
            <div className="bg-white border-b shadow-sm p-4 flex justify-between items-center">
              {modelUsed && (
                <div className="text-gray-600">
                  Model Used: {modelUsed}
                </div>
              )}
              <div className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 mr-2 rounded ${activeTab === 'preview'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded ${activeTab === 'code'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Edit Code
                </button>
              </div>
            </div>

            <div className="flex-1 h-[calc(100vh-76px)]">
              {activeTab === 'preview' ? (
                // Preview Tab
                <div className="h-full">
                  {generationType === 'html' ? (
                    <iframe
                      title="Preview"
                      srcDoc={applyThemeToHTML(editableCode)}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-forms allow-popups"
                      style={{
                        border: 'none',
                        display: 'block',
                        backgroundColor: selectedTheme === 'light' ? 'white' : 
                                        selectedTheme === 'dark' ? '#111827' : 
                                        'white'
                      }}
                    ></iframe>
                  ) : (
                    <div
                      ref={previewRef}
                      className="w-full h-full overflow-auto"
                    />
                  )}
                </div>
              ) : (
                // Code Editor Tab
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-auto bg-[#1E1E1E]">
                    <SyntaxHighlighter
                      language="jsx"
                      style={vscDarkPlus}
                      customStyle={{
                        backgroundColor: '#1E1E1E',
                        padding: '1rem',
                        margin: 0,
                        border: 'none',
                        borderRadius: 0,
                        height: '100%'
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {editableCode}
                    </SyntaxHighlighter>
                  </div>
                  <div className="p-2 bg-gray-800 flex justify-end">
                    <button 
                      onClick={applyChanges}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Generated content will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}