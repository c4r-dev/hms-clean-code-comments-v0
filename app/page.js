'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  border: isMain ? '2px solid #eab308' : 'none',
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
  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
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
    {isMain && (
      <Box sx={{ 
        backgroundColor: '#eab308', 
        color: '#000', 
        px: 1, 
        py: 0.25, 
        borderRadius: 1, 
        fontSize: '0.75rem',
        fontWeight: 'bold',
        mr: 1
      }}>
        MAIN (FIXED)
      </Box>
    )}
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
      <FileItem name="plotting.py" fileType="python" isHighlighted onFileClick={onFileClick} />
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
              setHighlightedCode(result.value);
            }
          };
          document.head.appendChild(pythonScript);
        };
        document.head.appendChild(script);
      } else if (window.hljs) {
        const result = window.hljs.highlight(code, { language: 'python' });
        setHighlightedCode(result.value);
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
          {codeLines.map((line, index) => (
            <div key={index} style={{ display: 'flex', minHeight: '21px' }}>
              <LineNumber>{String(index + 1).padStart(2, '0')}</LineNumber>
              <div 
                style={{ 
                  flex: 1, 
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  fontSize: '14px',
                  lineHeight: 1.5,
                  userSelect: 'text'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: highlightedCode ? line : line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                }}
              />
            </div>
          ))}
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
              You've selected a complete function! Would you like to work on adding documentation to this function?
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

const DocumentationScreen = ({ selectedFunction, onBackToScript }) => {
  const [docstring, setDocstring] = useState('');
  const [isEditing, setIsEditing] = useState(true);

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
  };

  const handleDocstringBlur = () => {
    setIsEditing(false);
  };

  const handleDocstringFocus = () => {
    setIsEditing(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', py: 3 }}>
      <Container maxWidth="md">
        <StyledCard>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="text.primary" fontWeight={500} textAlign="center">
              {'{Activity Title}'}
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
              To begin, let's add a multi-line comment at the start of the function describing its 
              what it does, what its inputs are, and what outputs the user should expect. This 
              kind of comment is called a docstring, and makes it much easier to understand a 
              function at a glance.
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
                """
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
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px 12px',
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: '#d4d4d4',
                    backgroundColor: isEditing ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.1)',
                    border: isEditing ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
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
                """
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

        {/* Docstring guidelines */}
        {isEditing && (
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
            disabled={!docstring.trim()}
            sx={{ 
              bgcolor: docstring.trim() ? '#000000' : '#9ca3af',
              color: 'white',
              '&:hover': { 
                bgcolor: docstring.trim() ? '#1f2937' : '#9ca3af' 
              },
              px: 4,
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              flexGrow: 1,
              maxWidth: '400px'
            }}
          >
            {docstring.trim() ? 'CONTINUE TO NEXT STEP' : 'MUST ANSWER ALL QUESTIONS TO PROCEED'}
          </Button>
        </Box>
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
  const [openFiles, setOpenFiles] = useState([
    { id: 'directory', name: 'PROJECT DIRECTORY', type: 'directory' },
    { id: 'main.py', name: 'MAIN.PY', type: 'python', content: pythonCode }
  ]);

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
    const existingIndex = openFiles.findIndex(file => file.id === fileName);
    
    if (existingIndex !== -1) {
      setCurrentTab(existingIndex);
    } else {
      const newFile = {
        id: fileName,
        name: fileName.toUpperCase(),
        type: fileType,
        content: getFileContent(fileName, fileType)
      };
      
      setOpenFiles(prev => [...prev, newFile]);
      setCurrentTab(openFiles.length);
    }
  };

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
      
      'loading.py': `from nd2reader import ND2Reader
from tifffile import imread
from pynwb import NWBHDF5IO
import numpy as np


def load_tif(file_path):
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
      
      'plotting.py': `import matplotlib.pyplot as plt
import numpy as np

def plot_processing_comparison(unprocessed_data, processed_data, file_name, path):
    fig, axes = plt.subplots(1, 2, figsize=(15, 7.5))
    
    axes[0].imshow(unprocessed_data, cmap='gray')
    axes[0].set_title(f'{file_name}: Unprocessed', fontsize=14)
    axes[0].axis('off')
    
    axes[1].imshow(processed_data, cmap='gray')
    axes[1].set_title(f'{file_name}: Processed', fontsize=14)
    axes[1].axis('off')
    
    plt.tight_layout()
    plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()
    
def plot_overview(unprocessed_volume_1, processed_volume_1,
                  unprocessed_volume_2, processed_volume_2,
                  unprocessed_volume_3, processed_volume_3, path):
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    
    axes[0, 0].imshow(unprocessed_volume_1, cmap='gray')
    axes[0, 0].set_title('20191010_tail_01.nd2: Unprocessed', fontsize=12)
    axes[0, 0].axis('off')
    
    axes[1, 0].imshow(processed_volume_1, cmap='gray')
    axes[1, 0].set_title('20191010_tail_01.nd2: Processed', fontsize=12)
    axes[1, 0].axis('off')
    
    axes[0, 1].imshow(unprocessed_volume_2, cmap='gray')
    axes[0, 1].set_title('sub-11-YAaLR_oophys.nwb: Unprocessed', fontsize=12)
    axes[0, 1].axis('off')
    
    axes[1, 1].imshow(processed_volume_2, cmap='gray')
    axes[1, 1].set_title('sub-11-YAaLR_oophys.nwb: Processed', fontsize=12)
    axes[1, 1].axis('off')
    
    axes[0, 2].imshow(unprocessed_volume_3, cmap='gray')
    axes[0, 2].set_title('20240523_Vang-1_37.tif: Unprocessed', fontsize=12)
    axes[0, 2].axis('off')
    
    axes[1, 2].imshow(processed_volume_3, cmap='gray')
    axes[1, 2].set_title('20240523_Vang-1_37.tif: Processed', fontsize=12)
    axes[1, 2].axis('off')
    
    plt.tight_layout()
    plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()`,
        
      'preprocessing.py': `import numpy as np
from scipy.ndimage import zoom, gaussian_filter

def maximally_project_image(image):
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
    return <DocumentationScreen selectedFunction={selectedFunction} onBackToScript={handleBackToScript} />;
  }

  if (!activityStarted) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', py: 3 }}>
        <Container maxWidth="md">
          <StyledCard>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="text.primary" fontWeight={500} textAlign="center">
                Comments Activity
              </Typography>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
                Though the project below is sufficiently organized for prospective users to know 
                where they should expect to find different files, the script themselves still expect 
                users to possess a lot of knowledge and understanding that they may lack. This 
                can even be true if that user is a future version of you that hasn't looked at this 
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
                <FileItem name="plotting.py" fileType="python" isHighlighted />
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
              NEED HELP?
            </Button>
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
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="text.primary" fontWeight={500} textAlign="center">
              {'{Activity Title}'}
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
              This script currently requires users to read and understand every single line of 
              code in order to get a sense for what is happening. We can improve on this step-by-step. 
              First, let's take a look at the functions, click one to work on it.
            </Typography>
          </CardContent>
        </StyledCard>

        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <StyledTabs value={currentTab} onChange={handleTabChange}>
            {openFiles.map((file, index) => (
              <Tab 
                key={file.id} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{file.name}</span>
                    {file.id !== 'directory' && (
                      <Box
                        component="span"
                        onClick={(event) => handleCloseFile(event, file.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          color: 'inherit',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white'
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </Box>
                    )}
                  </Box>
                }
              />
            ))}
          </StyledTabs>
          
          {openFiles.map((file, index) => (
            <TabPanel key={file.id} value={currentTab} index={index}>
              {file.type === 'directory' ? (
                <DirectoryView onFileClick={handleFileClick} />
              ) : (
                <FileContentView file={file} onFunctionSelect={handleFunctionSelect} />
              )}
            </TabPanel>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
            NEED HELP?
          </Button>
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