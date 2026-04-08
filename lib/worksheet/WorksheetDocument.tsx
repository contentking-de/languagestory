import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { WorksheetData, WorksheetQuiz } from './types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
  },
  title: { fontSize: 16, fontFamily: 'Helvetica', fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 9, color: '#444', marginBottom: 16 },
  metaRow: { fontSize: 9, marginBottom: 3 },
  metaLabel: { fontFamily: 'Helvetica', fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  blockTitle: { fontSize: 10, fontFamily: 'Helvetica', fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  body: { marginBottom: 8, textAlign: 'justify' },
  quizTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  question: { marginBottom: 10 },
  questionNum: { fontFamily: 'Helvetica', fontWeight: 'bold' },
  option: { marginLeft: 10, marginTop: 2 },
  tfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 4,
  },
  tfChoiceSecond: {
    marginLeft: 28,
  },
  tfChoice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** Drawn box — avoids □ (U+25A1) which PDF Helvetica maps to wrong glyphs (e.g. ¡). */
  checkbox: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: '#111',
    marginRight: 5,
  },
  tfLabel: { fontSize: 10, fontFamily: 'Helvetica' },
  /** Extra bottom padding when logo is shown so body text rarely collides. */
  pageWithLogo: { paddingBottom: 58 },
  logoFooter: {
    position: 'absolute',
    bottom: 20,
    right: 36,
  },
  logoImage: {
    width: 88,
    height: 28,
    objectFit: 'contain',
  },
  worksheetIconRow: {
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  worksheetIcon: {
    width: 56,
    height: 56,
    objectFit: 'contain',
  },
  gapPassageLine: { marginBottom: 6, textAlign: 'left' },
  wordBankTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  wordBankLine: { fontSize: 10, lineHeight: 1.5 },
});

/** Gap-fill or True/False-only quizzes: keep on one shared page chunk (wrap=false). */
function isTrueFalseOrGapWorksheetQuiz(quiz: WorksheetQuiz): boolean {
  if (quiz.gapFill) return true;
  if (quiz.quizType === 'true_false') return true;
  if (
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => q.questionType === 'true_false')
  ) {
    return true;
  }
  return false;
}

type QuizPdfChunk =
  | { kind: 'normal'; quiz: WorksheetQuiz }
  | { kind: 'tfGap'; quizzes: WorksheetQuiz[] };

function chunkQuizzesForPdf(quizzes: WorksheetQuiz[]): QuizPdfChunk[] {
  const out: QuizPdfChunk[] = [];
  let buf: WorksheetQuiz[] = [];
  const flushTfGap = () => {
    if (buf.length) {
      out.push({ kind: 'tfGap', quizzes: [...buf] });
      buf = [];
    }
  };
  for (const q of quizzes) {
    if (isTrueFalseOrGapWorksheetQuiz(q)) buf.push(q);
    else {
      flushTfGap();
      out.push({ kind: 'normal', quiz: q });
    }
  }
  flushTfGap();
  return out;
}

function WorksheetQuizBlock({ quiz, titleMarginTop }: { quiz: WorksheetQuiz; titleMarginTop: number }) {
  const keepTogether = isTrueFalseOrGapWorksheetQuiz(quiz);
  return (
    <View wrap={keepTogether ? false : undefined}>
      <Text style={[styles.quizTitle, { marginTop: titleMarginTop }]}>{quiz.title}</Text>
      {quiz.gapFill ? (
        <View style={{ marginTop: 4 }}>
          {quiz.gapFill.passage
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, li) => (
              <Text key={li} style={styles.gapPassageLine}>
                {line}
              </Text>
            ))}
          {quiz.gapFill.words.length > 0 ? (
            <>
              <Text style={styles.wordBankTitle}>Word bank</Text>
              <Text style={styles.wordBankLine}>{quiz.gapFill.words.join('   ·   ')}</Text>
            </>
          ) : null}
        </View>
      ) : (
        quiz.questions.map((q, i) => (
          <QuestionPdf
            key={i}
            index={i + 1}
            questionText={q.questionText}
            questionType={q.questionType}
            options={q.options}
          />
        ))
      )}
    </View>
  );
}

