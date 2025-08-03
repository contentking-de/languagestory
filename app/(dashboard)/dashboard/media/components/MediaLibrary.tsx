'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileAudio, 
  FileVideo, 
  FileImage, 
  FileText, 
  Search,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  Copy,
  Eye,
  FolderOpen,
  Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaFile {
  id: number;
  blob_id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category?: string;
  tags?: string[];
  uploaded_by: number;
  uploaded_at: string;
  metadata?: any;
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch files from database
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  // Load files on mount and when filters change
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', acceptedFiles.length, 'accepted,', rejectedFiles.length, 'rejected');
    
    if (rejectedFiles.length > 0) {
      console.log('Rejected files:', rejectedFiles);
      alert(`Some files were rejected. Please check file types and sizes.`);
    }
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        console.log('Uploading file:', file.name, file.type, file.size);
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Upload successful:', result);
          // Refresh the file list after upload
          fetchFiles();
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
  }, [fetchFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    },
    multiple: true,
    noClick: true, // Prevent automatic file dialog on click
    noKeyboard: true
  });

  const getFileCategory = (type: string): string => {
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (type === 'application/pdf') return 'documents';
    return 'other';
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

  // Files are already filtered by the API, so we can use them directly
  const filteredFiles = files;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the file list after deletion
        fetchFiles();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {uploading ? (
              <p className="text-lg font-medium text-gray-600">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports images, audio, video, and documents (max 200MB per file)
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Choose Files
                  </Button>
                  <div className="text-xs text-gray-400">
                    Or drag and drop files here
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
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
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Media Files ({filteredFiles.length})</span>
            {selectedFiles.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URLs
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No files found</p>
              <p className="text-sm text-gray-500">Upload some files to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(file.url, '_blank')}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteFile(file.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(file.url, '_blank')}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteFile(file.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 