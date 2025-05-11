'use client';
import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Babel from '@babel/standalone';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { motion } from 'framer-motion';

export default function Home() {
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 20 } },
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.5 } },
  };
  const buttonVariants = {
    hover: { scale: 1.07, boxShadow: '0 4px 14px 0 rgba(59,130,246,0.15)' },
    tap: { scale: 0.97 }
  };

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
    <motion.div
      className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left Section - Controls */}
      <motion.div
        className={`fixed left-0 top-0 h-screen w-1/4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl flex flex-col items-center py-10 z-20 transition-all duration-300 ${showOptions ? 'shadow-2xl scale-105' : ''}`}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 text-center mb-7 tracking-tight drop-shadow-lg" initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}}>
          AI Code Builder
        </motion.h1>
        <form onSubmit={handleSubmit} className="w-full px-6 flex flex-col gap-4 mt-2">
          <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1" htmlFor="prompt">
            Prompt
          </label>
          <motion.textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 p-3 min-h-[90px] resize-none transition-all duration-200 shadow-sm bg-white/80 dark:bg-gray-800 dark:text-white"
            placeholder="Describe what you want to generate..."
            required
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />

          <label className="font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-1">Generation Type</label>
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={() => setGenerationType('html')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 border ${generationType === 'html' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'} shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              HTML
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setGenerationType('react')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 border ${generationType === 'react' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'} shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              React
            </motion.button>
          </div>

          <motion.button
            type="submit"
            className="mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-md transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </motion.button>
        </form>
        <motion.button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {showOptions ? 'Hide Theme Options' : 'Show Theme Options'}
        </motion.button>
        {showOptions && (
          <motion.div className="w-full px-6 mt-4 space-y-4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm mb-1">Theme</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="colorful">Colorful Gradient</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm mb-1">Font Family</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border-0 rounded p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div className="mt-4 bg-red-100 dark:bg-red-900 p-4 rounded shadow-md w-full" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
            <p className="text-red-700 dark:text-red-200 font-bold">Error:</p>
            <pre className="text-red-600 dark:text-red-100 overflow-x-auto">{error}</pre>
          </motion.div>
        )}
      </motion.div>

      {/* Right Section - Preview/Code */}
      <div className="w-3/4 min-h-screen ml-[25%]">
        {generatedCode && !error ? (
          <motion.div className="h-screen flex flex-col" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm p-4 flex justify-between items-center">
              {modelUsed && (
                <div className="text-gray-600 dark:text-gray-300">
                  Model Used: {modelUsed}
                </div>
              )}
              <div className="flex">
                <motion.button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 mr-2 rounded font-semibold transition-colors duration-150 ${activeTab === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Preview
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded font-semibold transition-colors duration-150 ${activeTab === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Edit Code
                </motion.button>
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
                    ></div>
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
                    <motion.button 
                      onClick={applyChanges}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Apply Changes
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-300">Generated content will appear here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}