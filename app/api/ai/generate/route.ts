import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Content generation prompts
const getPrompt = (contentType: string, language: string, level: string, topic: string, quantity: number) => {
  const levelDescriptions = {
    beginner: 'very simple vocabulary and basic grammar (A1 level)',
    elementary: 'simple vocabulary and elementary grammar (A2 level)',
    intermediate: 'moderate vocabulary and intermediate grammar (B1 level)',
    'upper-intermediate': 'varied vocabulary and complex grammar (B2 level)',
    advanced: 'sophisticated vocabulary and advanced grammar (C1 level)'
  };

  const levelDesc = levelDescriptions[level as keyof typeof levelDescriptions] || 'appropriate for the specified level';

  const prompts = {
    quiz: `Create ${quantity} multiple choice quiz questions about "${topic}" for ${level} ${language} learners.

Requirements:
- Use ${levelDesc}
- IMPORTANT: Question text must ALWAYS be in English, regardless of the target language
- Answer options must be in ${language} (the target language)
- Each question should have 4 options (A, B, C, D) with only one correct answer
- Include a mix of vocabulary, grammar, and comprehension questions
- Questions should test knowledge of ${language} language skills
- Questions should be practical and relevant to real-life situations
- Provide the correct answer for each question

Format as JSON:
{
  "questions": [
    {
      "question": "Question text in English (always English, never in ${language})",
      "options": ["A) Answer option 1 in ${language}", "B) Answer option 2 in ${language}", "C) Answer option 3 in ${language}", "D) Answer option 4 in ${language}"],
      "correct_answer": "A",
      "explanation": "Brief explanation in English of why this is correct",
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`,

    true_false_quiz: `Create ${quantity} true or false quiz questions about "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- Each question should be a statement that can be answered with TRUE or FALSE
- Include a mix of vocabulary, grammar, cultural facts, and comprehension questions
- Questions should be practical and relevant to real-life situations
- Provide the correct answer (true or false) for each question
- Make sure statements are clear and unambiguous

Format as JSON:
{
  "questions": [
    {
      "question": "Statement in ${language}",
      "correct_answer": "true",
      "explanation": "Brief explanation of why this statement is true or false",
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`,

    vocabulary: `Create ${quantity} vocabulary words related to "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- Include the word in ${language}, English translation, and pronunciation guide
- Provide a context sentence showing how to use the word
- Add cultural notes where relevant
- Include word type (noun, verb, adjective, etc.)

Format as JSON:
{
  "words": [
    {
      "word_${language}": "Word in ${language}",
      "word_english": "English translation",
      "pronunciation": "Pronunciation guide",
      "phonetic": "IPA notation if available",
      "context_sentence": "Example sentence in ${language}",
      "cultural_note": "Cultural context or interesting facts",
      "word_type": "noun/verb/adjective/etc",
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`,

    story: `Write a short story about "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- Story should be 200-400 words long
- Include dialogue and descriptive language appropriate for the level
- Focus on practical vocabulary related to the topic
- Make it engaging and culturally relevant

Format as JSON:
{
  "story": {
    "title": "Story title in ${language}",
    "content": "Full story text in ${language}",
    "vocabulary_highlights": ["key", "vocabulary", "words"],
    "grammar_focus": ["grammar", "points", "covered"],
    "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5},
    "estimated_reading_time": "estimated minutes to read"
  }
}`,

    conversation: `Create ${quantity} conversation starters/dialogues about "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- Each dialogue should be 4-8 exchanges between 2 people
- Include natural expressions and cultural elements
- Provide context for when/where the conversation takes place

Format as JSON:
{
  "conversations": [
    {
      "title": "Conversation title",
      "context": "Setting/situation description",
      "dialogue": [
        {"speaker": "Person A", "text": "What they say in ${language}"},
        {"speaker": "Person B", "text": "Response in ${language}"}
      ],
      "key_phrases": ["important", "phrases", "to", "learn"],
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`,

    grammar: `Create ${quantity} grammar exercises about "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- Focus on specific grammar points relevant to the topic
- Include fill-in-the-blank, transformation, and error correction exercises
- Provide clear explanations

Format as JSON:
{
  "exercises": [
    {
      "type": "fill-in-blank/transformation/error-correction",
      "instruction": "Clear instruction in English",
      "question": "Exercise question in ${language}",
      "correct_answer": "Correct answer",
      "explanation": "Grammar rule explanation",
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`
  };

  return prompts[contentType as keyof typeof prompts] || '';
};

export async function POST(request: Request) {
  try {
    const { contentType, aiProvider, language, level, topic, quantity } = await request.json();

    if (!contentType || !aiProvider || !language || !level || !topic) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const prompt = getPrompt(contentType, language, level, topic, quantity);
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    let generatedContent: any;
    let rawResponse: string;

    // Generate content based on provider
    if (aiProvider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert language teacher and educational content creator. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      rawResponse = completion.choices[0]?.message?.content || '';
    } 
    else if (aiProvider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Anthropic API key not configured' },
          { status: 500 }
        );
      }

      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        system: 'You are an expert language teacher and educational content creator. Always respond with valid JSON in the exact format requested.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      rawResponse = message.content[0].type === 'text' ? message.content[0].text : '';
    }
    else if (aiProvider === 'perplexity') {
      // For now, we'll use OpenAI as a fallback for Perplexity
      // You can implement Perplexity API later when available
      return NextResponse.json(
        { error: 'Perplexity integration coming soon. Please use OpenAI or Claude for now.' },
        { status: 501 }
      );
    }
    else {
      return NextResponse.json(
        { error: 'Unsupported AI provider' },
        { status: 400 }
      );
    }

    // Parse the JSON response
    try {
      // Clean the response to extract JSON
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;
      generatedContent = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Create a preview of the content
    const preview = createPreview(contentType, generatedContent);

    return NextResponse.json({
      type: contentType,
      data: generatedContent,
      preview,
      aiProvider
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}

function createPreview(contentType: string, data: any): string {
  switch (contentType) {
    case 'quiz':
      return data.questions?.map((q: any, i: number) => 
        `${i + 1}. ${q.question}\n${q.options?.join('\n')}\nCorrect: ${q.correct_answer}\n`
      ).join('\n') || 'No questions generated';

    case 'true_false_quiz':
      return data.questions?.map((q: any, i: number) => 
        `${i + 1}. ${q.question}\nAnswer: ${q.correct_answer?.toUpperCase()}\n`
      ).join('\n') || 'No questions generated';

    case 'vocabulary':
      return data.words?.map((w: any, i: number) => 
        `${i + 1}. ${Object.values(w).find(val => typeof val === 'string' && val.length > 0)} (${w.word_english})\n   ${w.context_sentence || ''}\n`
      ).join('\n') || 'No vocabulary generated';

    case 'story':
      return `Title: ${data.story?.title || 'Untitled'}\n\n${data.story?.content || 'No story generated'}`;

    case 'conversation':
      return data.conversations?.map((c: any, i: number) => 
        `${i + 1}. ${c.title}\nContext: ${c.context}\n${c.dialogue?.map((d: any) => `${d.speaker}: ${d.text}`).join('\n')}\n`
      ).join('\n') || 'No conversations generated';

    case 'grammar':
      return data.exercises?.map((e: any, i: number) => 
        `${i + 1}. ${e.instruction}\n${e.question}\nAnswer: ${e.correct_answer}\n`
      ).join('\n') || 'No exercises generated';

    default:
      return JSON.stringify(data, null, 2);
  }
}