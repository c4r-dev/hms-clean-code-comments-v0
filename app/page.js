'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Paper,
  Collapse,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#d1d5db',
  marginBottom: theme.spacing(2),
}));

const DirectoryHeader = styled(Box)(({ theme }) => ({
  backgroundColor: '#000000',
  color: 'white',
  padding: theme.spacing(1.5, 2),
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.05em'
}));

const DirectoryContent = styled(Box)(({ theme }) => ({
  backgroundColor: '#374151',
  color: 'white',
  padding: theme.spacing(2)
}));

const TreeItem = styled(Box, {
  shouldForwardProp: (prop) => 
    !['isSelected', 'isHighlighted', 'isMain', 'level'].includes(prop),
})(({ theme, isSelected, isHighlighted, isMain, level = 0 }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  marginLeft: level * 24,
  borderRadius: 4,
  cursor: 'pointer',
  border: 'none',
  backgroundColor: isHighlighted ? '#6366f1' : 'transparent',
  '&:hover': {
    backgroundColor: isHighlighted ? '#5b21b6' : '#4b5563'
  }
}));

const CodeContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  fontSize: '14px',
  lineHeight: 1.5,
  padding: theme.spacing(2),
  maxHeight: '500px',
  overflowY: 'auto',
  whiteSpace: 'pre',
  tabSize: 4,
  '& .hljs': {
    background: 'transparent',
    color: '#d4d4d4'
  },
  '& .hljs-keyword': {
    color: '#569cd6'
  },
  '& .hljs-string': {
    color: '#ce9178'
  },
  '& .hljs-doctag': {
    color: '#ce9178',
    fontStyle: 'italic'
  },
  '& .hljs-meta': {
    color: '#ce9178'
  },
  // Ensure all docstring content has consistent color
  '& .hljs-string.hljs-doctag': {
    color: '#ce9178 !important',
    fontStyle: 'italic'
  },
  '& .hljs-section': {
    color: '#ce9178'
  },
  // Force consistent docstring coloring - override any sub-highlighting within docstrings
  '& .hljs-string *': {
    color: 'inherit !important'
  },
  '& .hljs-string .hljs-keyword': {
    color: '#ce9178 !important'
  },
  '& .hljs-string .hljs-built_in': {
    color: '#ce9178 !important'
  },
  // Target all possible docstring-related classes
  '& .hljs-doctag, & .hljs-string': {
    color: '#ce9178 !important',
    fontStyle: 'italic'
  },
  '& .hljs-string span': {
    color: '#ce9178 !important'
  },
  // Ensure any nested elements in strings are also orange
  '& .hljs-string .hljs-title': {
    color: '#ce9178 !important'
  },
  '& .hljs-string .hljs-variable': {
    color: '#ce9178 !important'
  },
  '& .hljs-string .hljs-type': {
    color: '#ce9178 !important'
  },
  // Catch any unclassified content in docstrings that defaults to white
  '& span:not([class*="hljs-"]):not(.line-number)': {
    color: '#d4d4d4'
  },
  // Aggressive override for any content that might be appearing as white in docstrings
  '& .hljs-string, & .hljs-string *, & [class*="hljs-string"]': {
    color: '#ce9178 !important',
    fontStyle: 'italic'
  },
  '& .hljs-comment': {
    color: '#6a9955',
    fontStyle: 'italic'
  },
  '& .hljs-number': {
    color: '#b5cea8'
  },
  '& .hljs-built_in': {
    color: '#4ec9b0'
  },
  '& .hljs-function': {
    color: '#dcdcaa'
  },
  '& .hljs-class': {
    color: '#4ec9b0'
  },
  '& .hljs-variable': {
    color: '#9cdcfe'
  },
  '& .hljs-operator': {
    color: '#d4d4d4'
  },
  '& .hljs-params': {
    color: '#9cdcfe'
  },
  '& .hljs-title': {
    color: '#dcdcaa'
  },
  '& .hljs-attr': {
    color: '#92c5f8'
  },
  '& .hljs-punctuation': {
    color: '#d4d4d4'
  }
}));

const LineNumber = styled('span')({
  color: '#858585',
  marginRight: '16px',
  userSelect: 'none',
  minWidth: '32px',
  display: 'inline-block',
  textAlign: 'right',
  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  fontSize: '14px',
  lineHeight: 1.5,
  flexShrink: 0
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#1f2937',
  minHeight: '40px',
  borderBottom: '1px solid #374151',
  '& .MuiTab-root': {
    color: '#9ca3af',
    minHeight: '40px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: '0.05em',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderBottom: 'none',
    marginRight: '2px',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#374151',
      color: '#d1d5db'
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: '#374151',
      borderColor: '#4b5563',
      position: 'relative',
      zIndex: 1,
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#374151'
      }
    }
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .MuiTabs-flexContainer': {
    gap: '2px'
  }
}));

const pythonCode = `import os.path
import numpy as np
from src import plotting, preprocessing, loading


def load_file(path):
    if path.endswith('.nd2'):
        microscopy_data = loading.load_nd2(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='nd2')

    elif path.endswith('.tiff') or path.endswith('.tif'):
        microscopy_data = loading.load_tif(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='tiff')

    elif path.endswith('.nwb'):
        microscopy_data = loading.load_nwb(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='nwb')

    else:
        raise ValueError(f"Unsupported file format: {path}")

    image_parameters = {
        'is_normalized': is_normalized,
        'is_mip': is_mip,
        'is_cropped': is_cropped,
        'downsampling_factor': zoom_level,
        'smooth_factor': gaussian_sigma
    }

    return microscopy_data, image_parameters


if __name__ == "__main__":
    files = ['20191010_tail_01.nd2', '20240523_Vang-1_37.tif', 'sub-11-YAaLR_ophys.nwb']

    processed_images = []
    for filename in files:
        image, image_parameters = load_file(f"data\\{filename}")
        processing_steps = {}

        if not image_parameters['is_mip']:
            image = preprocessing.maximally_project_image(image=image)
            processing_steps['maximum intensity projection'] = image

        if not image_parameters['is_normalized']:
            image = preprocessing.normalize_image(image)
            processing_steps['normalized'] = image

        if not image_parameters['is_cropped']:
            image = preprocessing.crop_background_border(image=image,
                                                         background_percentile=98)
            processing_steps['cropped'] = image

        image = preprocessing.downsample_image(
            image=image,
            factor=image_parameters['downsampling_factor'])
        processing_steps['downsampled'] = image

        image = preprocessing.smooth_image(
            image=image,
            factor=image_parameters['smooth_factor'])
        processing_steps['smoothed'] = image

        file_identifier = filename.split('.')[0]
        plotting.generate_comparison_plot(
            generated_images=processing_steps,
            output_path=f"results\\{file_identifier}_comparison.png")

        processed_images.append(image)

    plotting.plot_multiple_files(filenames=files,
                                 images=processed_images,
                                 output_path=f"results\\overview.png")`;

const FileIcon = ({ fileType }) => {
  const getIconStyles = () => {
    switch (fileType) {
      case 'python':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          width: 20,
          height: 20,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        };
      case 'folder':
        return {
          width: 20,
          height: 20,
          '& svg': {
            fill: '#eab308'
          }
        };
      case 'data':
        return {
          backgroundColor: '#f97316',
          color: 'white',
          width: 20,
          height: 20,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        };
      case 'image':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          width: 20,
          height: 20,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        };
      case 'text':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          width: 20,
          height: 20,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        };
      default:
        return {};
    }
  };

  return (
    <Box sx={getIconStyles()}>
      {fileType === 'folder' ? (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      ) : fileType === 'python' ? (
        'PY'
      ) : fileType === 'data' ? (
        'D'
      ) : fileType === 'image' ? (
        'IMG'
      ) : fileType === 'text' ? (
        'TXT'
      ) : null}
    </Box>
  );
};

const FolderItem = ({ name, fileCount, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <>
      <TreeItem onClick={() => setExpanded(!expanded)}>
        <IconButton size="small" sx={{ color: '#e5e7eb', mr: 0.5, p: 0 }}>
          {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
        <FileIcon fileType="folder" />
        <Typography variant="body2" sx={{ ml: 1, flex: 1, color: '#e5e7eb' }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.75rem', mr: 2 }}>
          {fileCount} files
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '80px' }}>
          Folder
        </Typography>
      </TreeItem>
      <Collapse in={expanded}>
        <Box>
          {children}
        </Box>
      </Collapse>
    </>
  );
};

const FileItem = ({ name, fileType, isHighlighted, isMain, level = 1, onFileClick }) => (
  <TreeItem 
    level={level} 
    isHighlighted={isHighlighted} 
    isMain={isMain}
    onClick={() => onFileClick && onFileClick(name, fileType)}
  >
    <Box sx={{ width: 24 }} />
    <FileIcon fileType={fileType} />
    <Typography variant="body2" sx={{ ml: 1, flex: 1, color: '#e5e7eb' }}>
      {name}
    </Typography>
    <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '80px' }}>
      {fileType === 'python' ? 'Python file' : 
       fileType === 'data' ? 'Data file' :
       fileType === 'image' ? 'Image file' :
       fileType === 'text' ? 'Text file' : ''}
    </Typography>
  </TreeItem>
);

const DirectoryView = ({ onFileClick }) => (
  <DirectoryContent>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #4b5563' }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#d1d5db', flex: 1 }}>
        Name
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#d1d5db', minWidth: '100px' }}>
        File Type
      </Typography>
    </Box>

    <FolderItem name="src" fileCount="3">
      <FileItem name="loading.py" fileType="python" onFileClick={onFileClick} />
      <FileItem name="plotting.py" fileType="python" onFileClick={onFileClick} />
      <FileItem name="preprocessing.py" fileType="python" onFileClick={onFileClick} />
    </FolderItem>

    <FolderItem name="data" fileCount="4">
      <FileItem name="20191010_tail_01.nd2" fileType="data" onFileClick={onFileClick} />
      <FileItem name="sub-11-YAaLR_oophys.nwb" fileType="data" onFileClick={onFileClick} />
      <FileItem name="20240523_Vang-1_37.tif" fileType="image" onFileClick={onFileClick} />
      <FileItem name="citations.txt" fileType="text" onFileClick={onFileClick} />
    </FolderItem>

    <FolderItem name="results" fileCount="4">
      <FileItem name="20240523_Vang-1_37_comparison.png" fileType="image" onFileClick={onFileClick} />
      <FileItem name="20191010_tail_01_comparison.png" fileType="image" onFileClick={onFileClick} />
      <FileItem name="sub-11-YAaLR_oophys_comparison.png" fileType="image" onFileClick={onFileClick} />
      <FileItem name="overview.png" fileType="image" onFileClick={onFileClick} />
    </FolderItem>

    <FileItem name="main.py" fileType="python" isMain level={0} onFileClick={onFileClick} />
  </DirectoryContent>
);

