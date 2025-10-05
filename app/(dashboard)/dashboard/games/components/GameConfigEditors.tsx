'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export type MemoryConfig = {
  cards: Array<{ id: string; word: string; translation: string; image?: string }>;
  gridSize: number;
  timeLimit?: number;
};

export type HangmanConfig = {
  words: string[];
  hints: string[];
  maxAttempts: number;
  categories?: string[];
};

export type WordSearchConfig = {
  words: string[];
  gridSize: number;
  directions: string[];
};

export type WordMixupConfig = {
  sentences: Array<{ id: string; sentence: string; hint?: string }>;
  showTimer: boolean;
  allowHints: boolean;
};

export type WordAssociationConfig = {
  pairs: Array<{ id: string; word1: string; word2: string; category?: string }>;
  showTimer: boolean;
  shuffle: boolean;
  maxAttempts: number;
};

export type FlashcardsConfig = {
  cards: Array<{ front: string; back: string; image?: string }>;
  showTimer: boolean;
  shuffle: boolean;
};

export type GameConfig = {
  memory?: MemoryConfig;
  hangman?: HangmanConfig;
  wordSearch?: WordSearchConfig;
  wordMixup?: WordMixupConfig;
  wordAssociation?: WordAssociationConfig;
  flashcards?: FlashcardsConfig;
};

export function getConfigKeyForType(gameType: string): keyof GameConfig | undefined {
  switch (gameType) {
    case 'memory':
      return 'memory';
    case 'hangman':
      return 'hangman';
    case 'word_search':
      return 'wordSearch';
    case 'word_mixup':
      return 'wordMixup';
    case 'word_association':
      return 'wordAssociation';
    case 'flashcards':
      return 'flashcards';
    default:
      return undefined;
  }
}

export function GameConfigEditor({
  gameType,
  config,
  onChange,
}: {
  gameType: string;
  config?: any;
  onChange: (updated: any) => void;
}) {
  switch (gameType) {
    case 'memory':
      return <MemoryGameEditor config={config} onChange={onChange} />;
    case 'hangman':
      return <HangmanGameEditor config={config} onChange={onChange} />;
    case 'word_search':
      return <WordSearchGameEditor config={config} onChange={onChange} />;
    case 'word_mixup':
      return <WordMixupGameEditor config={config} onChange={onChange} />;
    case 'word_association':
      return <WordAssociationGameEditor config={config} onChange={onChange} />;
    case 'flashcards':
      return <FlashcardsGameEditor config={config} onChange={onChange} />;
    default:
      return <div>Select a supported game type to edit its configuration.</div>;
  }
}

export function MemoryGameEditor({ config, onChange }: { config?: MemoryConfig; onChange: (config: MemoryConfig) => void }) {
  const [cards, setCards] = useState<Array<{ id: string; word: string; translation: string; image?: string }>>(
    config?.cards || [{ id: '1', word: '', translation: '' }]
  );

  // Keep local state in sync with parent-provided config (e.g., auto-fill from lesson)
  useEffect(() => {
    if (config?.cards && config.cards.length > 0) {
      setCards(config.cards);
    }
  }, [config?.cards]);

  const addCard = () => {
    const newCards = [...cards, { id: Date.now().toString(), word: '', translation: '' }];
    setCards(newCards);
    onChange({ cards: newCards, gridSize: Math.ceil(Math.sqrt(newCards.length * 2)), timeLimit: config?.timeLimit });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value } as any;
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
              <Input value={card.word} onChange={(e) => updateCard(index, 'word', e.target.value)} placeholder="Enter word" />
            </div>
            <div>
              <Label>Translation</Label>
              <Input value={card.translation} onChange={(e) => updateCard(index, 'translation', e.target.value)} placeholder="Enter translation" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HangmanGameEditor({ config, onChange }: { config?: HangmanConfig; onChange: (config: HangmanConfig) => void }) {
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
              <Input value={word} onChange={(e) => updateWord(index, e.target.value)} placeholder="Enter word" />
            </div>
            <div>
              <Label>Hint {index + 1}</Label>
              <Input value={hints[index]} onChange={(e) => updateHint(index, e.target.value)} placeholder="Enter hint" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WordSearchGameEditor({ config, onChange }: { config?: WordSearchConfig; onChange: (config: WordSearchConfig) => void }) {
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
            <Input value={word} onChange={(e) => updateWord(index, e.target.value)} placeholder="Enter word to find" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlashcardsGameEditor({ config, onChange }: { config?: FlashcardsConfig; onChange: (config: FlashcardsConfig) => void }) {
  const [cards, setCards] = useState<Array<{ front: string; back: string; image?: string }>>(
    config?.cards || [{ front: '', back: '' }]
  );

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value } as any;
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
              <Input value={card.front} onChange={(e) => updateCard(index, 'front', e.target.value)} placeholder="Enter question or word" />
            </div>
            <div>
              <Label>Back (Answer)</Label>
              <Input value={card.back} onChange={(e) => updateCard(index, 'back', e.target.value)} placeholder="Enter answer or translation" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WordMixupGameEditor({ config, onChange }: { config?: WordMixupConfig; onChange: (config: WordMixupConfig) => void }) {
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
    newSentences[index] = { ...newSentences[index], [field]: value } as any;
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
              <Input value={sentence.sentence} onChange={(e) => updateSentence(index, 'sentence', e.target.value)} placeholder="Enter the correct sentence" />
            </div>
            <div>
              <Label>Hint (Optional)</Label>
              <Input value={sentence.hint || ''} onChange={(e) => updateSentence(index, 'hint', e.target.value)} placeholder="Enter a hint for this sentence" />
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

export function WordAssociationGameEditor({ config, onChange }: { config?: WordAssociationConfig; onChange: (config: WordAssociationConfig) => void }) {
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
    newPairs[index] = { ...newPairs[index], [field]: value } as any;
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
                <Input value={pair.word1} onChange={(e) => updatePair(index, 'word1', e.target.value)} placeholder="Enter first word" />
              </div>
              <div>
                <Label>Word 2</Label>
                <Input value={pair.word2} onChange={(e) => updatePair(index, 'word2', e.target.value)} placeholder="Enter related word" />
              </div>
              <div>
                <Label>Category (Optional)</Label>
                <Input value={pair.category || ''} onChange={(e) => updatePair(index, 'category', e.target.value)} placeholder="e.g., Animals, Colors, etc." />
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