function QuestionPdf({
  index,
  questionText,
  questionType,
  options,
}: {
  index: number;
  questionText: string;
  questionType: string;
  options: string[];
}) {
  const t = questionType;
  const isMc =
    t === 'multiple_choice' ||
    (options.length > 0 && (t === 'comprehension' || t === 'vocabulary' || t === 'grammar'));

  return (
    <View style={styles.question}>
      <Text style={styles.questionNum}>
        {index}. {questionText || '(No question text)'}
      </Text>
      {isMc && options.length > 0 ? (
        options.map((opt, i) => (
          <Text key={i} style={styles.option}>
            {String.fromCharCode(65 + i)}) {opt}
          </Text>
        ))
      ) : t === 'true_false' ? (
        <View style={styles.tfRow}>
          <View style={styles.tfChoice}>
            <View style={styles.checkbox} />
            <Text style={styles.tfLabel}>True</Text>
          </View>
          <View style={[styles.tfChoice, styles.tfChoiceSecond]}>
            <View style={styles.checkbox} />
            <Text style={styles.tfLabel}>False</Text>
          </View>
        </View>
      ) : t === 'fill_blank' || t === 'gap_fill' || t === 'short_answer' ? (
        <View style={{ marginTop: 6 }}>
          <Text>_______________________________</Text>
          <Text style={{ marginTop: 4 }}>_______________________________</Text>
        </View>
      ) : t === 'matching' || t === 'ordering' ? (
        <View style={{ marginTop: 6 }}>
          {options.length > 0 ? (
            options.map((opt, i) => (
              <Text key={i} style={styles.option}>
                {i + 1}. {opt}
              </Text>
            ))
          ) : null}
          <Text style={{ marginTop: 6 }}>Answer / order: _______________________________</Text>
        </View>
      ) : options.length > 0 ? (
        options.map((opt, i) => (
          <Text key={i} style={styles.option}>
            {String.fromCharCode(65 + i)}) {opt}
          </Text>
        ))
      ) : (
        <View style={{ marginTop: 6 }}>
          <Text>_______________________________</Text>
        </View>
      )}
    </View>
  );
}

export function WorksheetDocument({
  data,
  logoSrc,
  worksheetIconSrc,
}: {
  data: WorksheetData;
  /** Data URI (e.g. PNG) — rendered bottom-right on every page when set */
  logoSrc?: string | null;
  /** Data URI for `public/worksheet.png` — shown at the top of the first page */
  worksheetIconSrc?: string | null;
}) {
  const pageStyle = logoSrc ? [styles.page, styles.pageWithLogo] : styles.page;
  const hasStories = data.storySections.length > 0;
  const hasCulture = data.culturalBlocks.length > 0;
  const hasNarrativePage = hasStories || hasCulture;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        {logoSrc ? (
          <View style={styles.logoFooter} fixed>
            <Image src={logoSrc} style={styles.logoImage} />
          </View>
        ) : null}
        {worksheetIconSrc ? (
          <View style={styles.worksheetIconRow}>
            <Image src={worksheetIconSrc} style={styles.worksheetIcon} />
          </View>
        ) : null}
        <Text style={styles.title}>Worksheet</Text>
        <Text style={styles.subtitle}>
          For classroom use · answer key not included · games from the lesson are not on this sheet
        </Text>

        <Text style={styles.metaRow}>
          <Text style={styles.metaLabel}>Lesson: </Text>
          {data.lessonTitle}
        </Text>
        <Text style={styles.metaRow}>
          <Text style={styles.metaLabel}>Course: </Text>
          {data.courseTitle}
        </Text>
        <Text style={styles.metaRow}>
          <Text style={styles.metaLabel}>Language: </Text>
          {data.languageLabel}
        </Text>
        <Text style={styles.metaRow}>
          <Text style={styles.metaLabel}>Level: </Text>
          {data.levelLabel}
        </Text>

        {hasNarrativePage ? (
          <>
            <Text break style={{ fontSize: 0 }}>
              {' '}
            </Text>
            <View wrap={false}>
              {hasStories ? (
                <>
                  <Text style={styles.sectionTitle}>Texts / stories</Text>
                  {data.storySections.map((sec, si) => (
                    <View key={si}>
                      <Text style={styles.blockTitle}>{sec.heading}</Text>
                      {sec.blocks.map((b, bi) => (
                        <View key={bi}>
                          {b.title ? <Text style={styles.blockTitle}>{b.title}</Text> : null}
                          {b.body ? <Text style={styles.body}>{b.body}</Text> : null}
                        </View>
                      ))}
                    </View>
                  ))}
                </>
              ) : null}
              {hasCulture ? (
                <>
                  <Text
                    style={[
                      styles.sectionTitle,
                      hasStories ? { marginTop: 12 } : {},
                    ]}
                  >
                    Culture
                  </Text>
                  {data.culturalBlocks.map((c, ci) => (
                    <View key={ci}>
                      <Text style={styles.blockTitle}>{c.heading}</Text>
                      <Text style={styles.body}>{c.body}</Text>
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          </>
        ) : null}

        {data.quizzes.length > 0 ? (
          <>
            {!hasNarrativePage ? (
              <Text break style={{ fontSize: 0 }}>
                {' '}
              </Text>
            ) : null}
            <Text style={styles.sectionTitle}>Quizzes</Text>
            {chunkQuizzesForPdf(data.quizzes).map((chunk, ci) =>
              chunk.kind === 'tfGap' ? (
                <View key={`tg-${ci}`} wrap={false} break={ci > 0}>
                  {chunk.quizzes.map((quiz, qi) => (
                    <WorksheetQuizBlock
                      key={qi}
                      quiz={quiz}
                      titleMarginTop={qi === 0 ? 4 : 16}
                    />
                  ))}
                </View>
              ) : (
                <View key={`n-${ci}`} break={ci > 0}>
                  <WorksheetQuizBlock quiz={chunk.quiz} titleMarginTop={12} />
                </View>
              )
            )}
          </>
        ) : (
          <Text style={{ marginTop: 16, fontSize: 9, color: '#666' }}>
            No quiz questions are linked to this lesson.
          </Text>
        )}
      </Page>
    </Document>
  );
}
