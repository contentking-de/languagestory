'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Brain,
  Sparkles,
  BookOpen,
  HelpCircle,
  Languages,
  FileText,
  MessageSquare,
  Loader2,
  Wand2,
  Save,
  Eye,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Lesson {
  id: number;
  title: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

interface GeneratedContent {
  type: string;
  data: any;
  preview: string;
  usedPrompt?: string;
}

export default function AICreatorPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [contentType, setContentType] = useState('');
  const [aiProvider, setAiProvider] = useState('openai');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [targetLessonId, setTargetLessonId] = useState<number | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [quizName, setQuizName] = useState('');
  const [grammarName, setGrammarName] = useState('');
  const [error, setError] = useState('');
  const isImage = contentType === 'image';

  // Enforce GPT-5 for image generation to avoid user confusion
  useEffect(() => {
    if (isImage && aiProvider !== 'gpt5') {
      setAiProvider('gpt5');
    }
  }, [isImage, aiProvider]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons/simple');
      if (response.ok) {
        const lessonsData = await response.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleGenerate = async () => {
    if (!contentType) {
      setError('Please select a content type');
      return;
    }
    if (isImage) {
      if (!topic.trim()) {
        setError('Please enter an image prompt');
        return;
      }
    } else {
      if (!language || !level || !topic.trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }

    setIsGenerating(true);
    setError('');
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isImage
            ? {
                contentType,
                aiProvider,
                topic,
              }
            : {
                contentType,
                aiProvider,
                language,
                level,
                topic,
                quantity,
              }
        ),
      });

      const contentTypeHeader = response.headers.get('content-type') || '';
      if (response.ok) {
        if (contentTypeHeader.includes('application/json')) {
          const result = await response.json();
          setGeneratedContent(result);
        } else {
          const text = await response.text();
          setError(text || 'Failed to generate content');
        }
      } else {
        if (contentTypeHeader.includes('application/json')) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to generate content');
        } else {
          const text = await response.text();
          setError(text || 'Failed to generate content');
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError('An error occurred while generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    // Validate quiz name for quiz content (both types)
    if ((generatedContent.type === 'quiz' || generatedContent.type === 'true_false_quiz') && !quizName.trim()) {
      setError('Please enter a name for your quiz');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // For images: compress client-side to WebP (~quality 70) to ensure <200KB
      let clientImage: { base64: string; mime: string } | undefined;
      if (generatedContent.type === 'image') {
        try {
          const res = await fetch(generatedContent.preview);
          const blob = await res.blob();
          const webpBlob = await compressToWebp(blob, 0.7, 1024);
          const arrayBuf = await webpBlob.arrayBuffer();
          const b64 = Buffer.from(arrayBuf).toString('base64');
          clientImage = { base64: b64, mime: webpBlob.type || 'image/webp' };
        } catch (e) {
          console.warn('Client-side image compression failed; sending original preview PNG.', e);
        }
      }

      const response = await fetch('/api/ai/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: generatedContent.type,
          data: generatedContent.type === 'image' && clientImage
            ? { base64: clientImage.base64 }
            : generatedContent.data,
          lessonId: targetLessonId,
          customName: (generatedContent.type === 'quiz' || generatedContent.type === 'true_false_quiz')
            ? quizName.trim()
            : (generatedContent.type === 'grammar' ? grammarName.trim() : undefined),
          imagePrompt: generatedContent.type === 'image' ? topic : undefined,
          imageMime: generatedContent.type === 'image' ? (clientImage?.mime || 'image/png') : undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully saved ${result.count} ${generatedContent.type}(s)!`);
        setGeneratedContent(null);
        setTopic('');
        setQuizName('');
        setGrammarName('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setError('An error occurred while saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      quiz: <HelpCircle className="h-6 w-6" />,
      vocabulary: <Languages className="h-6 w-6" />,
      story: <BookOpen className="h-6 w-6" />,
      conversation: <MessageSquare className="h-6 w-6" />,
      grammar: <FileText className="h-6 w-6" />,
      image: <ImageIcon className="h-6 w-6" />
    };
    return icons[type as keyof typeof icons] || <Brain className="h-6 w-6" />;
  };

  const getAiProviderInfo = (provider: string) => {
    const providers = {
      openai: { name: 'OpenAI GPT-4', description: 'Best for creative and diverse content generation' },
      anthropic: { name: 'Claude', description: 'Excellent for educational content and detailed explanations' },
      perplexity: { name: 'Perplexity', description: 'Great for fact-based and research-oriented content' },
      gpt5: { name: 'OpenAI GPT-5', description: 'Latest-generation model for high-quality, structured outputs' }
    };
    return providers[provider as keyof typeof providers] || { name: provider, description: '' };
  };

  // Client-side WebP compression helper
  async function compressToWebp(inputBlob: Blob, quality = 0.7, maxWidth = 1024): Promise<Blob> {
    const bitmap = await createImageBitmap(inputBlob);
    const canvas = document.createElement('canvas');
    const ratio = Math.min(1, maxWidth / bitmap.width);
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return inputBlob;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    return blob || inputBlob;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Creator</h1>
          <p className="text-gray-600 mt-1">
            Generate educational content using AI to enhance your lessons
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type */}
              <div>
                <Label htmlFor="contentType">Content Type *</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="What would you like to create?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Multiple Choice Quiz
                      </div>
                    </SelectItem>
                    <SelectItem value="true_false_quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        True or False Quiz
                      </div>
                    </SelectItem>
                    <SelectItem value="vocabulary">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Vocabulary Words
                      </div>
                    </SelectItem>
                    <SelectItem value="story">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Short Story
                      </div>
                    </SelectItem>
                    <SelectItem value="cultural">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Cultural Information
                      </div>
                    </SelectItem>
                    <SelectItem value="conversation">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Conversation Practice
                      </div>
                    </SelectItem>
                    <SelectItem value="grammar">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Grammar Exercises
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Provider (hidden for Image type) */}
              {!isImage && (
              <div>
                <Label htmlFor="aiProvider">AI Provider</Label>
                <Select value={aiProvider} onValueChange={setAiProvider}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">
                      <div>
                        <div className="font-medium">OpenAI GPT-4</div>
                        <div className="text-xs text-gray-500">Creative and diverse content</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt5">
                      <div>
                        <div className="font-medium">OpenAI GPT-5</div>
                        <div className="text-xs text-gray-500">Latest-generation quality and structure</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="anthropic">
                      <div>
                        <div className="font-medium">Claude (Anthropic)</div>
                        <div className="text-xs text-gray-500">Educational content specialist</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="perplexity">
                      <div>
                        <div className="font-medium">Perplexity</div>
                        <div className="text-xs text-gray-500">Research-based content</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {getAiProviderInfo(aiProvider).description}
                </p>
              </div>
              )}

              {/* Language & Level */}
              {!isImage && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Target Language *</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="french">🇫🇷 French</SelectItem>
                      <SelectItem value="german">🇩🇪 German</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="english">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Difficulty Level *</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (A1)</SelectItem>
                      <SelectItem value="elementary">Elementary (A2)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (B1)</SelectItem>
                      <SelectItem value="upper-intermediate">Upper-Intermediate (B2)</SelectItem>
                      <SelectItem value="advanced">Advanced (C1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              )}

              {/* Topic / Image Prompt */}
              <div>
                <Label htmlFor="topic">{isImage ? 'Image Prompt *' : 'Keyword, Topic or Theme *'}</Label>
                {isImage ? (
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe the image you want. Style, mood, objects, colors..."
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'food and restaurants', 'travel and tourism', 'daily routines'"
                    className="mt-1"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {isImage
                    ? 'We will use your prompt and our team image as a style reference.'
                    : 'Be specific for better results (e.g., "ordering food at a restaurant" vs "food")'}
                </p>
              </div>

              {/* Quantity */}
              {!isImage && (
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="1">1 item</SelectItem>
                    <SelectItem value="3">3 items</SelectItem>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="15">15 items</SelectItem>
                    <SelectItem value="20">20 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Target Lesson */}
              {!isImage && (
              <div>
                <Label htmlFor="targetLesson">Assign to Lesson (Optional)</Label>
                <Select 
                  value={targetLessonId ? targetLessonId.toString() : 'unassigned'} 
                  onValueChange={(value) => setTargetLessonId(value === 'unassigned' ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No lesson (save to library)</SelectItem>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.title} ({lesson.course_language} - {lesson.course_title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !contentType || (isImage ? !topic.trim() : (!language || !level || !topic.trim()))}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating with {getAiProviderInfo(aiProvider).name}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Generated Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!generatedContent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {contentType ? getContentTypeIcon(contentType) : <Brain className="h-6 w-6 text-gray-400" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {contentType ? `Ready to generate ${contentType}` : 'Select content type to begin'}
                  </h3>
                  <p className="text-gray-500">
                    {contentType 
                      ? 'Configure your settings and click "Generate Content" to create AI-powered educational materials.'
                      : 'Choose what type of content you want to create with AI assistance.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(generatedContent.type)}
                      <span className="font-medium capitalize">{generatedContent.type}</span>
                      {generatedContent.type !== 'image' && (
                        <span className="text-sm text-gray-500">
                          ({Array.isArray(generatedContent.data) ? generatedContent.data.length : 1} items)
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => setGeneratedContent(null)}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>

                  {/* Quiz Name Input (only for quizzes) */}
                  {(generatedContent.type === 'quiz' || generatedContent.type === 'true_false_quiz') && (
                    <div className="space-y-2">
                      <Label htmlFor="quizName">Quiz Name *</Label>
                      <Input
                        id="quizName"
                        value={quizName}
                        onChange={(e) => setQuizName(e.target.value)}
                        placeholder="Enter a name for your quiz (e.g., 'German Travel Vocabulary Quiz')"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Give your quiz a descriptive name that students will see
                      </p>
                    </div>
                  )}

                  {/* Grammar Title Input */}
                  {generatedContent.type === 'grammar' && (
                    <div className="space-y-2">
                      <Label htmlFor="grammarName">Title *</Label>
                      <Input
                        id="grammarName"
                        value={grammarName}
                        onChange={(e) => setGrammarName(e.target.value)}
                        placeholder="Enter a title for this grammar exercise"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        This title will be used in lessons and listings.
                      </p>
                    </div>
                  )}

                  {/* Preview Content */}
                  {generatedContent.type === 'image' ? (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                      <img src={generatedContent.preview} alt="Generated" className="max-h-80 rounded-md" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {generatedContent.preview}
                      </pre>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button 
                    onClick={handleSave} 
                    disabled={
                      isSaving ||
                      ((generatedContent.type === 'quiz' || generatedContent.type === 'true_false_quiz') && !quizName.trim()) ||
                      (generatedContent.type === 'grammar' && !grammarName.trim()) ||
                      (generatedContent.type === 'cultural' && !targetLessonId)
                    }
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving {generatedContent.type}...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {generatedContent.type === 'image'
                          ? 'Save Image'
                          : `Save ${generatedContent.type === 'true_false_quiz' ? 'Quiz' : generatedContent.type.charAt(0).toUpperCase() + generatedContent.type.slice(1)}${targetLessonId ? ' to Lesson' : ' to Library'}`}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}