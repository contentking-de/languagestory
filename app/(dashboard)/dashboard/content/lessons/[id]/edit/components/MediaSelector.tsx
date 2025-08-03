'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileImage, 
  FileAudio, 
  FileVideo, 
  FileText, 
  Search,
  X,
  Play,
  Eye,
  Check,
  Upload,
  Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaFile {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  category?: string;
}

interface MediaSelectorProps {
  onSelect: (file: MediaFile) => void;
  onClose: () => void;
  selectedFile?: MediaFile | null;
  fileType?: 'image' | 'audio' | 'video';
}

export function MediaSelector({ onSelect, onClose, selectedFile, fileType }: MediaSelectorProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [searchTerm, selectedCategory]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter by file type if specified
        let filteredFiles = data.files;
        if (fileType) {
          filteredFiles = data.files.filter((file: MediaFile) => {
            if (fileType === 'image') return file.type.startsWith('image/');
            if (fileType === 'audio') return file.type.startsWith('audio/');
            if (fileType === 'video') return file.type.startsWith('video/');
            return true;
          });
        }
        setFiles(filteredFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-6 w-6" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-6 w-6" />;
    if (type.startsWith('video/')) return <FileVideo className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          // Add the new file to the list
          setFiles(prev => [result, ...prev]);
          // Auto-select the newly uploaded file
          onSelect(result);
          onClose();
        } else {
          const errorData = await response.json();
          console.error('Upload failed:', errorData);
          alert(`Upload failed: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onSelect, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    },
    multiple: false
  });

  const handleFileSelect = (file: MediaFile) => {
    onSelect(file);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">
            Select Media File
            {fileType && (
              <Badge variant="secondary" className="ml-2">
                {fileType}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Upload New File</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                {showUpload ? 'Hide' : 'Show'} Upload
              </Button>
            </div>
            
            {showUpload && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                {uploading ? (
                  <p className="text-sm font-medium text-gray-600">Uploading...</p>
                ) : isDragActive ? (
                  <p className="text-sm font-medium text-blue-600">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Drag & drop a file here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports images, audio, video, and documents (max 200MB)
                    </p>
                    {fileType && (
                      <p className="text-xs text-blue-600 mt-1">
                        Filtered for {fileType} files
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="images">Images</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="documents">Documents</option>
            </select>
          </div>

          {/* Files Grid */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No files found</p>
                <p className="text-sm text-gray-500">
                  {showUpload ? 'Upload a new file or try adjusting your search' : 'Try adjusting your search or upload a new file'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {index === 0 && file.id > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Recently Uploaded</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      {selectedFile?.id === file.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {file.type.startsWith('audio/') || file.type.startsWith('video/') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            const audio = new Audio(file.url);
                            audio.play();
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Play
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 