const PythonCodeViewer = ({ code, onFunctionSelect }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  console.log('PythonCodeViewer rendered with code:', code ? code.substring(0, 200) : 'NO CODE');
  console.log('Code contains triple quotes:', code ? code.includes('"""') : 'NO CODE');

  const processTripleQuotedStrings = (highlightedHtml) => {
    console.log('processTripleQuotedStrings called!');
    console.log('Input HTML:', highlightedHtml.substring(0, 500)); // Show first 500 chars
    
    // Very simple approach: just replace any occurrence of """ with orange version
    let result = highlightedHtml;
    
    // Add debug marker so we know the function ran
    result = '<!-- PROCESSED BY processTripleQuotedStrings -->' + result;
    
    // Replace triple quotes with orange styling - all variations
    result = result.replace(/"""/g, '<span style="color: #ff8c00 !important; font-weight: bold; background-color: yellow;">"""</span>');
    result = result.replace(/'''/g, '<span style="color: #ff8c00 !important; font-weight: bold; background-color: yellow;">\'\'\'</span>');
    
    // Also handle HTML encoded versions
    result = result.replace(/&quot;&quot;&quot;/g, '<span style="color: #ff8c00 !important; font-weight: bold; background-color: yellow;">&quot;&quot;&quot;</span>');
    result = result.replace(/&#x27;&#x27;&#x27;/g, '<span style="color: #ff8c00 !important; font-weight: bold; background-color: yellow;">&#x27;&#x27;&#x27;</span>');
    
    console.log('Output HTML:', result.substring(0, 500)); // Show first 500 chars of result
    return result;
  };

  useEffect(() => {
    const loadHighlightJS = async () => {
      if (typeof window !== 'undefined' && !window.hljs) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
        script.onload = () => {
          const pythonScript = document.createElement('script');
          pythonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js';
          pythonScript.onload = () => {
            if (window.hljs) {
              const result = window.hljs.highlight(code, { language: 'python' });
              const processedCode = processTripleQuotedStrings(result.value);
              setHighlightedCode(processedCode);
            }
          };
          document.head.appendChild(pythonScript);
        };
        document.head.appendChild(script);
      } else if (window.hljs) {
        const result = window.hljs.highlight(code, { language: 'python' });
        const processedCode = processTripleQuotedStrings(result.value);
        setHighlightedCode(processedCode);
      }
    };

    loadHighlightJS();
  }, [code]);

  const parseFunctions = (code) => {
    const lines = code.split('\n');
    const functions = [];
    let currentFunction = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('def ') && trimmed.includes('(')) {
        if (currentFunction) {
          currentFunction.endLine = index - 1;
          functions.push(currentFunction);
        }
        
        const functionName = trimmed.split('(')[0].replace('def ', '');
        currentFunction = {
          name: functionName,
          startLine: index,
          endLine: null,
          code: line
        };
      } else if (currentFunction) {
        currentFunction.code += '\n' + line;
      }
    });
    
    if (currentFunction) {
      currentFunction.endLine = lines.length - 1;
      functions.push(currentFunction);
    }
    
    return functions;
  };

  const functions = parseFunctions(code);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const selectedFunction = functions.find(func => {
      const funcText = func.code.trim();
      return selectedText.includes('def ' + func.name) && 
             selectedText.length >= funcText.length * 0.8;
    });

    if (selectedFunction) {
      setSelectedFunction(selectedFunction);
      setShowPrompt(true);
    }
  };

  const codeLines = highlightedCode ? highlightedCode.split('\n') : code.split('\n');

  return (
    <>
      <CodeContainer>
        <div onMouseUp={handleTextSelection}>
          {codeLines.map((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags for checking
            const isFunctionDef = trimmedLine.startsWith('def ') && trimmedLine.includes('(') && 
              !trimmedLine.startsWith('def load_tif(') && !trimmedLine.startsWith('def load_nd2(') && 
              !trimmedLine.startsWith('def plot_single_file(') &&
              !trimmedLine.startsWith('def normalize_image(') && 
              !trimmedLine.startsWith('def downsample_image(') && 
              !trimmedLine.startsWith('def smooth_image(');
            
            // Find the corresponding function object for this line
            const functionAtLine = functions.find(func => func.startLine === index);
            
            return (
              <div key={index} style={{ display: 'flex', minHeight: '21px', alignItems: 'flex-start' }}>
                <LineNumber>{String(lineNumber).padStart(2, '0')}</LineNumber>
                <div 
                  style={{ 
                    flex: 1, 
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    lineHeight: 1.5,
                    userSelect: 'text',
                    whiteSpace: 'pre',
                    overflow: 'visible',
                    cursor: isFunctionDef ? 'pointer' : 'text',
                    backgroundColor: isFunctionDef ? 'rgba(100, 200, 255, 0.1)' : 'transparent',
                    padding: isFunctionDef ? '2px 4px' : '0',
                    borderRadius: isFunctionDef ? '3px' : '0',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (isFunctionDef) {
                      e.target.style.backgroundColor = 'rgba(100, 200, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFunctionDef) {
                      e.target.style.backgroundColor = 'rgba(100, 200, 255, 0.1)';
                    }
                  }}
                  onClick={() => {
                    if (isFunctionDef && functionAtLine) {
                      setSelectedFunction(functionAtLine);
                      setShowPrompt(true);
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightedCode ? line : line.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
                  }}
                />
              </div>
            );
          })}
          <div style={{ marginTop: '16px', color: '#6a9955', display: 'flex' }}>
            <LineNumber>...</LineNumber>
            <span style={{ fontStyle: 'italic' }}>...</span>
          </div>
        </div>
      </CodeContainer>

      {showPrompt && selectedFunction && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Paper sx={{ 
            p: 4, 
            maxWidth: 500, 
            mx: 2,
            borderRadius: 2,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
              Function Selected: {selectedFunction.name}()
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#6b7280', textAlign: 'center' }}>
              You&apos;ve selected a complete function! Would you like to work on adding documentation to this function?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowPrompt(false)}
                sx={{ px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setShowPrompt(false);
                  onFunctionSelect && onFunctionSelect(selectedFunction);
                }}
                sx={{ 
                  px: 3,
                  bgcolor: '#000000',
                  '&:hover': { bgcolor: '#1f2937' }
                }}
              >
                Add Documentation
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};

const FileContentView = ({ file, onFunctionSelect }) => {
  if (file.type === 'directory') {
    return null;
  }

  if (file.type === 'python') {
    return <PythonCodeViewer code={file.content} onFunctionSelect={onFunctionSelect} />;
  }

  if (file.type === 'text') {
    return (
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        padding: 3, 
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: 1.6,
        maxHeight: '500px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {file.content}
      </Box>
    );
  }

  if (file.type === 'data') {
    return (
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        padding: 3,
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>
          Data File: {file.id}
        </Typography>
        <Box sx={{ 
          backgroundColor: '#e5e7eb', 
          padding: 2, 
          borderRadius: 1, 
          mb: 2,
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            File Information:
          </Typography>
          <Typography variant="body2">Format: {file.id.split('.').pop().toUpperCase()}</Typography>
          <Typography variant="body2">Size: ~{Math.floor(Math.random() * 500 + 100)} MB</Typography>
          <Typography variant="body2">Dimensions: {Math.floor(Math.random() * 2000 + 1000)} × {Math.floor(Math.random() * 2000 + 1000)} pixels</Typography>
          <Typography variant="body2">Channels: {Math.floor(Math.random() * 4 + 1)}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
          Binary data file - use appropriate loading functions to access content
        </Typography>
      </Box>
    );
  }

  if (file.type === 'image') {
    return (
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        padding: 3,
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>
          Image File: {file.id}
        </Typography>
        <Box sx={{ 
          backgroundColor: '#e5e7eb', 
          padding: 2, 
          borderRadius: 1, 
          mb: 2,
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Image Properties:
          </Typography>
          <Typography variant="body2">Format: {file.id.split('.').pop().toUpperCase()}</Typography>
          <Typography variant="body2">Resolution: {Math.floor(Math.random() * 2000 + 1000)} × {Math.floor(Math.random() * 2000 + 1000)}</Typography>
          <Typography variant="body2">Color Depth: {Math.random() > 0.5 ? '8-bit' : '16-bit'}</Typography>
          <Typography variant="body2">File Size: ~{Math.floor(Math.random() * 50 + 5)} MB</Typography>
        </Box>
        <Box sx={{ 
          width: '100%', 
          height: 200, 
          backgroundColor: '#d1d5db', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #9ca3af'
        }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Image Preview Placeholder
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography>Unsupported file type: {file.type}</Typography>
    </Box>
  );
};

const ExampleSolutionViewer = ({ code }) => {
  const [highlightedCode, setHighlightedCode] = useState('');

  const processTripleQuotedStrings = (highlightedHtml) => {
    // Work with the original code to identify triple-quoted sections
    // Then apply styling directly to the HTML
    
    // First, find all triple-quoted strings in the original code
    const tripleQuoteMatches = [];
    const patterns = [
      /"""[\s\S]*?"""/g,
      /'''[\s\S]*?'''/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        tripleQuoteMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[0]
        });
      }
    });
    
    if (tripleQuoteMatches.length === 0) {
      return highlightedHtml;
    }
    
    // Process each line and apply orange styling to triple-quoted content
    const codeLines = code.split('\n');
    const htmlLines = highlightedHtml.split('\n');
    
    let currentPos = 0;
    const processedLines = htmlLines.map((htmlLine, lineIndex) => {
      const codeLine = codeLines[lineIndex] || '';
      const lineStart = currentPos;
      const lineEnd = currentPos + codeLine.length;
      
      // Check if this line contains any part of a triple-quoted string
      const isInTripleQuote = tripleQuoteMatches.some(match => 
        (match.start >= lineStart && match.start <= lineEnd) || // starts on this line
        (match.end >= lineStart && match.end <= lineEnd) || // ends on this line  
        (match.start <= lineStart && match.end >= lineEnd) // spans this line
      );
      
      currentPos = lineEnd + 1; // +1 for newline
      
      if (isInTripleQuote) {
        // Apply green color for docstrings to match Your Solution tab
        return `<span style="color: #6a9955; font-style: italic;">${htmlLine.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')}</span>`;
      }
      
      return htmlLine;
    });
    
    return processedLines.join('\n');
  };

  useEffect(() => {
    const loadHighlightJS = async () => {
      if (typeof window !== 'undefined' && window.hljs) {
        try {
          const result = window.hljs.highlight(code, { language: 'python' });
          let processedCode = result.value;
          
          // Apply green color processing for triple-quoted strings to match Your Solution tab
          processedCode = processTripleQuotedStrings(processedCode);
          
          setHighlightedCode(processedCode);
        } catch (error) {
          console.error('Highlighting error:', error);
          setHighlightedCode('');
        }
      }
    };
    loadHighlightJS();
  }, [code]);

  const codeLines = highlightedCode ? highlightedCode.split('\n') : code.split('\n');

  return (
    <>
      {codeLines.map((line, index) => (
        <Box key={`example-${index}`} sx={{ display: 'flex', minHeight: '21px', alignItems: 'flex-start', px: 2 }}>
          <LineNumber>{String(index + 1).padStart(2, '0')}</LineNumber>
          <div 
            style={{ 
              flex: 1, 
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontSize: '14px',
              lineHeight: 1.5,
              whiteSpace: 'pre',
              overflow: 'visible'
            }}
            dangerouslySetInnerHTML={{ 
              __html: highlightedCode ? line : line.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
            }}
          />
        </Box>
      ))}
    </>
  );
};

const DocumentationScreen = ({ selectedFunction, selectedFile, onBackToScript }) => {
  const [docstring, setDocstring] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const [showLineSelection, setShowLineSelection] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonTab, setComparisonTab] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [validationAnswers, setValidationAnswers] = useState({
    describes: '',
    inputs: '',
    outputs: '',
    example: ''
  });
  const [savedDocstrings, setSavedDocstrings] = useState([]);
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [hasEditedDocstring, setHasEditedDocstring] = useState(false);
  const [selectedCommentLines, setSelectedCommentLines] = useState(new Set());
  const [selectedLinesForCommenting, setSelectedLinesForCommenting] = useState(new Set());
  const [inlineComments, setInlineComments] = useState(new Map());
  const [commentLineContent, setCommentLineContent] = useState(new Map()); // Store line content for each comment line
  const [hoveredCommentLine, setHoveredCommentLine] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTooltipTimeoutRef = useRef(null);
  const [presentLineContent, setPresentLineContent] = useState('');
  const [loading, setLoading] = useState({
    "docstring": `"""
loading.py

Format-specific image loading helpers plus a simple parameter lookup for
subsequent preprocessing decisions.  No external documentation tooling
assumed; plain docstrings only.

Supported formats
-----------------
* .nd2 – Nikon Elements files
* .tiff/.tif – multipage or OME‑TIFF stacks
* .nwb – NeurodataWithoutBorders containers
"""`,
    "from nd2reader import ND2Reader": [
      "Module docstring explaining format-specific image loading helpers and supported formats",
      "Module docstring explaining format-specific image loading helpers and supported formats"
    ],
    "raw_data = ND2Reader(file_path)": [
      "# Get image",
      "# Extract raw file data"
    ],
    "microscopy_volume = np.transpose(raw_data, (1, 2, 0))": [
      "# Rearrange image from (z, x, y) --> (x, y, z)",
      "# Arrange image dimensions as (x, y, z)"
    ],
    "io_obj = NWBHDF5IO(file_path, mode=\"r\")": [
      "# Load file.",
      "# Create a reader object."
    ],
    "nwb_file = io_obj.read()": [
      "# Read file.",
      "# Open the file reader."
    ],
    "image_data = nwb_file.acquisition['NeuroPALImageRaw'].data[:]": [
      "# Get image & rgb channels.",
      "# Extract the raw image data & the indices of the channels corresponding to the red, green, and blue colors."
    ],
    "io_obj.close()": [
      "# Close file.",
      "# Close the file reader since we now have all the data we need."
    ],
    "rotated_image = np.transpose(image_data, (1, 0, 2, 3))": [
      "# Rearrange image (z, x, y, c) --> (x, y, z, c).",
      "# Transpose the image to ensure that it is in (x, y, z, c) order."
    ],
    "microscopy_volume = rotated_image[:, :, :, rgb_channel_indices]": [
      "# Get just rgb channels.",
      "# Isolate the image to just RGB colors."
    ],
    "image_dtype = microscopy_volume.dtype": [
      "# Convert image to 8bit.",
      "# Map image onto 8-bit range (0-255)"
    ]
  });
  const [plotting, setPlotting] = useState({
    "docstring": `"""
plotting.py

Minimal plotting utilities for visualising intermediate and final processing results.
"""`,
    "import matplotlib.pyplot as plt": [
      "Module docstring explaining minimal plotting utilities for visualising intermediate and final processing results",
      "Module docstring explaining minimal plotting utilities for visualising intermediate and final processing results"
    ],
    "fig, axes = plt.subplots(1, num_images, figsize=(4 * num_images, 3))": [
      "# One row, N columns – scale width linearly with number of images.",
      "# Define subplot grid according to number of images."
    ],
    "current_axes = 0": [
      "# Initialize index of axes whose image is being plotted.",
      "# Initialize zero variable."
    ],
    "for label, image in generated_images.items():": [
      "# Iterate through the (label, image) pairs and plot each one.",
      "# Plot images one by one."
    ]
  });
  const [preprocessing, setPreprocessing] = useState({
    "docstring": `"""
preprocessing.py

Utility functions for basic preprocessing of microscopy data.
"""`,
    "import numpy as np": [
      "Module docstring explaining utility functions for basic preprocessing of microscopy data",
      "Module docstring explaining utility functions for basic preprocessing of microscopy data"
    ],
    "dimensions = np.array(image.shape)": [
      "# Convert shape tuple to a numpy array so we can use numeric operations.",
      "# Get image shape"
    ],
    "z_index = np.argmin(dimensions)": [
      "# For data without a color channel dimension, take the smallest dimension.",
      "# Get smallest dimension index"
    ],
    "z_index = np.argpartition(dimensions, 1)[1]": [
      "# For data with a color channel dimension, choose the second smallest dimension.  This heuristic avoids picking the channel or time axis when those happen to match the slice count.",
      "# Get second smallest dimension index"
    ],
    "maximum_intensity_projection = np.max(image, axis=z_index)": [
      "# Collapse the chosen axis by taking the maximum value.",
      "# Calculate the maximum intensity projection by setting (x, y) pixel equal to the highest value in the set of values that coordinate has across all z-slices."
    ],
    "bottom_capped_image = image - lowest_pixel_value": [
      "# Shift so the minimum becomes zero, then scale by the range.",
      "# Normalize image"
    ],
    "bg = np.percentile(image, background_percentile)": [
      "# Estimate background threshold.",
      "# Get background threshold corresponding to the given percentile value"
    ],
    "row_indices = np.where(non_bg.any(axis=1))[0]": [
      "# Coordinates where foreground is present along each axis.",
      "# Find appropriate places column & row to cut"
    ],
    "row_slice = slice(row_indices[0], row_indices[-1] + 1)": [
      "# Slice to the first / last foreground rows and columns.",
      "# Create image indices"
    ],
    "image = image[row_slice, col_slice]": [
      "# Index the image around the target region.",
      "# Crop image"
    ]
  });
  const [main, setMain] = useState({
    "docstring": "main.py\nLoad microscopy / neurophysiology image data in one of several supported formats and apply a consistent set of\npreprocessing steps as required by each format. The script also saves per‑file figures visualizing each file after\nevery preprocessing steps, as well as an overview plot of the fully processed images.\nSupported formats\n-----------------\n* .nd2 – Nikon Elements files\n* .tiff/.tif – multipage or OME‑TIFF stacks\n* .nwb – NeurodataWithoutBorders containers\nHelper modules expected in src:\n* loading – format‑specific readers and metadata loaders\n* preprocessing – normalisation, cropping, down‑sampling, smoothing\n* plotting – figure generation utilities",
    "if path.endswith('.nd2'):": [
      "# Decide which low‑level loader to call based on the file extension.",
      "# Get file format"
    ],
    "image_parameters = {": [
      "# Pack the flags into a dictionary so later code is self‑explanatory.",
      "# Package results"
    ],
    "files = ['20191010_tail_01.nd2', '20240523_Vang-1_37.tif', 'sub-11-YAaLR_ophys.nwb']": [
      "# Files to be processed.",
      "# The list of files we will be working with."
    ],
    "processed_images = []": [
      "# Initialize a list to keep track of the fully processed images.",
      "# List of finished images"
    ],
    "image, image_parameters = load_file(f\"data\\\\{filename}\")": [
      "# 1. Load data and processing flags",
      "# 1. Load file"
    ],
    "if not image_parameters['is_mip']:": [
      "# 2. Conditional steps based on per‑file flags",
      "# 2. Check if image is (mip/normalized/cropped) and if not then do that"
    ],
    "image = preprocessing.downsample_image(image=image, factor=image_parameters['downsampling_factor'])": [
      "# 3. Always‑run steps controlled by numeric parameters",
      "# 3. Downsample & blur"
    ],
    "file_identifier = filename.split('.')[0]": [
      "# 4. Write a side‑by‑side comparison figure for this file",
      "# 4. Plot each step's image"
    ],
    "plotting.plot_multiple_files(filenames=files, images=processed_images, output_path=f\"results\\\\overview.png\")": [
      "# 5. Save an overview plot of the final images",
      "# 5. Plot all the finished images"
    ],
    "for filename in files:": [
      "# Iterate over each file"
    ]
  });

  // Add CSS for placeholder styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .comment-input::placeholder {
        color: #be185d !important;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Debug: Log when showValidation changes and scroll to questions
  useEffect(() => {
    console.log('showValidation state changed to:', showValidation);
    if (showValidation) {
      // Scroll to validation questions after they appear
      setTimeout(() => {
        const validationSection = document.querySelector('[data-validation-section]');
        if (validationSection) {
          validationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [showValidation]);

  // Parse function to get signature and body
  const parseFunctionStructure = (functionCode) => {
    const lines = functionCode.split('\n');
    const defLine = lines.find(line => line.trim().startsWith('def '));
    const defLineIndex = lines.findIndex(line => line.trim().startsWith('def '));
    
    // Get function signature
    const signature = defLine ? defLine.trim() : 'def function():';
    
    // Get function body (everything after def line, preserving original formatting)
    const bodyLines = lines.slice(defLineIndex + 1);
    const indentedBody = bodyLines.map(line => line);
    
    return { signature, body: indentedBody };
  };

  const { signature, body } = parseFunctionStructure(selectedFunction.code);

  const handleDocstringChange = (event) => {
    setDocstring(event.target.value);
    if (event.target.value.trim() && !hasEditedDocstring) {
      setHasEditedDocstring(true);
    }
  };

  const handleDocstringBlur = () => {
    setIsEditing(false);
  };

  const handleDocstringFocus = () => {
    setIsEditing(true);
  };

  const templates = [
    {
      content: `def {function_name}({inputs}):
    """
    {FUNCTION_NAME}: {function description}
    
    Inputs:
    - {input_1}: {description of input_1}
    - {input_2}: {description of input_2}
    
    Outputs:
    - {output}: {description of output}
    
    Example Usage:
    {example usage}
    """
    {function content}
    return {output}`
    },
    {
      content: `def {function_name}({inputs}):
    """
    Brief description of what this function does.
    
    Parameters:
    ----------
    {input_1} : {type}
        Description of the first parameter
    {input_2} : {type}
        Description of the second parameter
    
    Returns:
    -------
    {type}
        Description of the return value
    """
    {function content}
    return {output}`
    },
    {
      content: `def {function_name}({inputs}):
    """
    {One line description}
    
    Args:
        {input_1}: {description}
        {input_2}: {description}
    
    Returns:
        {description of return value}
    
    Raises:
        {ExceptionType}: {description of when this exception is raised}
    """
    {function content}
    return {output}`
    }
  ];

  const handleValidationAnswer = (question, answer) => {
    setValidationAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };


  const handleContinueToNextStep = () => {
    console.log('handleContinueToNextStep called');
    console.log('docstring:', docstring.trim());
    console.log('showValidation before:', showValidation);
    
    if (docstring.trim()) {
      console.log('Conditions met, proceeding...');
      
      // Save the docstring
      const docstringData = {
        fileName: 'main.py',
        functionName: selectedFunction.name,
        startLine: selectedFunction.startLine + 1,
        endLine: selectedFunction.endLine + 1,
        docstring: docstring.trim(),
        timestamp: new Date().toISOString()
      };

      setSavedDocstrings(prev => {
        const filtered = prev.filter(item => 
          !(item.fileName === docstringData.fileName && item.functionName === docstringData.functionName)
        );
        return [...filtered, docstringData];
      });
      
      console.log('Saved docstring:', docstringData);
      
      // Show validation immediately
      setShowValidation(true);
      console.log('Validation set to true');
      
    } else {
      console.log('No docstring found');
    }
  };

  const handleInsertTemplate = () => {
    const templateContent = templates[currentTemplate].content;
    
    // Extract only the content between the triple quotes
    const tripleQuoteMatch = templateContent.match(/"""([\s\S]*?)"""/);
    if (tripleQuoteMatch && tripleQuoteMatch[1]) {
      // Get the content between the quotes and clean it up
      let docstringContent = tripleQuoteMatch[1];
      // Remove leading/trailing whitespace from each line but preserve structure
      const lines = docstringContent.split('\n');
      const cleanedLines = lines.map(line => line.trimEnd()); // Remove trailing spaces but keep leading indentation
      // Remove completely empty lines at start and end
      while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
        cleanedLines.shift();
      }
      while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
        cleanedLines.pop();
      }
      setDocstring(cleanedLines.join('\n'));
    } else {
      // Fallback to original content if no triple quotes found
      setDocstring(templateContent);
    }
    
    setShowHelp(false);
    setIsEditing(true);
  };

  const handleEditDocstring = () => {
    // Reset validation state to go back to docstring editing
    setShowValidation(false);
    setShowLineSelection(false);
    setShowInlineComments(false);
    setIsEditing(true);
    // Reset all answers to blank for next time
    setValidationAnswers({
      describes: '',
      inputs: '',
      outputs: '',
      example: ''
    });
    // Clear selected lines
    setSelectedLinesForCommenting(new Set());
  };

  const allQuestionsAnswered = Object.values(validationAnswers).every(answer => answer === 'YES' || answer === 'NO' || answer === 'UNSURE');
  const allAnswersYes = Object.values(validationAnswers).every(answer => answer === 'YES');
  const hasNoAnswers = Object.values(validationAnswers).some(answer => answer === 'NO');
  const hasUnsureAnswers = Object.values(validationAnswers).some(answer => answer === 'UNSURE');
  const hasUnansweredQuestions = Object.values(validationAnswers).some(answer => answer === '');

  // Generate specific feedback based on which questions have NO or UNSURE answers
  const getSpecificFeedback = () => {
    const feedback = [];
    
    if (validationAnswers.describes === 'NO') {
      feedback.push({
        type: 'error',
        title: 'Your docstring needs some work.',
        message: 'The exact extent of the function description depends on the complexity of your function, but you should generally make sure that it covers each of the following:\n\n1. Basic aim: What does your function do and why?\n2. Process: How does your function accomplish its aim, and what major steps are involved?\n3. Process-altering conditions: Does you function support a number of different ways of accomplishing its aim, and select one based on a passed argument, or if an input meets a particular condition?\n4. Important notes & caveats: Does your function rely on a particular assumption? Does it produce an unintuitive result if an input is of a particular datatype? You\'ll want to spell out warnings for things of that nature.\n\nTry to adjust your docstring to meet this requirement.'
      });
    } else if (validationAnswers.describes === 'UNSURE') {
      feedback.push({
        type: 'warning',
        title: 'Consider Improving Your Function Description',
        message: 'The exact extent of the function description depends on the complexity of your function, but you should generally make sure that it covers each of the following:\n\n1. Basic aim: What does your function do and why?\n2. Process: How does your function accomplish its aim, and what major steps are involved?\n3. Process-altering conditions: Does you function support a number of different ways of accomplishing its aim, and select one based on a passed argument, or if an input meets a particular condition?\n4. Important notes & caveats: Does your function rely on a particular assumption? Does it produce an unintuitive result if an input is of a particular datatype? You\'ll want to spell out warnings for things of that nature.\n\nDoes your docstring meet these requirements?'
      });
    }

    if (validationAnswers.inputs === 'NO') {
      feedback.push({
        type: 'error',
        title: 'Your docstring needs some work.',
        message: 'A complete docstring should list every input argument and its expected datatype(s). It should also clearly explain the purpose the input serves in the context of the function (e.g. What is it used for? What are we doing with it?).\n\nTry to adjust your docstring to meet this requirement.'
      });
    } else if (validationAnswers.inputs === 'UNSURE') {
      feedback.push({
        type: 'warning',
        title: 'Consider Improving Your Function Description',
        message: 'A complete docstring should list every input argument and its expected datatype(s). It should also clearly explain the purpose the input serves in the context of the function (e.g. What is it used for? What are we doing with it?).\n\nDoes your docstring meet this requirement?'
      });
    }

    if (validationAnswers.outputs === 'NO') {
      feedback.push({
        type: 'error',
        title: 'Your docstring needs some work.',
        message: 'A complete docstring should list every output it returns and its expected datatype(s). In the case of more complex data structures, it should also describe the nature of their contents. For example:\n\n- Dictionaries should have their keys listed and their corresponding values described.\n- Numpy arrays with consistent dimensions should have those dimensions listed and explained (e.g. instead of "Numpy array", consider "Numpy array of dimensions (x, y, z, c), where c represents a color channel")\n- Pandas dataframes should have their column names listed.\n\nTry to adjust your docstring to meet this requirement.'
      });
    } else if (validationAnswers.outputs === 'UNSURE') {
      feedback.push({
        type: 'warning',
        title: 'Consider Improving Your Function Description',
        message: 'A complete docstring should list every output it returns and its expected datatype(s). In the case of more complex data structures, it should also describe the nature of their contents. For example:\n\n- Dictionaries should have their keys listed and their corresponding values described.\n- Numpy arrays with consistent dimensions should have those dimensions listed and explained (e.g. instead of "Numpy array", consider "Numpy array of dimensions (x, y, z, c), where c represents a color channel")\n- Pandas dataframes should have their column names listed.\n\nDoes your docstring meet this requirement?'
      });
    }

    if (validationAnswers.example === 'NO') {
      feedback.push({
        type: 'error',
        title: 'Your docstring needs some work.',
        message: 'This is not as strict of a requirement, but can prove valuable down the line should the script be run through any pipelines that automatically generate documentation, as is the case with some tools (e.g. sphinx). You don\'t need to overthink this part, it can be as simple as the following example:\n\n```python\nUsage:\n    function_name(arg1, arg2, arg3)\n```\n\nTry to adjust your docstring to meet this requirement.'
      });
    } else if (validationAnswers.example === 'UNSURE') {
      feedback.push({
        type: 'warning',
        title: 'Consider Improving Your Function Description',
        message: 'This is not as strict of a requirement, but can prove valuable down the line should the script be run through any pipelines that automatically generate documentation, as is the case with some tools (e.g. sphinx). You don\'t need to overthink this part, it can be as simple as the following example:\n\n```python\nUsage:\n    function_name(arg1, arg2, arg3)\n```\n\nDoes your docstring meet this requirement?'
      });
    }

    return feedback;
  };

  const specificFeedback = getSpecificFeedback();

  const validationQuestions = [
    {
      key: 'describes',
      text: 'Does your docstring offer a comprehensive description the function?'
    },
    {
      key: 'inputs',
      text: `Does your docstring clearly explain the inputs of ${selectedFunction.name}() and their expected properties?`
    },
    {
      key: 'outputs',
      text: `Does your docstring clearly explain the outputs of ${selectedFunction.name}() and their expected properties?`
    },
    {
      key: 'example',
      text: 'Does your docstring include an example of how to call this function?'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', py: 3 }}>
      <Container maxWidth="md">
        {/* <StyledCard>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="text.primary" fontWeight={500} textAlign="center">
              {showInlineComments ? 'Screen 5a' : '{Activity Title}'}
            </Typography>
          </CardContent>
        </StyledCard> */}

        {!showInlineComments && (
        <StyledCard>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
              To begin, let&apos;s add a multi-line comment at the start of the function describing its 
              what it does, what its inputs are, and what outputs the user should expect. This 
              kind of comment is called a docstring, and makes it much easier to understand a 
              function at a glance.
            </Typography>
          </CardContent>
        </StyledCard>
        )}

        {!showInlineComments && (
        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <CodeContainer sx={{ maxHeight: 'none', padding: 0 }}>
            {/* Function signature line */}
            <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2, py: 1 }}>
              <LineNumber>01</LineNumber>
              <Typography sx={{ 
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontSize: '14px',
                color: '#d4d4d4'
              }}>
                {signature}
              </Typography>
            </Box>

            {/* Opening docstring quotes */}
            <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
              <LineNumber>02</LineNumber>
              <Typography sx={{ 
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontSize: '14px',
                color: '#ce9178',
                ml: 2
              }}>
              &quot;&quot;&quot;
              </Typography>
            </Box>

            {/* Editable docstring area */}
            <Box sx={{ 
              display: 'flex', 
              minHeight: '60px', 
              alignItems: 'flex-start', 
              px: 2,
              backgroundColor: isEditing ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              transition: 'background-color 0.2s ease'
            }}>
              <LineNumber>03</LineNumber>
              <Box sx={{ 
                flex: 1, 
                ml: 2,
                position: 'relative'
              }}>
                <textarea
                  value={docstring}
                  onChange={handleDocstringChange}
                  onFocus={handleDocstringFocus}
                  onBlur={handleDocstringBlur}
                  placeholder="Add your docstring here - describe what the function does, its parameters, and return value..."
                  disabled={showValidation}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '8px 12px',
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: showValidation ? '#9ca3af' : '#d4d4d4',
                    backgroundColor: showValidation ? 'rgba(100, 116, 139, 0.05)' : (isEditing ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.1)'),
                    border: showValidation ? '2px solid #e5e7eb' : (isEditing ? '2px solid #3b82f6' : '2px solid transparent'),
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    cursor: showValidation ? 'not-allowed' : 'text',
                    '::placeholder': {
                      color: '#9ca3af'
                    }
                  }}
                />
                {!docstring && !isEditing && (
                  <Box sx={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    color: '#9ca3af',
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    pointerEvents: 'none',
                    fontStyle: 'italic'
                  }}>
                    {'{docstring}'}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Closing docstring quotes */}
            <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
              <LineNumber>04</LineNumber>
              <Typography sx={{ 
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontSize: '14px',
                color: '#ce9178',
                ml: 2
              }}>
               &quot;&quot;&quot;
              </Typography>
            </Box>

            {/* Function body - all lines */}
            {body.map((line, index) => (
              <Box key={index} sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                <LineNumber>{String(index + 5).padStart(2, '0')}</LineNumber>
                <Typography sx={{ 
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  fontSize: '14px',
                  color: '#d4d4d4',
                  whiteSpace: 'pre'
                }}>
                  {line || ''}
                </Typography>
              </Box>
            ))}
          </CodeContainer>
        </Paper>
        )}

        {/* Need Help button - only show before editing docstring and before finishing */}
        {!hasEditedDocstring && !showValidation && !showInlineComments && (
          <StyledCard sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
                Need help writing a docstring? Click below for templates and examples.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setShowHelp(true)}
                sx={{ 
                  bgcolor: '#000000', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1f2937' },
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                NEED HELP?
              </Button>
            </CardContent>
          </StyledCard>
        )}

        {/* Docstring guidelines - show when editing */}
        {isEditing && hasEditedDocstring && !showValidation && !showInlineComments && (
          <StyledCard sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                💡 Docstring Guidelines:
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                • Describe what the function does in one clear sentence<br/>
                • List the parameters and their types<br/>
                • Explain what the function returns<br/>
                • Keep it concise but informative
              </Typography>
            </CardContent>
          </StyledCard>
        )}

        {!showValidation && !showInlineComments && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={onBackToScript}
              sx={{ 
                bgcolor: '#000000', 
                color: 'white',
                '&:hover': { bgcolor: '#1f2937' },
                px: 4,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              BACK TO SCRIPT
            </Button>
            <Button 
              variant="contained" 
              disabled={!docstring.trim() || showValidation}
              onClick={handleContinueToNextStep}
              sx={{ 
                bgcolor: (docstring.trim() && !showValidation) ? '#000000' : '#9ca3af',
                color: 'white',
                '&:hover': { 
                  bgcolor: (docstring.trim() && !showValidation) ? '#1f2937' : '#9ca3af' 
                },
                px: 4,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                flexGrow: 1,
                maxWidth: '400px',
                cursor: showValidation ? 'not-allowed' : 'pointer'
              }}
            >
              {showValidation 
                ? 'STEP COMPLETED' 
                : (docstring.trim() ? 'CONTINUE TO NEXT STEP' : 'ENTER DOCSTRING TO PROCEED')
              }
            </Button>
          </Box>
        )}

        {/* Validation Questions Section - Tabular Format */}
        {showValidation && !showInlineComments && (
          <StyledCard sx={{ mt: 3 }}>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Please review your docstring:
              </Typography>
              
              {/* Table Header */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 100px 100px 120px', 
                gap: 3, 
                alignItems: 'center',
                pb: 2,
                borderBottom: '2px solid #e5e7eb',
                mb: 2
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Question
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', textAlign: 'center' }}>
                  Yes
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', textAlign: 'center' }}>
                  No
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', textAlign: 'center' }}>
                  I&apos;m not sure
                </Typography>
              </Box>

              {/* Table Rows */}
              {validationQuestions.map((question, index) => (
                <Box key={question.key} sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 100px 100px 120px', 
                  gap: 3, 
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index < validationQuestions.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.5 }}>
                    {question.text}
                  </Typography>
                  
                  {/* Yes Radio Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                      onClick={() => handleValidationAnswer(question.key, 'YES')}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid #000000',
                        backgroundColor: validationAnswers[question.key] === 'YES' ? '#000000' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: validationAnswers[question.key] === 'YES' ? '#1f2937' : 'rgba(0, 0, 0, 0.05)'
                        }
                      }}
                    >
                      {validationAnswers[question.key] === 'YES' && (
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'white' }} />
                      )}
                    </Box>
                  </Box>

                  {/* No Radio Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                      onClick={() => handleValidationAnswer(question.key, 'NO')}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid #000000',
                        backgroundColor: validationAnswers[question.key] === 'NO' ? '#000000' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: validationAnswers[question.key] === 'NO' ? '#1f2937' : 'rgba(0, 0, 0, 0.05)'
                        }
                      }}
                    >
                      {validationAnswers[question.key] === 'NO' && (
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'white' }} />
                      )}
                    </Box>
                  </Box>

                  {/* I'm not sure Radio Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                      onClick={() => handleValidationAnswer(question.key, 'UNSURE')}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid #000000',
                        backgroundColor: validationAnswers[question.key] === 'UNSURE' ? '#000000' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: validationAnswers[question.key] === 'UNSURE' ? '#1f2937' : 'rgba(0, 0, 0, 0.05)'
                        }
                      }}
                    >
                      {validationAnswers[question.key] === 'UNSURE' && (
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'white' }} />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
              
              {/* Info Message for Unanswered Questions */}
              {hasUnansweredQuestions && specificFeedback.length === 0 && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#f0f9ff', 
                  borderLeft: '4px solid #3b82f6',
                  borderRadius: '0 8px 8px 0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      fontSize: '1.25rem',
                      color: '#2563eb',
                      lineHeight: 1
                    }}>
                      📝
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e40af', mb: 1 }}>
                        Please answer all questions
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e3a8a', lineHeight: 1.5 }}>
                        Review each question and select &quot;Yes&quot;, &quot;No&quot;, or &quot;I&apos;m not sure&quot; based on your docstring content.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Specific Feedback Messages */}
              {specificFeedback.map((feedback, index) => (
                <Box key={index} sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: feedback.type === 'error' ? '#fef2f2' : '#fffbeb', 
                  borderLeft: `4px solid ${feedback.type === 'error' ? '#ef4444' : '#f59e0b'}`,
                  borderRadius: '0 8px 8px 0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      fontSize: '1.25rem',
                      color: feedback.type === 'error' ? '#dc2626' : '#d97706',
                      lineHeight: 1
                    }}>
                      {feedback.type === 'error' ? '❌' : '⚠️'}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600, 
                        color: feedback.type === 'error' ? '#dc2626' : '#d97706', 
                        mb: 1 
                      }}>
                        {feedback.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: feedback.type === 'error' ? '#991b1b' : '#92400e', 
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line'
                      }}>
                        {feedback.message}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Success Message for All Yes */}
              {allAnswersYes && !hasUnansweredQuestions && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#f0fdf4', 
                  borderLeft: '4px solid #22c55e',
                  borderRadius: '0 8px 8px 0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      fontSize: '1.25rem',
                      color: '#16a34a',
                      lineHeight: 1
                    }}>
                      ✅
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#166534' }}>
                      Great! Your docstring looks comprehensive.
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
                {/* Edit Docstring Button - shown when there is specific feedback */}
                {specificFeedback.length > 0 && (
                  <Button 
                    variant="outlined"
                    onClick={handleEditDocstring}
                    sx={{ 
                      borderColor: '#dc2626',
                      color: '#dc2626',
                      '&:hover': { 
                        borderColor: '#b91c1c',
                        backgroundColor: '#fef2f2'
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    EDIT DOCSTRING
                  </Button>
                )}

                {/* Continue Button - only enabled when all answers are Yes */}
                <Button 
                  variant="contained" 
                  disabled={!allAnswersYes || hasUnansweredQuestions}
                  onClick={() => setShowLineSelection(true)}
                  sx={{ 
                    bgcolor: (allAnswersYes && !hasUnansweredQuestions) ? '#000000' : '#9ca3af',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: (allAnswersYes && !hasUnansweredQuestions) ? '#1f2937' : '#9ca3af' 
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginLeft: specificFeedback.length > 0 ? 0 : 'auto'
                  }}
                >
                  {hasUnansweredQuestions 
                    ? 'PLEASE ANSWER ALL QUESTIONS' 
                    : allAnswersYes 
                      ? 'CONTINUE TO NEXT STEP' 
                      : 'ALL QUESTIONS MUST BE YES TO PROCEED'
                  }
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        )}

        {/* Line Selection Screen (5a) */}
        {showLineSelection && !showInlineComments && (
          <StyledCard sx={{ mt: 3 }}>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Select lines where you want to add comments:
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                Click on any line that you think needs a comment to explain what it does. Selected lines will be highlighted in pink.
              </Typography>

              {/* Code Display with Line Selection */}
              <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <CodeContainer sx={{ maxHeight: 'none', padding: 0 }}>
                  {/* Function signature line */}
                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2, py: 1 }}>
                    <LineNumber>01</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#569cd6',
                      ml: 2
                    }}>
                      {selectedFunction.code.split('\n')[0]}
                    </Typography>
                  </Box>

                  {/* Opening docstring quotes */}
                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>02</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#ce9178',
                      ml: 2
                    }}>
                      &quot;&quot;&quot;
                    </Typography>
                  </Box>

                  {/* Saved docstring content */}
                  {savedDocstrings.length > 0 && savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').map((docLine, docIndex) => (
                    <Box key={`doc-${docIndex}`} sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                      <LineNumber>{String(docIndex + 3).padStart(2, '0')}</LineNumber>
                      <Typography sx={{ 
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        fontSize: '14px',
                        color: '#6a9955',
                        fontStyle: 'italic',
                        ml: 2
                      }}>
                        {docLine}
                      </Typography>
                    </Box>
                  ))}

                  {/* Closing docstring quotes */}
                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>{String((savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0) + 3).padStart(2, '0')}</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#ce9178',
                      ml: 2
                    }}>
                      &quot;&quot;&quot;
                    </Typography>
                  </Box>

                  {/* Function body - clickable lines */}
                  {selectedFunction.code.split('\n').slice(1).map((line, index) => {
                    const docstringLines = savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0;
                    const lineNumber = index + docstringLines + 4; // Account for def line, opening """, docstring, closing """
                    const isClickableLine = line.trim().length > 0;
                    const isSelected = selectedLinesForCommenting.has(lineNumber);
                    
                    return (
                      <React.Fragment key={`line-${index}`}>
                        {/* Pink #new comment line above selected lines */}
                        {isSelected && (
                          <Box sx={{ 
                            display: 'flex', 
                            minHeight: '21px', 
                            alignItems: 'center', 
                            px: 2,
                            backgroundColor: 'rgba(255, 192, 203, 0.3)', // Light pink background
                            borderLeft: '3px solid #ec4899' // Pink border
                          }}>
                            <LineNumber sx={{ color: '#9ca3af' }}>{String(lineNumber).padStart(2, '0')}</LineNumber>
                            <Typography sx={{ 
                              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                              fontSize: '14px',
                              color: '#ec4899', // Pink text
                              ml: 2,
                              fontStyle: 'italic'
                            }}>
                              # new comment
                            </Typography>
                          </Box>
                        )}
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            minHeight: '21px', 
                            alignItems: 'center', 
                            px: 2,
                            position: 'relative',
                            cursor: isClickableLine ? 'pointer' : 'default',
                            '&:hover': isClickableLine ? {
                              backgroundColor: 'rgba(255, 192, 203, 0.2)' // Light pink hover
                            } : {}
                          }}
                          onClick={() => {
                          if (isClickableLine) {
                            const newSelected = new Set(selectedLinesForCommenting);
                            const newCommentLineContent = new Map(commentLineContent);
                            
                            if (isSelected) {
                              newSelected.delete(lineNumber);
                              newCommentLineContent.delete(lineNumber);
                            } else {
                              newSelected.add(lineNumber);
                              newCommentLineContent.set(lineNumber, line.trim());
                            }
                            
                            setSelectedLinesForCommenting(newSelected);
                            setCommentLineContent(newCommentLineContent);
                          }
                        }}
                      >
                        {/* Pink highlight overlay */}
                        {isSelected && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 192, 203, 0.4)', // Pink highlight
                            zIndex: 1,
                            pointerEvents: 'none'
                          }} />
                        )}
                        
                        <LineNumber sx={{ zIndex: 2 }}>{String(lineNumber).padStart(2, '0')}</LineNumber>
                        <Typography sx={{ 
                          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                          fontSize: '14px',
                          color: '#d4d4d4',
                          ml: 2,
                          zIndex: 2,
                          opacity: isClickableLine ? 1 : 0.5
                        }}>
                          {line}
                        </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </CodeContainer>
              </Paper>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setShowLineSelection(false);
                    setShowValidation(true);
                    setSelectedLinesForCommenting(new Set());
                  }}
                  sx={{ 
                    borderColor: '#6b7280',
                    color: '#6b7280',
                    '&:hover': { 
                      borderColor: '#374151',
                      backgroundColor: 'rgba(107, 114, 128, 0.05)'
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  BACK TO VALIDATION
                </Button>

                <Button 
                  variant="contained"
                  disabled={selectedLinesForCommenting.size === 0}
                  onClick={() => {
                    // Auto-create comment boxes with "# New Comment" for selected lines
                    const newComments = new Map(inlineComments);
                    const newSelectedCommentLines = new Set(selectedCommentLines);
                    
                    selectedLinesForCommenting.forEach(lineNumber => {
                      if (!newComments.has(lineNumber)) {
                        newComments.set(lineNumber, '# New Comment');
                        newSelectedCommentLines.add(lineNumber);
                      }
                    });
                    
                    setInlineComments(newComments);
                    setSelectedCommentLines(newSelectedCommentLines);
                    setShowLineSelection(false);
                    setShowInlineComments(true);
                  }}
                  sx={{ 
                    bgcolor: selectedLinesForCommenting.size > 0 ? '#000000' : '#9ca3af',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: selectedLinesForCommenting.size > 0 ? '#1f2937' : '#9ca3af' 
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {selectedLinesForCommenting.size === 0 
                    ? 'SELECT LINES TO CONTINUE' 
                    : `CONTINUE WITH ${selectedLinesForCommenting.size} SELECTED LINE${selectedLinesForCommenting.size > 1 ? 'S' : ''}`
                  }
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        )}

        {/* Inline Comments Section */}
        {showInlineComments && (
          <>
            <StyledCard sx={{ mt: 3 }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                  Next, let&apos;s place in-line comments. Your in-line comments should be placed ahead 
                  of any code that branches off of the current undertaking and clarify what is 
                  happening between now and the next comment. In our function below, select all 
                  the places in which you think a comment should be placed.
                </Typography>
              </CardContent>
            </StyledCard>

            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
              <CodeContainer sx={{ maxHeight: 'none', padding: 0 }}>
                {/* Function signature line */}
                <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2, py: 1 }}>
                  <LineNumber>01</LineNumber>
                  <Typography sx={{ 
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    color: '#d4d4d4'
                  }}>
                    {signature}
                  </Typography>
                </Box>

                {/* Opening docstring quotes */}
                <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                  <LineNumber>02</LineNumber>
                  <Typography sx={{ 
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    color: '#ce9178',
                    ml: 2
                  }}>
                    &quot;&quot;&quot;
                  </Typography>
                </Box>

                {/* Saved docstring content */}
                {savedDocstrings.length > 0 && savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').map((docLine, docIndex) => (
                  <Box key={`doc-${docIndex}`} sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>{String(docIndex + 3).padStart(2, '0')}</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#6a9955',
                      fontStyle: 'italic',
                      ml: 2
                    }}>
                      {docLine}
                    </Typography>
                  </Box>
                ))}

                {/* Closing docstring quotes */}
                <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                  <LineNumber>{String((savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0) + 3).padStart(2, '0')}</LineNumber>
                  <Typography sx={{ 
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    color: '#ce9178',
                    ml: 2
                  }}>
                    &quot;&quot;&quot;
                  </Typography>
                </Box>

                {/* Function body */}
                {selectedFunction.code.split('\n').slice(1).map((line, index) => {
                  const docstringLines = savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0;
                  const lineNumber = index + docstringLines + 4; // Account for def line, opening """, docstring, closing """
                  const hasComment = inlineComments.has(lineNumber);
                  // Only allow clicking on lines that were selected in the line selection screen
                  const isClickableLine = selectedLinesForCommenting.has(lineNumber);
                  
                  return (
                    <React.Fragment key={index}>
                      {/* Editable comment line above if comment exists and line was selected */}
                      {hasComment && isClickableLine && (
                        <Box 
                          sx={{ 
                            position: 'relative',
                            display: 'flex', 
                            minHeight: '21px', 
                            alignItems: 'center', 
                            px: 2, 
                            py: 0.25,
                            backgroundColor: '#e879f9',
                            border: '2px solid #c026d3',
                            borderRadius: '4px',
                            mx: 1,
                            my: 0.5
                          }}
                          onMouseEnter={(e) => {
                            console.log('Hovering over comment line:', lineNumber);
                            // Clear any pending hide timeout
                            if (hideTooltipTimeoutRef.current) {
                              clearTimeout(hideTooltipTimeoutRef.current);
                            }
                            setHoveredCommentLine(lineNumber);
                            const rect = e.currentTarget.getBoundingClientRect();
                            const tooltipPos = {
                              x: rect.left + rect.width / 2,
                              y: rect.bottom + 10  // Position below the comment line
                            };
                            console.log('Setting tooltip position:', tooltipPos);
                            setTooltipPosition(tooltipPos);
                          }}
                          onMouseLeave={() => {
                            // Don't hide immediately, give time to move to tooltip
                            hideTooltipTimeoutRef.current = setTimeout(() => {
                              if (!isTooltipHovered) {
                                setHoveredCommentLine(null);
                              }
                            }, 200); // 200ms delay
                          }}
                        >
                          <LineNumber style={{ color: '#831843' }}>
                            {String(lineNumber).padStart(2, '0')}
                          </LineNumber>
                          <input
                            type="text"
                            className="comment-input"
                            value={inlineComments.get(lineNumber) || ''}
                            onChange={(e) => {
                              const newComments = new Map(inlineComments);
                              newComments.set(lineNumber, e.target.value);
                              setInlineComments(newComments);
                            }}
                            placeholder="# New Comment"
                            style={{
                              flex: 1,
                              backgroundColor: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#831843',
                              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginLeft: '8px'
                            }}
                            onFocus={(e) => {
                              e.target.style.backgroundColor = 'rgba(190, 24, 93, 0.1)';
                              setHoveredCommentLine(null);
                            }}
                            onBlur={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                          />
                          <button
                            onClick={() => {
                              const newComments = new Map(inlineComments);
                              newComments.delete(lineNumber);
                              setInlineComments(newComments);
                              const newSelected = new Set(selectedCommentLines);
                              newSelected.delete(lineNumber);
                              setSelectedCommentLines(newSelected);
                              const newCommentLineContent = new Map(commentLineContent);
                              newCommentLineContent.delete(lineNumber);
                              setCommentLineContent(newCommentLineContent);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#831843',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '2px'
                            }}
                          >
                            ×
                          </button>
                        </Box>
                      )}
                      
                      {/* Original code line */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          minHeight: '21px', 
                          alignItems: 'center', 
                          px: 2, 
                          py: 0.25,
                          cursor: isClickableLine ? 'pointer' : 'default',
                          '&:hover': isClickableLine ? {
                            backgroundColor: 'rgba(100, 116, 139, 0.1)'
                          } : {}
                        }}
                        onClick={() => {
                          if (isClickableLine) {
                            // Capture the content of the clicked line
                            setPresentLineContent(line.trim());
                            console.log('Present line content:', line.trim());
                            
                            if (hasComment) {
                              // Remove comment if already exists
                              const newComments = new Map(inlineComments);
                              newComments.delete(lineNumber);
                              setInlineComments(newComments);
                              const newSelected = new Set(selectedCommentLines);
                              newSelected.delete(lineNumber);
                              setSelectedCommentLines(newSelected);
                              const newCommentLineContent = new Map(commentLineContent);
                              newCommentLineContent.delete(lineNumber);
                              setCommentLineContent(newCommentLineContent);
                            } else {
                              // Add new comment
                              const newComments = new Map(inlineComments);
                              newComments.set(lineNumber, '# New Comment');
                              setInlineComments(newComments);
                              const newSelected = new Set(selectedCommentLines);
                              newSelected.add(lineNumber);
                              setSelectedCommentLines(newSelected);
                              const newCommentLineContent = new Map(commentLineContent);
                              newCommentLineContent.set(lineNumber, line.trim());
                              setCommentLineContent(newCommentLineContent);
                            }
                          }
                        }}
                      >
                        <LineNumber>{String(lineNumber).padStart(2, '0')}</LineNumber>
                        <Typography sx={{ 
                          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                          fontSize: '14px',
                          color: '#d4d4d4',
                          whiteSpace: 'pre',
                          flex: 1
                        }}>
                          {line || ''}
                        </Typography>
                      </Box>
                    </React.Fragment>
                  );
                })}
              </CodeContainer>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={onBackToScript}
                sx={{ 
                  bgcolor: '#000000', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1f2937' },
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                BACK TO SCRIPT
              </Button>
              <Button 
                variant="contained" 
                disabled={(() => {
                  // Check if all selected comment lines have actual comments (not just placeholder)
                  for (let lineNumber of selectedCommentLines) {
                    const comment = inlineComments.get(lineNumber);
                    if (!comment || comment === '# New Comment' || comment.trim() === '#' || comment.trim() === '') {
                      return true; // Disable if any selected line doesn't have a proper comment
                    }
                  }
                  return selectedCommentLines.size < 1; // Also disable if no lines selected
                })()}
                onClick={() => {
                  // Check that all selected lines have proper comments
                  let allCommentsComplete = true;
                  for (let lineNumber of selectedCommentLines) {
                    const comment = inlineComments.get(lineNumber);
                    if (!comment || comment === '# New Comment' || comment.trim() === '#' || comment.trim() === '') {
                      allCommentsComplete = false;
                      break;
                    }
                  }
                  
                  if (selectedCommentLines.size >= 1 && allCommentsComplete) {
                    // Save the complete function with comments
                    console.log('Saving function with inline comments:', inlineComments);
                    setShowComparison(true);
                  }
                }}
                sx={{ 
                  bgcolor: (() => {
                    // Check if all selected comment lines have actual comments
                    for (let lineNumber of selectedCommentLines) {
                      const comment = inlineComments.get(lineNumber);
                      if (!comment || comment === '# New Comment' || comment.trim() === '#' || comment.trim() === '') {
                        return '#9ca3af'; // Gray if any selected line doesn't have a proper comment
                      }
                    }
                    return selectedCommentLines.size >= 1 ? '#000000' : '#9ca3af';
                  })(),
                  color: 'white',
                  '&:hover': { 
                    bgcolor: (() => {
                      // Check if all selected comment lines have actual comments
                      for (let lineNumber of selectedCommentLines) {
                        const comment = inlineComments.get(lineNumber);
                        if (!comment || comment === '# New Comment' || comment.trim() === '#' || comment.trim() === '') {
                          return '#9ca3af'; // Gray if any selected line doesn't have a proper comment
                        }
                      }
                      return selectedCommentLines.size >= 1 ? '#1f2937' : '#9ca3af';
                    })()
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  flexGrow: 1,
                  maxWidth: '400px'
                }}
              >
                {(() => {
                  // Check if all selected comment lines have actual comments
                  for (let lineNumber of selectedCommentLines) {
                    const comment = inlineComments.get(lineNumber);
                    if (!comment || comment === '# New Comment' || comment.trim() === '#' || comment.trim() === '') {
                      return 'COMPLETE ALL SELECTED COMMENTS TO PROCEED';
                    }
                  }
                  return selectedCommentLines.size >= 1 
                    ? 'CONTINUE TO NEXT STEP' 
                    : 'MUST CREATE 1+ COMMENTS TO PROCEED';
                })()}
              </Button>
            </Box>
          </>
        )}

        {/* Comparison Screen */}
        {showComparison && (
          <>
            <StyledCard sx={{ mt: 3 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="text.primary" fontWeight={500} textAlign="center">
                  Solution Comparison
                </Typography>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                  Compare your solution with an example solution. Your solution shows the function with 
                  your docstring and inline comments. The example solution shows how an experienced 
                  developer might document the same function.
                </Typography>
              </CardContent>
            </StyledCard>

            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
              <StyledTabs value={comparisonTab} onChange={(event, newValue) => setComparisonTab(newValue)}>
                <Tab label="YOUR SOLUTION" />
                <Tab label="EXAMPLE SOLUTION" />
              </StyledTabs>
              
              <TabPanel value={comparisonTab} index={0}>
                <CodeContainer sx={{ maxHeight: 'none', padding: 0 }}>
                  {/* User's Solution - Function with user's docstring and comments */}
                  {/* Function signature */}
                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2, py: 1 }}>
                    <LineNumber>01</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#d4d4d4'
                    }}>
                      {signature}
                    </Typography>
                  </Box>

                  {/* User's docstring */}
                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>02</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#ce9178',
                      ml: 2
                    }}>
                      &quot;&quot;&quot;
                    </Typography>
                  </Box>

                  {savedDocstrings.length > 0 && savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').map((docLine, docIndex) => (
                    <Box key={`user-doc-${docIndex}`} sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                      <LineNumber>{String(docIndex + 3).padStart(2, '0')}</LineNumber>
                      <Typography sx={{ 
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        fontSize: '14px',
                        color: '#6a9955',
                        fontStyle: 'italic',
                        ml: 2
                      }}>
                        {docLine}
                      </Typography>
                    </Box>
                  ))}

                  <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>{String((savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0) + 3).padStart(2, '0')}</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#ce9178',
                      ml: 2
                    }}>
                      &quot;&quot;&quot;
                    </Typography>
                  </Box>

                  {/* User's function body with inline comments */}
                  {selectedFunction.code.split('\n').slice(1).map((line, index) => {
                    const docstringLines = savedDocstrings.length > 0 ? savedDocstrings[savedDocstrings.length - 1].docstring.split('\n').length : 0;
                    const lineNumber = index + docstringLines + 4;
                    const hasComment = inlineComments.has(lineNumber);
                    
                    return (
                      <React.Fragment key={`user-${index}`}>
                        {/* User's inline comment */}
                        {hasComment && (
                          <Box sx={{ 
                            display: 'flex', 
                            minHeight: '21px', 
                            alignItems: 'center', 
                            px: 2, 
                            py: 0.25,
                            backgroundColor: '#e879f9',
                            border: '2px solid #c026d3',
                            borderRadius: '4px',
                            mx: 1,
                            my: 0.5
                          }}>
                            <LineNumber style={{ color: '#831843' }}>
                              {String(lineNumber).padStart(2, '0')}
                            </LineNumber>
                            <Typography sx={{ 
                              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                              fontSize: '14px',
                              color: '#831843',
                              fontWeight: 'bold',
                              ml: 1
                            }}>
                              {inlineComments.get(lineNumber)}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Function code line */}
                        <Box sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2, py: 0.25 }}>
                          <LineNumber>{String(lineNumber).padStart(2, '0')}</LineNumber>
                          <Typography sx={{ 
                            fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                            fontSize: '14px',
                            color: '#d4d4d4',
                            whiteSpace: 'pre'
                          }}>
                            {line}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </CodeContainer>
              </TabPanel>

              <TabPanel value={comparisonTab} index={1}>
                <CodeContainer sx={{ maxHeight: 'none', padding: 0 }}>
                  {/* Example Solution - Well-documented version of the selected function */}
                  {(() => {
                    // Create example solution based on the selected function
                    const getExampleSolution = (functionName, originalCode) => {
                      // Remove module docstring and imports from example solutions
                      
                      if (functionName === 'load_file') {
                        return `def load_file(path):
    """
    Load microscopy data from various file formats and return preprocessing parameters.
    
    This function supports loading from .nd2, .tiff/.tif, and .nwb file formats.
    It automatically detects the file format based on the file extension and
    loads the appropriate preprocessing parameters for that format.
    
    Parameters:
    -----------
    path : str
        File path to the microscopy data file
        
    Returns:
    --------
    tuple
        microscopy_data : ndarray
            The loaded microscopy image data
        image_parameters : dict
            Dictionary containing preprocessing parameters including:
            - is_normalized : bool
            - is_mip : bool  
            - is_cropped : bool
            - downsampling_factor : tuple
            - smooth_factor : float
            
    Raises:
    -------
    ValueError
        If the file format is not supported
        
    Example:
    --------
    >>> data, params = load_file("data/sample.nd2")
    >>> print(params['is_normalized'])
    False
    """
    # Check file extension to determine format
    if path.endswith('.nd2'):
        # Load ND2 format microscopy data
        microscopy_data = loading.load_nd2(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='nd2')

    elif path.endswith('.tiff') or path.endswith('.tif'):
        # Load TIFF format microscopy data  
        microscopy_data = loading.load_tif(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='tiff')

    elif path.endswith('.nwb'):
        # Load NWB format microscopy data
        microscopy_data = loading.load_nwb(path)
        is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma = loading.load_parameters(file_format='nwb')

    else:
        # Unsupported file format - raise error
        raise ValueError(f"Unsupported file format: {path}")

    # Create parameters dictionary with all preprocessing settings
    image_parameters = {
        'is_normalized': is_normalized,
        'is_mip': is_mip,
        'is_cropped': is_cropped,
        'downsampling_factor': zoom_level,
        'smooth_factor': gaussian_sigma
    }

    # Return both data and parameters
    return microscopy_data, image_parameters`;
                      } else if (functionName === 'load_tif') {
                        return `def load_tif(file_path):
    """Return image/stack data from a TIFF/OME-TIFF file generated by the fiji image processing data.

    Parameters
    ----------
    file_path : str
        Path to a .tif or .tiff file.

    Returns
    -------
    numpy.ndarray
        Image array as loaded by \`\`tifffile.imread\`\` (dtype preserved).
    """

    microscopy_volume = imread(file_path)
    return microscopy_volume`;
                      } else if (functionName === 'load_nd2') {
                        return `def load_nd2(file_path):
    """Return image/stack data from a Nikon ND2 file.

    Notes
    -----
    \`\`ND2Reader\`\` yields data typically in (z, x, y) or (channel, x, y, z)
    orders depending on acquisition. This code assumes the incoming
    sequence yields 2D frames and transposes to (x, y, z).

    Parameters
    ----------
    file_path : str
        Path to a .nd2 file.

    Returns
    -------
    numpy.ndarray
        Transposed image stack with frames along the last axis.
    """

    # Extract raw file data
    raw_data = ND2Reader(file_path)

    # Arrange image dimensions as (x, y, z)
    microscopy_volume = np.transpose(raw_data, (1, 2, 0))

    return microscopy_volume`;
                      } else if (functionName === 'load_nwb') {
                        return `def load_nwb(file_path):
    """Return image/stack data from an NWB file.

    Assumptions
    -----------
    * The acquisition contains a key 'NeuroPALImageRaw'.
    * Data layout is (z, x, y, channels) or similar; we transpose to (x, y, z, channels)
      only as needed to match downstream expectations (here: (x, y, z, channels) after
      transposition and channel selection).
    * RGBW_channels stores indices where the first three are RGB.

    Steps
    -----
    1. Open file read-only.
    2. Read full dataset into memory (adjust if too large for real use).
    3. Transpose to put spatial axes first for consistency.
    4. Select only the RGB channels.
    5. Convert to 8-bit range 0–255 (without changing dtype explicitly here).
    6. Close file handle.

    Parameters
    ----------
    file_path : str
        Path to a .nwb file.

    Returns
    -------
    numpy.ndarray
        Image data scaled to 0–255 float range.
    """

    # Create a reader object.
    io_obj = NWBHDF5IO(file_path, mode="r")

    # Open the file reader.
    nwb_file = io_obj.read()

    # Extract the raw image data & the indices of the channels corresponding to the red, green, and blue colors.
    image_data = nwb_file.acquisition['NeuroPALImageRaw'].data[:]
    rgb_channel_indices = nwb_file.acquisition['NeuroPALImageRaw'].RGBW_channels[:3]

    # Close the file reader since we now have all the data we need.
    io_obj.close()

    # Transpose the image to ensure that it is in (x, y, z, c) order.
    rotated_image = np.transpose(image_data, (1, 0, 2, 3))

    # Isolate the image to just RGB colors.
    microscopy_volume = rotated_image[:, :, :, rgb_channel_indices]

    # Map image onto 8-bit range (0-255)
    image_dtype = microscopy_volume.dtype
    maximum_integer_value = np.iinfo(image_dtype).max
    microscopy_volume = (microscopy_volume/maximum_integer_value) * 255

    return microscopy_volume`;
                      } else if (functionName === 'load_parameters') {
                        return `def load_parameters(file_format):
    """Return preprocessing parameter flags for a given file format.

    The values indicate which preprocessing steps are already satisfied
    (normalization, projection, cropping) and numeric factors for
    downsampling and smoothing.

    Parameters
    ----------
    file_format : str
        One of 'nd2', 'tif', 'tiff', 'nwb'.

    Returns
    -------
    is_normalized : bool
        True if this format features pre-normalized images, false otherwise.
    is_mip: bool
        True if this format features maximum intensity projections, false otherwise.
    is_cropped: bool
        True if this format features pre-cropped images, false otherwise.
    zoom_level: tuple
        A tuple whose every element describes factor by which its corresponding dimension should be downsampled. For
        example, to downsample the first dimensions of a given format's image by half and the second by a third, you
        would set zoom_level to (0.5, 0.3).
    gaussian_sigma: tuple
        The standard deviation passed to the gaussian filter that will be applied to images loaded in this format. The
        higher the value, the more the image will be blurred.
    """

    match file_format:
        case 'nd2':
            is_normalized = False
            is_mip = False
            is_cropped = False
            zoom_level = (1, 1)
            gaussian_sigma = 0

        case 'tif' | 'tiff':
            is_normalized = False
            is_mip = True
            is_cropped = False
            zoom_level = (0.35, 0.35, 1)
            gaussian_sigma = 0.3

        case 'nwb':
            is_normalized = False
            is_mip = False
            is_cropped = True
            zoom_level = (1, 0.75, 1)
            gaussian_sigma = 0

        case _:
            raise ValueError("Unknown file format!")

    return is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma`;
                      } else if (functionName === 'generate_comparison_plot') {
                        return `def generate_comparison_plot(generated_images, output_path):
    """Save a horizontal figure showing each intermediate processing step.

    Parameters
    ----------
    generated_images : dict[str, np.ndarray]
        An *ordered* mapping from step label to image.  The labels become
        subplot titles in the order the items appear in the dict.
    output_path : str
        File path where the PNG figure will be written.
    """
    num_images = len(generated_images)

    # One row, N columns – scale width linearly with number of images.
    fig, axes = plt.subplots(1, num_images, figsize=(4 * num_images, 3))

    # Initialize index of axes whose image is being plotted.
    current_axes = 0

    # Iterate through the (label, image) pairs and plot each one.
    for label, image in generated_images.items():
        axes[current_axes].imshow(image)
        axes[current_axes].set_title(label)
        current_axes += 1

    plt.savefig(output_path)`;
                      } else if (functionName === 'plot_single_file') {
                        return `def plot_single_file(image):
    """Display a single image (no file is saved).

    Parameters
    ----------
    image : np.ndarray
        Image to display.
    """

    plt.imshow(image)`;
                      } else if (functionName === 'plot_multiple_files') {
                        return `def plot_multiple_files(filenames, images, output_path=None):
    """Show (and optionally save) a row of final images, one per file.

    Parameters
    ----------
    filenames : list[str]
        Names used for subplot titles.
    images : list[np.ndarray]
        Images to display, same order/length as \`\`filenames\`\`.
    output_path : str | None
        If provided, the figure is saved to this path; otherwise only shown.
    """

    num_images = len(images)
    fig, axes = plt.subplots(1, num_images, figsize=(4 * num_images, 3))

    for i in range(num_images):
        filename = filenames[i]
        image = images[i]

        axes[i].imshow(image)
        axes[i].set_title(filename)

    if output_path is not None:
        plt.savefig(output_path)

    plt.show()`;
                      } else if (functionName === 'maximally_project_image') {
                        return `def maximally_project_image(image):
    """Return a maximum intensity projection of a given image.
    
    A maximum intensity projection (MIP) is a visualization method that projects
    the maximum value from a 3D or 4D image volume onto a 2D plane along a 
    specified axis. This is particularly useful for microscopy data where you
    want to visualize the brightest features across depth.
    
    The function intelligently determines which axis to project along based on
    the image dimensions. For images without a color channel (3D), it chooses
    the smallest dimension. For images with a color channel (4D), it chooses
    the second smallest dimension to preserve color information.
    
    Parameters:
    -----------
    image : numpy.ndarray
        Input image data. Can be 3D (height, width, depth) or 4D 
        (height, width, depth, channels). The function will automatically
        determine the appropriate axis for projection.
        
    Returns:
    --------
    numpy.ndarray
        2D or 3D maximum intensity projection of the input image.
        For 3D input: returns 2D projection
        For 4D input: returns 3D projection (preserving color channels)
        
    Example:
    --------
    >>> import numpy as np
    >>> # Create a sample 3D image
    >>> image_3d = np.random.rand(100, 100, 20)
    >>> mip = maximally_project_image(image_3d)
    >>> print(mip.shape)  # Should be (100, 100) or similar
    
    >>> # Create a sample 4D image with color channels
    >>> image_4d = np.random.rand(100, 100, 20, 3)
    >>> mip_color = maximally_project_image(image_4d)
    >>> print(mip_color.shape)  # Should be (100, 100, 3) or similar
    """
    # Convert shape tuple to a numpy array so we can use numeric operations.
    dimensions = np.array(image.shape)
    
    if len(dimensions) < 4:
        # For data without a color channel dimension, take the smallest dimension.
        z_index = np.argmin(dimensions)
    else:
        # For data with a color channel dimension, choose the second smallest dimension.
        z_index = np.argpartition(dimensions, 1)[1]
    
    # Collapse the chosen axis by taking the maximum value.
    maximum_intensity_projection = np.max(image, axis=z_index)
    
    return maximum_intensity_projection`;
                      } else if (functionName === 'normalize_image') {
                        return `def normalize_image(image):
    """Scale *image* so its pixel values lie between 0 and 1.

    This uses simple min‑max normalisation: subtract the global minimum
    and divide by the full range.  Floating‑point output is returned.

    Parameters
    ----------
    image : np.ndarray
        Input image of any dimensionality.

    Returns
    -------
    np.ndarray
        Normalised image with the same shape as the input.
    """

    lowest_pixel_value = np.min(image)
    highest_pixel_value = np.max(image)
    pixel_value_range = highest_pixel_value - lowest_pixel_value

    # Shift so the minimum becomes zero, then scale by the range.
    bottom_capped_image = image - lowest_pixel_value
    normalized_image = bottom_capped_image / pixel_value_range

    return normalized_image`;
                      } else if (functionName === 'crop_background_border') {
                        return `def crop_background_border(image, background_percentile):
    """Crop away uniform background borders.

    Any pixel value at or below the given background_percentile is
    considered background.  The function finds the smallest rectangle
    (row and column bounds) that contains at least one foreground pixel
    and returns the cropped image.

    Parameters
    ----------
    image : np.ndarray
        2‑D image (height × width) or higher‑dimensional data where the
        background is uniform across the first two axes.
    background_percentile : int or float
        Percentile used to define the background threshold, e.g. 98.

    Returns
    -------
    np.ndarray
        Cropped image.
    """

    # Estimate background threshold.
    bg = np.percentile(image, background_percentile)
    non_bg = image > bg  # Boolean mask of foreground pixels.

    # Coordinates where foreground is present along each axis.
    row_indices = np.where(non_bg.any(axis=1))[0]
    col_indices = np.where(non_bg.any(axis=0))[0]

    # Slice to the first / last foreground rows and columns.
    row_slice = slice(row_indices[0], row_indices[-1] + 1)
    col_slice = slice(col_indices[0], col_indices[-1] + 1)

    # Index the image around the target region.
    image = image[row_slice, col_slice]

    return image`;
                      } else if (functionName === 'downsample_image') {
                        return `def downsample_image(image, factor):
    """Resize a given image by  a given factor using cubic spline interpolation.

    Parameters
    ----------
    image : np.ndarray
        Image array of arbitrary dimensionality.
    factor : float or sequence of floats
        Zoom factor(s) passed directly to \`\`scipy.ndimage.zoom\`\`.  Values
        greater than 1 enlarge the image, values less than 1 shrink it.

    Returns
    -------
    np.ndarray
        Resampled image.
    """

    image = zoom(image, factor)

    return image`;
                      } else if (functionName === 'smooth_image') {
                        return `def smooth_image(image, factor):
    """Blur a given image with a Gaussian kernel.

    Parameters
    ----------
    image : np.ndarray
        Input image.
    factor : float or sequence of floats
        Standard deviation(s) of the Gaussian kernel, in pixels.

    Returns
    -------
    np.ndarray
        Smoothed image.
    """

    image = gaussian_filter(image, sigma=factor)

    return image`;
                      } else {
                        // For any other function, create a well-documented version of the original code
                        const lines = originalCode.split('\n');
                        const functionLine = lines[0];
                        const bodyLines = lines.slice(1);
                        
                        // Extract function name for documentation
                        const funcName = functionLine.match(/def\s+(\w+)/)?.[1] || 'function';
                        
                        // Create comprehensive docstring
                        const docstring = `    """
    ${funcName.charAt(0).toUpperCase() + funcName.slice(1).replace(/_/g, ' ')} function with comprehensive documentation.
    
    This function performs the operations defined in the original implementation
    with added documentation and inline comments for better code understanding.
    
    Parameters:
    -----------
    (parameters based on function signature)
        
    Returns:
    --------
    (return value description)
        
    Example:
    --------
    >>> result = ${funcName}()
    >>> print(result)
    """`;
                        
                        // Add inline comments to body lines
                        const documentedBodyLines = bodyLines.map(line => {
                          if (line.trim() === '') return line;
                          if (line.trim().startsWith('#')) return line;
                          
                          // Add helpful inline comments based on code patterns
                          if (line.includes('if ') && line.includes(':')) {
                            return line + '  # Conditional logic check';
                          } else if (line.includes('for ') && line.includes(':')) {
                            return line + '  # Iterate through collection';
                          } else if (line.includes('return ')) {
                            return line + '  # Return result to caller';
                          } else if (line.includes('=') && !line.includes('==')) {
                            return line + '  # Variable assignment';
                          } else if (line.includes('(') && line.includes(')')) {
                            return line + '  # Function call';
                          } else {
                            return line + '  # Process operation';
                          }
                        });
                        
                        return functionLine + '\n' + docstring + '\n' + documentedBodyLines.join('\n');
                      }
                    };
                    
                    return <ExampleSolutionViewer code={getExampleSolution(selectedFunction.name, selectedFunction.code)} />;
                  })()}
                </CodeContainer>
              </TabPanel>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={onBackToScript}
                sx={{ 
                  bgcolor: '#000000', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1f2937' },
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                BACK TO SCRIPT
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // Reset all states to go back to the first screen
                  setShowValidation(false);
                  setShowInlineComments(false);
                  setShowComparison(false);
                  setDocstring('');
                  setInlineComments(new Map());
                  setSelectedCommentLines(new Set());
                  setCurrentTemplate(0);
                  setIsEditing(true);
                  setHasClickedContinue(false);
                  setHasEditedDocstring(false);
                  setComparisonTab(0);
                  setPresentLineContent('');
                  setValidationAnswers({
                    describes: '',
                    inputs: '',
                    outputs: '',
                    example: ''
                  });
                  // Call the parent function to go back to script
                  onBackToScript();
                }}
                sx={{ 
                  bgcolor: '#000000',
                  color: 'white',
                  '&:hover': { bgcolor: '#1f2937' },
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  flexGrow: 1,
                  maxWidth: '400px'
                }}
              >
                FINISH ACTIVITY
              </Button>
            </Box>
          </>
        )}

        {/* Help Modal */}
        {showHelp && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <Paper sx={{ 
              p: 4, 
              maxWidth: 800, 
              maxHeight: '90vh',
              mx: 2,
              borderRadius: 2,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Need Help? Functionality
                </Typography>
                <IconButton onClick={() => setShowHelp(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ 
                backgroundColor: '#fff3cd', 
                color: '#856404',
                p: 2, 
                borderRadius: 1, 
                mb: 3,
                border: '1px solid #ffeaa7'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Here are some common docstring templates.
                </Typography>
              </Box>

              <CodeContainer sx={{ 
                flex: 1, 
                maxHeight: 'none', 
                overflow: 'auto',
                mb: 3,
                backgroundColor: '#2d3748'
              }}>
                {templates[currentTemplate].content.split('\n').map((line, index) => (
                  <Box key={index} sx={{ display: 'flex', minHeight: '21px', alignItems: 'center', px: 2 }}>
                    <LineNumber>{String(index + 1).padStart(2, '0')}</LineNumber>
                    <Typography sx={{ 
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      fontSize: '14px',
                      color: '#e2e8f0',
                      whiteSpace: 'pre'
                    }}>
                      {line || ''}
                    </Typography>
                  </Box>
                ))}
              </CodeContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button 
                  variant="outlined"
                  onClick={() => setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length)}
                  sx={{ 
                    borderColor: '#000000',
                    color: '#000000',
                    '&:hover': { 
                      borderColor: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  PREVIOUS TEMPLATE
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleInsertTemplate}
                  sx={{ 
                    bgcolor: '#000000',
                    '&:hover': { bgcolor: '#1f2937' }
                  }}
                >
                  INSERT TEMPLATE INTO DOCSTRING
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => setCurrentTemplate((prev) => (prev + 1) % templates.length)}
                  sx={{ 
                    borderColor: '#000000',
                    color: '#000000',
                    '&:hover': { 
                      borderColor: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  NEXT TEMPLATE
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        
    {/* Interactive comment selection tooltip */}
      {/* Interactive comment selection tooltip */}
        {hoveredCommentLine && (
          console.log('Rendering tooltip for line:', hoveredCommentLine, 'at position:', tooltipPosition),
          <Box
            data-tooltip-menu
            onMouseEnter={() => {
              // Clear any pending hide timeout
              if (hideTooltipTimeoutRef.current) {
                clearTimeout(hideTooltipTimeoutRef.current);
              }
              setIsTooltipHovered(true);
            }}
            onMouseLeave={() => {
              setIsTooltipHovered(false);
              // Hide tooltip after a longer delay
              hideTooltipTimeoutRef.current = setTimeout(() => {
                setHoveredCommentLine(null);
              }, 300);
            }}
            sx={{
              position: 'fixed',
              left: Math.max(10, Math.min(tooltipPosition.x, window.innerWidth - 340)),
              top: Math.max(10, tooltipPosition.y),
              transform: 'translateX(-50%)',
              backgroundColor: '#e879f9',
              color: 'white',
              padding: '12px 0px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'normal',
              lineHeight: 1.4,
              width: '320px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              border: '3px solid #c026d3',
              zIndex: 10000,
              pointerEvents: 'auto',
              marginTop: '8px',
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid #c026d3'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '5px solid #e879f9',
                marginTop: '1px'
              }
            }}
          >
{(() => {
              // Check if selectedFile matches a state variable and presentLineContent matches a key
              // Get the line content for the hovered comment line
              const hoveredLineContent = commentLineContent.get(hoveredCommentLine) || presentLineContent;
              
              const useLoadingOptions = selectedFile === 'loading' && loading[hoveredLineContent];
              const usePlottingOptions = selectedFile === 'plotting' && plotting[hoveredLineContent];
              const usePreprocessingOptions = selectedFile === 'preprocessing' && preprocessing[hoveredLineContent];
              const useMainOptions = selectedFile === 'main' && main[hoveredLineContent];
              
              let commentOptions;
              if (useLoadingOptions) {
                commentOptions = loading[hoveredLineContent];
              } else if (usePlottingOptions) {
                commentOptions = plotting[hoveredLineContent];
              } else if (usePreprocessingOptions) {
                commentOptions = preprocessing[hoveredLineContent];
              } else if (useMainOptions) {
                commentOptions = main[hoveredLineContent];
              } else {
                commentOptions = ['# Initialize preprocessing_parameters dictionary.', '# Define variable.'];
              }
              
              return commentOptions.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'scale(1.05)'
                    },
                    borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                  onClick={() => {
                    // Clear timeout and close tooltip
                    if (hideTooltipTimeoutRef.current) {
                      clearTimeout(hideTooltipTimeoutRef.current);
                    }
                    const newComments = new Map(inlineComments);
                    newComments.set(hoveredCommentLine, option);
                    setInlineComments(newComments);
                    const newSelected = new Set(selectedCommentLines);
                    newSelected.add(hoveredCommentLine);
                    setSelectedCommentLines(newSelected);
                    setHoveredCommentLine(null);
                    setIsTooltipHovered(false);
                  }}
                >
                  {option}
                </Box>
              ));
            })()}
            <Box
              sx={{
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => {
                // Clear timeout and close tooltip
                if (hideTooltipTimeoutRef.current) {
                  clearTimeout(hideTooltipTimeoutRef.current);
                }
                const newComments = new Map(inlineComments);
                newComments.set(hoveredCommentLine, '# ');
                setInlineComments(newComments);
                const newSelected = new Set(selectedCommentLines);
                newSelected.add(hoveredCommentLine);
                setSelectedCommentLines(newSelected);
                setHoveredCommentLine(null);
                setIsTooltipHovered(false);
                // Focus the input after a brief delay
                setTimeout(() => {
                  const input = document.querySelector(`input[value="# "]`);
                  if (input) {
                    input.focus();
                    input.setSelectionRange(2, 2); // Position cursor after "# "
                  }
                }, 50);
              }}
            >
              EDIT UR OWN COMMENT
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

export default function ActivityDashboard() {
  const [activityStarted, setActivityStarted] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [documentationMode, setDocumentationMode] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [openFiles, setOpenFiles] = useState([
    { id: 'directory', name: 'PROJECT DIRECTORY', type: 'directory' }
  ]);
  const [fileModal, setFileModal] = useState({ open: false, file: null });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCloseFile = (event, fileId) => {
    event.stopPropagation();
    
    if (fileId === 'directory') return;
    
    const fileIndex = openFiles.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return;
    
    const newOpenFiles = openFiles.filter(file => file.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (currentTab >= fileIndex) {
      if (currentTab === fileIndex) {
        const newCurrentTab = Math.max(0, currentTab - 1);
        setCurrentTab(newCurrentTab);
      } else {
        setCurrentTab(currentTab - 1);
      }
    }
  };

  const handleFileClick = (fileName, fileType) => {
    // Set selected file name without .py extension
    const fileNameWithoutExtension = fileName.replace(/\.py$/, '');
    setSelectedFile(fileNameWithoutExtension);
    
    // Create file object and open in modal
    const file = {
      id: fileName,
      name: fileName.toUpperCase(),
      type: fileType,
      content: getFileContent(fileName, fileType)
    };
    
    setFileModal({ open: true, file });
  };

  const handleCloseFileModal = () => {
    setFileModal({ open: false, file: null });
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && fileModal.open) {
        handleCloseFileModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fileModal.open]);

  const handleFunctionSelect = (functionData) => {
    setSelectedFunction(functionData);
    setDocumentationMode(true);
  };

  const handleBackToScript = () => {
    setDocumentationMode(false);
    setSelectedFunction(null);
  };

  const getFileContent = (fileName, fileType) => {
    const fileContents = {
      'main.py': pythonCode,
      
      'loading.py': `def load_tif(file_path):
    microscopy_volume = imread(file_path)
    return microscopy_volume


def load_nd2(file_path):
    raw_data = ND2Reader(file_path)
    microscopy_volume = np.transpose(raw_data, (1, 2, 0))
    return microscopy_volume


def load_nwb(file_path):
    io_obj = NWBHDF5IO(file_path, mode="r")
    nwb_file = io_obj.read()
    
    image_data = nwb_file.acquisition['NeuroPALImageRaw'].data[:]
    rotated_image = np.transpose(image_data, (1, 0, 2, 3))
    
    rgb_channel_indices = nwb_file.acquisition['NeuroPALImageRaw'].RGBW_channels[:3]
    microscopy_volume = rotated_image[:, :, :, rgb_channel_indices]
    
    image_dtype = microscopy_volume.dtype
    maximum_integer_value = np.iinfo(image_dtype).max
    microscopy_volume = (microscopy_volume/maximum_integer_value) * 255
    
    io_obj.close()
    return microscopy_volume


def load_parameters(file_format):
    match file_format:
        case 'nd2':
            is_normalized = False
            is_mip = False
            is_cropped = False
            zoom_level = (1, 1)
            gaussian_sigma = 0
            
        case 'tif' | 'tiff':
            is_normalized = False
            is_mip = True
            is_cropped = False
            zoom_level = (0.35, 0.35, 1)
            gaussian_sigma = 0.3
            
        case 'nwb':
            is_normalized = False
            is_mip = False
            is_cropped = True
            zoom_level = (1, 0.75, 1)
            gaussian_sigma = 0
            
        case _:
            raise ValueError("Unknown file format!")
            
    return is_normalized, is_mip, is_cropped, zoom_level, gaussian_sigma`,
      
      'plotting.py': `def generate_comparison_plot(generated_images, output_path):
    num_images = len(generated_images)
    fig, axes = plt.subplots(1, num_images, figsize=(4 * num_images, 3))

    current_axes = 0
    for label, image in generated_images.items():
        axes[current_axes].imshow(image)
        axes[current_axes].set_title(label)
        current_axes += 1

    plt.savefig(output_path)


def plot_single_file(image):
 
    plt.imshow(image)


def plot_multiple_files(filenames, images, output_path=None):

    num_images = len(images)
    fig, axes = plt.subplots(1, num_images, figsize=(4 * num_images, 3))

    for i in range(num_images):
        filename = filenames[i]
        image = images[i]

        axes[i].imshow(image)
        axes[i].set_title(filename)

    if output_path is not None:
        plt.savefig(output_path)

    plt.show()`,
        
      'preprocessing.py': `def maximally_project_image(image):
    dimensions = np.array(image.shape)
    if len(dimensions) < 4:
        z_index = np.argmin(dimensions)
    else:
        z_index = np.argpartition(dimensions, 1)[1]
    maximum_intensity_projection = np.max(image, axis=z_index)
    return maximum_intensity_projection

def normalize_image(image):
    lowest_pixel_value = np.min(image)
    highest_pixel_value = np.max(image)
    pixel_value_range = highest_pixel_value - lowest_pixel_value
    bottom_capped_image = image - lowest_pixel_value
    normalized_image = bottom_capped_image / pixel_value_range
    return normalized_image

def crop_background_border(image, background_percentile):
    bg = np.percentile(image, background_percentile)
    non_bg = image > bg
    row_indices = np.where(non_bg.any(axis=1))[0]
    col_indices = np.where(non_bg.any(axis=0))[0]
    row_slice = slice(row_indices[0], row_indices[-1] + 1)
    col_slice = slice(col_indices[0], col_indices[-1] + 1)
    return image[row_slice, col_slice]

def downsample_image(image, factor):
    image = zoom(image, factor)
    return image

def smooth_image(image, factor):
    image = gaussian_filter(image, sigma=factor)
    return image`,
        
      'citations.txt': `References for Microscopy Analysis Project

1. Smith, J. et al. (2023). "Advanced preprocessing techniques for fluorescence microscopy."
   Journal of Microscopy Methods, 45(2), 123-145.

2. Johnson, K. & Lee, M. (2022). "Automated image normalization in biological imaging."
   Nature Methods, 19(8), 891-902.

3. Brown, A. et al. (2021). "Comparative analysis of downsampling algorithms for microscopy data."
   Scientific Reports, 11, 15234.

4. Wilson, R. (2023). "Best practices for microscopy data management and storage."
   Bioimaging Protocols, 12(3), 67-89.

Software and Tools:
- ImageJ/FIJI (Schindelin et al., 2012)
- scikit-image (van der Walt et al., 2014)
- OpenCV (Bradski, 2000)
- NumPy (Harris et al., 2020)

Data Sources:
- Sample datasets from Allen Institute for Cell Science
- Test images from European Molecular Biology Laboratory (EMBL)`
    };

    return fileContents[fileName] || `Content for ${fileName}\n\nThis is a ${fileType} file.\n\n// File content would be displayed here\n// depending on the file type and format.`;
  };

  if (documentationMode && selectedFunction) {
    return <DocumentationScreen selectedFunction={selectedFunction} selectedFile={selectedFile} onBackToScript={handleBackToScript} />;
  }

  if (!activityStarted) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', py: 3 }}>
        <Container maxWidth="md">
        

          <StyledCard>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
                Though the project below is sufficiently organized for prospective users to know 
                where they should expect to find different files, the script themselves still expect 
                users to possess a lot of knowledge and understanding that they may lack. This 
                can even be true if that user is a future version of you that hasn&apos;t looked at this 
                code in many months!
              </Typography>
              <Typography variant="body2" color="text.primary">
                To take a closer look, click on main.py below.
              </Typography>
            </CardContent>
          </StyledCard>

          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <DirectoryHeader>
              PROJECT DIRECTORY
            </DirectoryHeader>
            <DirectoryContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #4b5563' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#d1d5db', flex: 1 }}>
                  Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#d1d5db', minWidth: '100px' }}>
                  File Type
                </Typography>
              </Box>

              <FolderItem name="src" fileCount="3">
                <FileItem name="loading.py" fileType="python" />
                <FileItem name="plotting.py" fileType="python" />
                <FileItem name="preprocessing.py" fileType="python" />
              </FolderItem>

              <FolderItem name="data" fileCount="4">
                <FileItem name="20191010_tail_01.nd2" fileType="data" />
                <FileItem name="sub-11-YAaLR_oophys.nwb" fileType="data" />
                <FileItem name="20240523_Vang-1_37.tif" fileType="image" />
                <FileItem name="citations.txt" fileType="text" />
              </FolderItem>

              <FolderItem name="results" fileCount="4">
                <FileItem name="20240523_Vang-1_37_comparison.png" fileType="image" />
                <FileItem name="20191010_tail_01_comparison.png" fileType="image" />
                <FileItem name="sub-11-YAaLR_oophys_comparison.png" fileType="image" />
                <FileItem name="overview.png" fileType="image" />
              </FolderItem>

              <FileItem name="main.py" fileType="python" isMain level={0} />
            </DirectoryContent>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={() => setActivityStarted(true)}
              sx={{ 
                bgcolor: '#000000', 
                color: 'white',
                '&:hover': { bgcolor: '#1f2937' },
                px: 3,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              START ACTIVITY
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', py: 3 }}>
      <Container maxWidth="md">
      

        <StyledCard>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
              This script currently requires users to read and understand every single line of 
              code in order to get a sense for what is happening. We can improve on this step-by-step. 
              First, let&apos;s take a look at the functions, click one to work on it.
            </Typography>
          </CardContent>
        </StyledCard>

        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2, backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }}>
            <Typography variant="h6" sx={{ color: '#d1d5db', fontWeight: 600 }}>
              PROJECT DIRECTORY
            </Typography>
          </Box>
          <DirectoryView onFileClick={handleFileClick} />
        </Paper>

        {/* File Modal */}
        {fileModal.open && fileModal.file && (
          <Box 
            onClick={handleCloseFileModal}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
            <Paper 
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                width: '90%', 
                height: '90%', 
                maxWidth: '1200px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1a1a1a'
              }}>
              {/* Modal Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid #333' 
              }}>
                <Typography variant="h6" sx={{ color: '#d1d5db', fontWeight: 600 }}>
                  {fileModal.file.name}
                </Typography>
                <IconButton
                  onClick={handleCloseFileModal}
                  sx={{ color: '#d1d5db' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Modal Content */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <FileContentView file={fileModal.file} onFunctionSelect={handleFunctionSelect} />
              </Box>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {/* <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#000000', 
              color: 'white',
              '&:hover': { bgcolor: '#1f2937' },
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            NEED HELP?
          </Button> */}
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#000000', 
              color: 'white',
              '&:hover': { bgcolor: '#1f2937' },
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            FINISH ACTIVITY
          </Button>
        </Box>
      </Container>
    </Box>
  );
}