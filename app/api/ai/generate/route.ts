import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
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
  const langLower = (language || '').toLowerCase();
  const isGerman = langLower === 'german' || langLower === 'de' || langLower === 'deutsch';
  const isFrench = langLower === 'french' || langLower === 'fr' || langLower === 'français' || langLower === 'francais';
  const isSpanish = langLower === 'spanish' || langLower === 'es' || langLower === 'español' || langLower === 'espanol';
  const levelLower = (level || '').toLowerCase();
  const storyMaxWords = (() => {
    if (levelLower === 'beginner') return 200;
    if (levelLower === 'intermediate') return 300;
    if (levelLower === 'advanced') return 500;
    return 300; // sensible default
  })();

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

    true_false_quiz: `Create ${quantity} true or false quiz questions about "${topic}" related to ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- IMPORTANT: Question text must ALWAYS be in English (the statement must be in English)
- Each question should be a clear statement that can be answered with TRUE or FALSE
- Include a mix of vocabulary, grammar, cultural facts, and comprehension questions
- Questions should be practical and relevant to real-life situations
- Provide the correct answer (true or false) for each question
- Make sure statements are clear and unambiguous

Format as JSON:
{
  "questions": [
    {
      "question": "Statement in English",
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
${isGerman ? '- For German nouns, include the correct definite article (der/die/das). Prefix it directly to the German word (e.g., "die Lampe"). Also include a separate "article" field containing only der/die/das, or an empty string if not a noun.' : ''}
${isFrench ? '- For French nouns, include the correct definite article (le/la/l\'/les). Prefix it directly to the French word (e.g., "la table", "l\'hôtel"). Also include a separate "article" field containing only le/la/l\'/les, or an empty string if not a noun.' : ''}
${isSpanish ? '- For Spanish nouns, include the correct definite article (el/la/los/las). Prefix it directly to the Spanish word (e.g., "la mesa"). Also include a separate "article" field containing only el/la/los/las, or an empty string if not a noun.' : ''}

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
      ${isGerman || isFrench || isSpanish ? '"article": "language-appropriate article for nouns (e.g., der/die/das, le/la/l\'/les, el/la/los/las); empty string for non-nouns",' : ''}
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`,

    story: `Write a short story about "${topic}" in ${language} for ${level} learners.

Requirements:
- Use ${levelDesc}
- IMPORTANT: Keep the story concise and do NOT exceed ${storyMaxWords} words (hard limit)
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

    cultural: `Create engaging cultural information about "${topic}" related to ${language}-speaking cultures for ${level} learners.

Requirements:
- Use ${levelDesc}
- Focus on practical, interesting facts learners can discuss (customs, etiquette, festivals, food, daily life, dos & don'ts)
- Keep tone friendly and motivating; avoid politics or sensitive topics
- Structure as short paragraphs (3-5), optionally with bullet points
 - IMPORTANT: Write the full output text in English only (not ${language})
 - IMPORTANT: Plain text only. Do NOT use any Markdown formatting (no headings, no bold/italics). Do NOT output symbols like **, __, #, *, backticks. Use simple sentences and optional dash bullets ("- ") only.

Format as JSON:
{
  "cultural_information": "Well-formatted markdown/plain text suitable to show in a lesson card"
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

    grammar: `Create ${quantity} multiple choice grammar questions about "${topic}" for ${level} ${language} learners.

Requirements:
- Use ${levelDesc}
- Focus on key grammar points (conjugation, articles, cases, word order, prepositions, etc.)
- Question text must be in English and clearly describe the task
- Options must be in ${language} and reflect realistic grammar variants
- Each question has exactly 4 options (A, B, C, D) with ONE correct answer
- Provide a short English explanation for the correct answer

Format as JSON:
{
  "questions": [
    {
      "question": "Choose the correct ${language} form for ...",
      "options": [
        "A) ...",
        "B) ...",
        "C) ...",
        "D) ..."
      ],
      "correct_answer": "A",
      "explanation": "Brief grammar explanation in English",
      "difficulty_level": ${level === 'beginner' ? 1 : level === 'elementary' ? 2 : level === 'intermediate' ? 3 : level === 'upper-intermediate' ? 4 : 5}
    }
  ]
}`
,

    hint: `Create a short, clear hint (max 12 words) for a hangman word for ${level} ${language} learners.

Requirements:
- IMPORTANT: Output strictly in English
- Do NOT include the target word or any direct substring of it
- Keep it generic but helpful (category, synonym, definition, or context)
- Maximum 12 words

Context:
${topic}

Format as JSON:
{
  "hint": "Short hint in English (<= 12 words, no quotes, no code)"
}`
  } as Record<string, string>;

  return prompts[contentType as keyof typeof prompts] || '';
};

