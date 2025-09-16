'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CefrDifficultySelect from '@/components/ui/cefr-difficulty-select';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Plus, 
  Save, 
  Loader2,
  Gamepad2,
  Brain,
  Target,
  BookOpen,
  Clock,
  Star,
  Shuffle,
  Link
} from 'lucide-react';
import { GameConfigEditor, getConfigKeyForType } from './GameConfigEditors';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: (game: any) => void;
}

interface GameConfig {
  memory?: {
    cards: Array<{ id: string; word: string; translation: string; image?: string }>;
    gridSize: number;
    timeLimit?: number;
  };
  hangman?: {
    words: string[];
    hints: string[];
    maxAttempts: number;
    categories?: string[];
  };
  wordSearch?: {
    words: string[];
    gridSize: number;
    directions: string[];
  };
  wordMixup?: {
    sentences: Array<{ id: string; sentence: string; hint?: string }>;
    showTimer: boolean;
    allowHints: boolean;
  };
  wordAssociation?: {
    pairs: Array<{ id: string; word1: string; word2: string; category?: string }>;
    showTimer: boolean;
    shuffle: boolean;
    maxAttempts: number;
  };
  flashcards?: {
    cards: Array<{ front: string; back: string; image?: string }>;
    showTimer: boolean;
    shuffle: boolean;
  };
}

const gameTypes = [
  { value: 'memory', label: 'Memory Game', icon: Brain, description: 'Match pairs of cards with words and translations' },
  { value: 'hangman', label: 'Hangman', icon: Target, description: 'Guess the word letter by letter' },
  { value: 'word_search', label: 'Word Search', icon: BookOpen, description: 'Find hidden words in a grid' },
  { value: 'word_mixup', label: 'Word Mixup', icon: Shuffle, description: 'Reorder scrambled words to form correct sentences' },
  { value: 'word_association', label: 'Word Association', icon: Link, description: 'Match related word pairs to build vocabulary connections' },
  { value: 'flashcards', label: 'Flashcards', icon: Star, description: 'Interactive flashcards for vocabulary practice' },
];

