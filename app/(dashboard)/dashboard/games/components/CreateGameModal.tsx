'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    switch (selectedGameType) {
      case 'memory':
        return <MemoryGameConfig config={gameConfig.memory} onChange={(config) => setGameConfig({ ...gameConfig, memory: config })} />;
      case 'hangman':
        return <HangmanGameConfig config={gameConfig.hangman} onChange={(config) => setGameConfig({ ...gameConfig, hangman: config })} />;
      case 'word_search':
        return <WordSearchGameConfig config={gameConfig.wordSearch} onChange={(config) => setGameConfig({ ...gameConfig, wordSearch: config })} />;
      case 'word_mixup':
        return <WordMixupGameConfig config={gameConfig.wordMixup} onChange={(config) => setGameConfig({ ...gameConfig, wordMixup: config })} />;
      case 'word_association':
        return <WordAssociationGameConfig config={gameConfig.wordAssociation} onChange={(config) => setGameConfig({ ...gameConfig, wordAssociation: config })} />;
      case 'flashcards':
        return <FlashcardsGameConfig config={gameConfig.flashcards} onChange={(config) => setGameConfig({ ...gameConfig, flashcards: config })} />;
      default:
        return <div>Select a game type</div>;
    }
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
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={formData.difficulty_level.toString()} onValueChange={(value) => setFormData({ ...formData, difficulty_level: parseInt(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Beginner</SelectItem>
                          <SelectItem value="2">Elementary</SelectItem>
                          <SelectItem value="3">Intermediate</SelectItem>
                          <SelectItem value="4">Advanced</SelectItem>
                          <SelectItem value="5">Expert</SelectItem>
                        </SelectContent>
                      </Select>
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

// Game-specific configuration components
function MemoryGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [cards, setCards] = useState<Array<{ id: string; word: string; translation: string; image?: string }>>(
    config?.cards || [{ id: '1', word: '', translation: '' }]
  );

  const addCard = () => {
    setCards([...cards, { id: Date.now().toString(), word: '', translation: '' }]);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
    onChange({ cards: newCards, gridSize: Math.ceil(Math.sqrt(newCards.length * 2)) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Memory Cards</h4>
        <Button type="button" variant="outline" size="sm" onClick={addCard}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <div key={card.id} className="border rounded-lg p-3 space-y-2">
            <div>
              <Label>Word</Label>
              <Input
                value={card.word}
                onChange={(e) => updateCard(index, 'word', e.target.value)}
                placeholder="Enter word"
              />
            </div>
            <div>
              <Label>Translation</Label>
              <Input
                value={card.translation}
                onChange={(e) => updateCard(index, 'translation', e.target.value)}
                placeholder="Enter translation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HangmanGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [words, setWords] = useState<string[]>(config?.words || ['']);
  const [hints, setHints] = useState<string[]>(config?.hints || ['']);

  const addWord = () => {
    setWords([...words, '']);
    setHints([...hints, '']);
  };

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
    onChange({ words: newWords, hints, maxAttempts: 6 });
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
    onChange({ words, hints: newHints, maxAttempts: 6 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Words and Hints</h4>
        <Button type="button" variant="outline" size="sm" onClick={addWord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>
      
      <div className="space-y-3">
        {words.map((word, index) => (
          <div key={index} className="grid grid-cols-2 gap-3">
            <div>
              <Label>Word {index + 1}</Label>
              <Input
                value={word}
                onChange={(e) => updateWord(index, e.target.value)}
                placeholder="Enter word"
              />
            </div>
            <div>
              <Label>Hint {index + 1}</Label>
              <Input
                value={hints[index]}
                onChange={(e) => updateHint(index, e.target.value)}
                placeholder="Enter hint"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordSearchGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [words, setWords] = useState<string[]>(config?.words || ['']);

  const addWord = () => {
    setWords([...words, '']);
  };

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
    onChange({ words: newWords, gridSize: 15, directions: ['horizontal', 'vertical', 'diagonal'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Words to Find</h4>
        <Button type="button" variant="outline" size="sm" onClick={addWord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>
      
      <div className="space-y-3">
        {words.map((word, index) => (
          <div key={index}>
            <Label>Word {index + 1}</Label>
            <Input
              value={word}
              onChange={(e) => updateWord(index, e.target.value)}
              placeholder="Enter word to find"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FlashcardsGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [cards, setCards] = useState<Array<{ front: string; back: string; image?: string }>>(
    config?.cards || [{ front: '', back: '' }]
  );

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
    onChange({ cards: newCards, showTimer: true, shuffle: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Flashcards</h4>
        <Button type="button" variant="outline" size="sm" onClick={addCard}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
      
      <div className="space-y-3">
        {cards.map((card, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div>
              <Label>Front (Question)</Label>
              <Input
                value={card.front}
                onChange={(e) => updateCard(index, 'front', e.target.value)}
                placeholder="Enter question or word"
              />
            </div>
            <div>
              <Label>Back (Answer)</Label>
              <Input
                value={card.back}
                onChange={(e) => updateCard(index, 'back', e.target.value)}
                placeholder="Enter answer or translation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 

function WordMixupGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [sentences, setSentences] = useState<Array<{ id: string; sentence: string; hint?: string }>>(
    config?.sentences || [{ id: '1', sentence: '', hint: '' }]
  );
  const [showTimer, setShowTimer] = useState(config?.showTimer ?? true);
  const [allowHints, setAllowHints] = useState(config?.allowHints ?? true);

  const addSentence = () => {
    const newId = (sentences.length + 1).toString();
    setSentences([...sentences, { id: newId, sentence: '', hint: '' }]);
  };

  const updateSentence = (index: number, field: string, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = { ...newSentences[index], [field]: value };
    setSentences(newSentences);
    onChange({ sentences: newSentences, showTimer, allowHints });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Sentences</h4>
        <Button type="button" variant="outline" size="sm" onClick={addSentence}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sentence
        </Button>
      </div>
      
      <div className="space-y-4">
        {sentences.map((sentence, index) => (
          <div key={sentence.id} className="border rounded-lg p-3 space-y-2">
            <div>
              <Label>Sentence {index + 1}</Label>
              <Input
                value={sentence.sentence}
                onChange={(e) => updateSentence(index, 'sentence', e.target.value)}
                placeholder="Enter the correct sentence"
              />
            </div>
            <div>
              <Label>Hint (Optional)</Label>
              <Input
                value={sentence.hint || ''}
                onChange={(e) => updateSentence(index, 'hint', e.target.value)}
                placeholder="Enter a hint for this sentence"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="showTimer"
            type="checkbox"
            checked={showTimer}
            onChange={(e) => {
              setShowTimer(e.target.checked);
              onChange({ sentences, showTimer: e.target.checked, allowHints });
            }}
            className="rounded border-gray-300"
          />
          <Label htmlFor="showTimer">Show Timer</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="allowHints"
            type="checkbox"
            checked={allowHints}
            onChange={(e) => {
              setAllowHints(e.target.checked);
              onChange({ sentences, showTimer, allowHints: e.target.checked });
            }}
            className="rounded border-gray-300"
          />
          <Label htmlFor="allowHints">Allow Hints</Label>
        </div>
      </div>
    </div>
  );
} 

function WordAssociationGameConfig({ config, onChange }: { config?: any; onChange: (config: any) => void }) {
  const [pairs, setPairs] = useState<Array<{ id: string; word1: string; word2: string; category?: string }>>(
    config?.pairs || [{ id: '1', word1: '', word2: '', category: '' }]
  );
  const [showTimer, setShowTimer] = useState(config?.showTimer ?? true);
  const [shuffle, setShuffle] = useState(config?.shuffle ?? true);
  const [maxAttempts, setMaxAttempts] = useState(config?.maxAttempts ?? 3);

  const addPair = () => {
    const newId = (pairs.length + 1).toString();
    setPairs([...pairs, { id: newId, word1: '', word2: '', category: '' }]);
  };

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setPairs(newPairs);
    onChange({ pairs: newPairs, showTimer, shuffle, maxAttempts });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Word Pairs</h4>
        <Button type="button" variant="outline" size="sm" onClick={addPair}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pair
        </Button>
      </div>
      
      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label>Word 1</Label>
                <Input
                  value={pair.word1}
                  onChange={(e) => updatePair(index, 'word1', e.target.value)}
                  placeholder="Enter first word"
                />
              </div>
              <div>
                <Label>Word 2</Label>
                <Input
                  value={pair.word2}
                  onChange={(e) => updatePair(index, 'word2', e.target.value)}
                  placeholder="Enter related word"
                />
              </div>
              <div>
                <Label>Category (Optional)</Label>
                <Input
                  value={pair.category || ''}
                  onChange={(e) => updatePair(index, 'category', e.target.value)}
                  placeholder="e.g., Animals, Colors, etc."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="showTimer"
            type="checkbox"
            checked={showTimer}
            onChange={(e) => {
              setShowTimer(e.target.checked);
              onChange({ pairs, showTimer: e.target.checked, shuffle, maxAttempts });
            }}
            className="rounded border-gray-300"
          />
          <Label htmlFor="showTimer">Show Timer</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="shuffle"
            type="checkbox"
            checked={shuffle}
            onChange={(e) => {
              setShuffle(e.target.checked);
              onChange({ pairs, showTimer, shuffle: e.target.checked, maxAttempts });
            }}
            className="rounded border-gray-300"
          />
          <Label htmlFor="shuffle">Shuffle Words</Label>
        </div>

        <div>
          <Label htmlFor="maxAttempts">Maximum Attempts</Label>
          <Input
            id="maxAttempts"
            type="number"
            min="1"
            max="100"
            value={maxAttempts}
            onChange={(e) => {
              const attempts = parseInt(e.target.value) || 1;
              setMaxAttempts(attempts);
              onChange({ pairs, showTimer, shuffle, maxAttempts: attempts });
            }}
            placeholder="Enter number of attempts"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 