export async function POST(request: Request) {
  try {
    const { contentType, aiProvider, language, level, topic, quantity } = await request.json();

    if (!contentType || !aiProvider || (contentType !== 'hint' && !topic)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Handle image generation separately
    if (contentType === 'image') {
      if (aiProvider !== 'gpt5') {
        return NextResponse.json(
          { error: 'Image generation currently supported with GPT-5 only' },
          { status: 400 }
        );
      }
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }

      // Compose image prompt using blueprint reference
      const userPrompt = topic as string;
      // Reference image hosted publicly (exact URL as requested)
      const referenceUrl = 'https://www.lingoletics.com/lingoletics-team.png';

      try {
        const model = process.env.OPENAI_GPT5_IMAGE_MODEL || 'gpt-image-1';
        // Try image edit (image-to-image) first using blueprint file
        const blueprintPath = path.join(process.cwd(), 'public', 'lingoletics-team.png');
        const blueprintExists = fs.existsSync(blueprintPath);
        if (blueprintExists && (openai as any).images?.edits) {
          try {
            const imageBuffer = fs.readFileSync(blueprintPath);
            const blob = new Blob([imageBuffer], { type: 'image/png' });
            // @ts-ignore - SDK typing for edits may vary by version
            console.log('[AI][image.edit] model:', model, 'size:', '1024x1024');
            const edited = await (openai as any).images.edits({
              model,
              image: blob,
              prompt: `this is our team blueprint ${referenceUrl} . please use these characters to build the new image and show this team in the following setup: ${userPrompt}. Keep character identities, outfits, and general style consistent with the blueprint.`,
              size: '1024x1024'
            });
            const b64 = edited.data?.[0]?.b64_json;
            if (b64) {
              const preview = `data:image/png;base64,${b64}`;
              const usedPrompt = `this is our team blueprint ${referenceUrl} . please use these characters to build the new image and show this team in the following setup: ${userPrompt}. Keep character identities, outfits, and general style consistent with the blueprint.`;
              return NextResponse.json({ type: 'image', data: { base64: b64, referenceUrl }, preview, aiProvider, usedPrompt });
            }
          } catch (editErr: any) {
            console.warn('Image edit failed, falling back to text-only generation:', editErr?.message || editErr);
          }
        }

        // Fallback: text-only generation with reference mention
        console.log('[AI][image.generate] model:', model, 'size:', '1024x1024');
        const img = await openai.images.generate({
          model,
          prompt: `this is our team blueprint ${referenceUrl} . please use these characters to build the new image and show this team in the following setup: ${userPrompt}. Keep character identities, outfits, and general style consistent with the blueprint.`,
          size: '1024x1024'
        });

        const b64 = img.data?.[0]?.b64_json;
        if (!b64) {
          return NextResponse.json({ error: 'No image returned from model' }, { status: 500 });
        }
        const preview = `data:image/png;base64,${b64}`;
        const usedPrompt = `this is our team blueprint ${referenceUrl} . please use these characters to build the new image and show this team in the following setup: ${userPrompt}. Keep character identities, outfits, and general style consistent with the blueprint.`;

        return NextResponse.json({
          type: 'image',
          data: { base64: b64, referenceUrl },
          preview,
          aiProvider,
          usedPrompt
        });
      } catch (err: any) {
        console.error('OpenAI image generation error (GPT-5 image):', err?.response?.data || err?.message || err);
        const message = err?.response?.data || err?.message || 'Unknown error';
        return NextResponse.json({ error: `Failed to generate image with GPT-5: ${message}` }, { status: 500 });
      }
    }

    const prompt = getPrompt(contentType, language, level, topic || '', quantity || 1);
    
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
    else if (aiProvider === 'gpt5') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }

      const gpt5Model = process.env.OPENAI_GPT5_MODEL || 'gpt-5';
      try {
        const completion = await openai.chat.completions.create({
          model: gpt5Model,
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
      } catch (err: any) {
        // Attempt fallback model if configured or default to gpt-4o
        const fallbackModel = process.env.OPENAI_GPT5_FALLBACK || 'gpt-4o';
        try {
          const completion = await openai.chat.completions.create({
            model: fallbackModel,
            messages: [
              { role: 'system', content: 'You are an expert language teacher and educational content creator. Always respond with valid JSON in the exact format requested.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          });
          rawResponse = completion.choices[0]?.message?.content || '';
        } catch (fallbackErr: any) {
          console.error('OpenAI GPT-5 error:', err?.response?.data || err?.message || err);
          console.error('OpenAI fallback error:', fallbackErr?.response?.data || fallbackErr?.message || fallbackErr);
          const message = err?.response?.data?.error?.message || err?.message || 'Unknown error';
          const fbMessage = fallbackErr?.response?.data?.error?.message || fallbackErr?.message || 'Unknown error';
          return NextResponse.json(
            { error: `GPT-5 request failed: ${message}. Fallback to ${fallbackModel} also failed: ${fbMessage}. You can set OPENAI_GPT5_MODEL/OPENAI_GPT5_FALLBACK to accessible models.` },
            { status: 500 }
          );
        }
      }
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

    // Normalize vocabulary to ensure articles are included for DE/FR/ES
    const langLower = (language || '').toLowerCase();
    const isGerman = langLower === 'german' || langLower === 'de' || langLower === 'deutsch';
    const isFrench = langLower === 'french' || langLower === 'fr' || langLower === 'français' || langLower === 'francais';
    const isSpanish = langLower === 'spanish' || langLower === 'es' || langLower === 'español' || langLower === 'espanol';
    if (contentType === 'vocabulary' && Array.isArray(generatedContent?.words)) {
      generatedContent.words = generatedContent.words.map((w: any) => {
        if (isGerman) {
          const germanKey = ['word_german', 'word_German', 'german_word', 'word_de'].find(k => typeof w?.[k] === 'string');
          let germanWord: string = germanKey ? w[germanKey] : '';
          const articleRaw: string = (w.article || w.german_article || '').toString().trim();
          const articleFromRaw = ['der','die','das'].includes(articleRaw.toLowerCase()) ? articleRaw.toLowerCase() : '';
          // Strip any leading article (with or without space), e.g., "dasSegelboot", "der Hafen"
          const leadingMatch = germanWord.match(/^(der|die|das)(?:\s+)?/i);
          if (leadingMatch) {
            germanWord = germanWord.replace(/^(der|die|das)(?:\s+)?/i, '');
          }
          const finalArticle = articleFromRaw || (leadingMatch ? leadingMatch[1].toLowerCase() : '');
          const finalWord = finalArticle ? `${finalArticle} ${germanWord}`.trim() : germanWord.trim();
          w.word_german = finalWord || w.word_german || w.word_German || w.german_word || w.word_de;
          w.article = finalArticle;
          if (germanKey && germanKey !== 'word_german') delete w[germanKey];
        } else if (isFrench) {
          const frenchKey = ['word_french', 'word_French', 'french_word', 'word_fr'].find(k => typeof w?.[k] === 'string');
          let frenchWord: string = frenchKey ? w[frenchKey] : '';
          const articleRaw: string = (w.article || w.french_article || '').toString().trim();
          const articleLc = articleRaw.toLowerCase();
          const isAllowed = ['le','la','les', "l'", 'l’'].includes(articleLc);
          // Normalize fancy apostrophe to straight for consistency
          const normalizedFromRaw = articleLc === 'l’' ? "l'" : (isAllowed ? articleLc : '');
          // Strip any existing leading article (with or without space) or l'
          let leading = frenchWord.match(/^(le|la|les)(?:\s+)?/i);
          if (leading) {
            frenchWord = frenchWord.replace(/^(le|la|les)(?:\s+)?/i, '');
          } else if (/^l['’]/i.test(frenchWord)) {
            leading = ["l'"] as any;
            frenchWord = frenchWord.replace(/^l['’]/i, '');
          }
          const finalArticle = normalizedFromRaw || (leading ? ((leading[0] as string).toLowerCase().startsWith('l') ? "l'" : (leading[1] ? (leading[1] as string).toLowerCase() : (leading[0] as string).trim().toLowerCase())) : '');
          const finalWord = finalArticle ? (finalArticle === "l'" ? `${finalArticle}${frenchWord}` : `${finalArticle} ${frenchWord}`) : frenchWord;
          w.word_french = finalWord || w.word_french || w.word_French || w.french_word || w.word_fr;
          w.article = finalArticle;
          if (frenchKey && frenchKey !== 'word_french') delete w[frenchKey];
        } else if (isSpanish) {
          const spanishKey = ['word_spanish', 'word_Spanish', 'spanish_word', 'word_es'].find(k => typeof w?.[k] === 'string');
          let spanishWord: string = spanishKey ? w[spanishKey] : '';
          const articleRaw: string = (w.article || w.spanish_article || '').toString().trim();
          const articleFromRaw = ['el','la','los','las'].includes(articleRaw.toLowerCase()) ? articleRaw.toLowerCase() : '';
          // Strip any existing article with or without space
          const leadingMatch = spanishWord.match(/^(el|la|los|las)(?:\s+)?/i);
          if (leadingMatch) {
            spanishWord = spanishWord.replace(/^(el|la|los|las)(?:\s+)?/i, '');
          }
          const finalArticle = articleFromRaw || (leadingMatch ? leadingMatch[1].toLowerCase() : '');
          const finalWord = finalArticle ? `${finalArticle} ${spanishWord}`.trim() : spanishWord.trim();
          w.word_spanish = finalWord || w.word_spanish || w.word_Spanish || w.spanish_word || w.word_es;
          w.article = finalArticle;
          if (spanishKey && spanishKey !== 'word_spanish') delete w[spanishKey];
        }
        return w;
      });
    }

    // Normalize hint minimal structure
    if (contentType === 'hint' && typeof generatedContent?.hint === 'string') {
      // preview is the hint itself
      return NextResponse.json({ type: contentType, data: generatedContent, preview: generatedContent.hint, aiProvider });
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
      // Now grammar is multiple-choice styled like quizzes
      return data.questions?.map((q: any, i: number) => 
        `${i + 1}. ${q.question}\n${q.options?.join('\n')}\nCorrect: ${q.correct_answer}\n`
      ).join('\n') || 'No questions generated';

    case 'cultural':
      return data.cultural_information || 'No cultural information generated';

    default:
      return JSON.stringify(data, null, 2);
  }
}