export function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const [step, setStep] = useState<'type' | 'config'>('type');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    category: 'vocabulary',
    difficulty_level: 1,
    estimated_duration: 5,
    lesson_id: '',
  });
  const [gameConfig, setGameConfig] = useState<GameConfig>({});

  if (!isOpen) return null;

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    setStep('config');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate game configuration
    if (selectedGameType === 'memory' && (!gameConfig.memory || !gameConfig.memory.cards || gameConfig.memory.cards.length === 0)) {
      alert('Please add at least one memory card pair');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'memory' && gameConfig.memory?.cards) {
      const emptyCards = gameConfig.memory.cards.filter(card => !card.word.trim() || !card.translation.trim());
      if (emptyCards.length > 0) {
        alert('Please fill in all memory card fields (word and translation)');
        setLoading(false);
        return;
      }
    }

    if (selectedGameType === 'hangman' && (!gameConfig.hangman || !gameConfig.hangman.words || gameConfig.hangman.words.length === 0)) {
      alert('Please add at least one word for hangman');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'hangman' && gameConfig.hangman?.words) {
      const emptyWords = gameConfig.hangman.words.filter(word => !word.trim());
      if (emptyWords.length > 0) {
        alert('Please fill in all hangman words');
        setLoading(false);
        return;
      }
    }

    if (selectedGameType === 'word_search' && (!gameConfig.wordSearch || !gameConfig.wordSearch.words || gameConfig.wordSearch.words.length === 0)) {
      alert('Please add at least one word for word search');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'word_search' && gameConfig.wordSearch?.words) {
      const emptyWords = gameConfig.wordSearch.words.filter(word => !word.trim());
      if (emptyWords.length > 0) {
        alert('Please fill in all word search words');
        setLoading(false);
        return;
      }
    }

    if (selectedGameType === 'flashcards' && (!gameConfig.flashcards || !gameConfig.flashcards.cards || gameConfig.flashcards.cards.length === 0)) {
      alert('Please add at least one flashcard');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'flashcards' && gameConfig.flashcards?.cards) {
      const emptyCards = gameConfig.flashcards.cards.filter(card => !card.front.trim() || !card.back.trim());
      if (emptyCards.length > 0) {
        alert('Please fill in all flashcard fields (front and back)');
        setLoading(false);
        return;
      }
    }

    if (selectedGameType === 'word_mixup' && (!gameConfig.wordMixup || !gameConfig.wordMixup.sentences || gameConfig.wordMixup.sentences.length === 0)) {
      alert('Please add at least one sentence for word mixup');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'word_mixup' && gameConfig.wordMixup?.sentences) {
      const emptySentences = gameConfig.wordMixup.sentences.filter(sentence => !sentence.sentence.trim());
      if (emptySentences.length > 0) {
        alert('Please fill in all sentence fields');
        setLoading(false);
        return;
      }
    }

    if (selectedGameType === 'word_association' && (!gameConfig.wordAssociation || !gameConfig.wordAssociation.pairs || gameConfig.wordAssociation.pairs.length === 0)) {
      alert('Please add at least one word pair for word association');
      setLoading(false);
      return;
    }

    if (selectedGameType === 'word_association' && gameConfig.wordAssociation?.pairs) {
      const emptyPairs = gameConfig.wordAssociation.pairs.filter(pair => !pair.word1.trim() || !pair.word2.trim());
      if (emptyPairs.length > 0) {
        alert('Please fill in all word pair fields (both words)');
        setLoading(false);
        return;
      }
    }

    try {
      const requestBody = {
        ...formData,
        game_type: selectedGameType,
        game_config: gameConfig,
        provider_name: 'Custom',
      };
      
      console.log('Sending game data:', requestBody);
      
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const newGame = await response.json();
        onGameCreated(newGame);
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Failed to create game:', errorData);
        alert(`Failed to create game: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setSelectedGameType('');
    setFormData({
      title: '',
      description: '',
      language: '',
      category: 'vocabulary',
      difficulty_level: 1,
      estimated_duration: 5,
      lesson_id: '',
    });
    setGameConfig({});
  };

  const renderGameTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Choose Game Type</h3>
        <p className="text-sm text-gray-600">Select the type of game you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameTypes.map((gameType) => {
          const Icon = gameType.icon;
          return (
            <Card 
              key={gameType.value}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300"
              onClick={() => handleGameTypeSelect(gameType.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-6 w-6 text-orange-500" />
                  <h4 className="font-semibold text-gray-900">{gameType.label}</h4>
                </div>
                <p className="text-sm text-gray-600">{gameType.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderGameConfig = () => {
    const key = getConfigKeyForType(selectedGameType);
    if (!key) return <div>Select a game type</div>;
    const cfg = (gameConfig as any)[key];
    return (
      <GameConfigEditor
        gameType={selectedGameType}
        config={cfg}
        onChange={(updated) => setGameConfig({ ...gameConfig, [key]: updated })}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'type' ? 'Create New Game' : `Create ${gameTypes.find(t => t.value === selectedGameType)?.label}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' ? (
            renderGameTypeSelection()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Game Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Game Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Game Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Enter game title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the game and its learning objectives"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vocabulary">Vocabulary</SelectItem>
                          <SelectItem value="grammar">Grammar</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <CefrDifficultySelect
                        id="difficulty"
                        label="Difficulty Level"
                        value={formData.difficulty_level}
                        onChange={(val) => setFormData({ ...formData, difficulty_level: val })}
                        placeholder="Select difficulty"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.estimated_duration}
                        onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 5 })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game-Specific Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Game Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderGameConfig()}
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setStep('type')}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Game
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Config editors moved to GameConfigEditors.tsx