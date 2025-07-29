import { db } from './drizzle';
import { 
  users, 
  courses, 
  lessons, 
  topics, 
  quizzes, 
  quiz_questions,
  institutions,
  vocabulary,
  cultural_content
} from './schema';
import { 
  WordPressXMLParser, 
  ParsedCourse, 
  ParsedLesson, 
  ParsedTopic, 
  ParsedQuiz, 
  ParsedQuestion,
  WPAuthor,
  WPGroup
} from './xml-parser';
import { eq } from 'drizzle-orm';

interface MigrationStats {
  coursesImported: number;
  lessonsImported: number;
  topicsImported: number;
  quizzesImported: number;
  questionsImported: number;
  institutionsImported: number;
  usersImported: number;
  vocabularyImported: number;
  errors: string[];
}

interface CourseMapping {
  wpId: number;
  newId: number;
  language: string;
}

interface LessonMapping {
  wpId: number;
  newId: number;
  courseId: number;
}

interface TopicMapping {
  wpId: number;
  newId: number;
  lessonId: number;
}

export class ContentMigration {
  private parser: WordPressXMLParser;
  private stats: MigrationStats;
  private courseMapping: Map<number, CourseMapping> = new Map();
  private lessonMapping: Map<number, LessonMapping> = new Map();
  private topicMapping: Map<number, TopicMapping> = new Map();
  private userMapping: Map<string, number> = new Map(); // email -> user_id
  private defaultUserId: number = 1; // Fallback user ID

  constructor() {
    this.parser = new WordPressXMLParser();
    this.stats = {
      coursesImported: 0,
      lessonsImported: 0,
      topicsImported: 0,
      quizzesImported: 0,
      questionsImported: 0,
      institutionsImported: 0,
      usersImported: 0,
      vocabularyImported: 0,
      errors: []
    };
  }

  async runMigration(xmlFilePath: string): Promise<MigrationStats> {
    console.log('🚀 Starting comprehensive content migration...');
    
    try {
      // Step 1: Parse XML file
      await this.parser.parseXMLFile(xmlFilePath);
      
      // Step 2: Migrate institutions (school groups)
      await this.migrateInstitutions();
      
      // Step 3: Migrate/map authors to users
      await this.migrateAuthors();
      
      // Step 4: Migrate courses
      await this.migrateCourses();
      
      // Step 5: Migrate lessons
      await this.migrateLessons();
      
      // Step 6: Migrate topics
      await this.migrateTopics();
      
      // Step 7: Migrate quizzes and questions
      await this.migrateQuizzes();
      
      // Step 8: Extract and migrate vocabulary
      await this.migrateVocabulary();
      
      // Step 9: Generate cultural content
      await this.migrateCulturalContent();
      
      console.log('✅ Migration completed successfully!');
      this.printMigrationSummary();
      
      return this.stats;
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.stats.errors.push(`Migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateInstitutions(): Promise<void> {
    console.log('🏫 Migrating institutions...');
    
    const groups = this.parser.getGroups();
    
    for (const [wpId, group] of groups) {
      try {
        // Extract institution type from group title
        const institutionType = this.extractInstitutionType(group.title);
        
        // Check if institution already exists
        const existingInstitution = await db
          .select()
          .from(institutions)
          .where(eq(institutions.name, group.title))
          .limit(1);
        
        if (existingInstitution.length === 0) {
          const [newInstitution] = await db
            .insert(institutions)
            .values({
              name: group.title,
              type: institutionType,
              isActive: group.status === 'publish',
            })
            .returning();
          
          this.stats.institutionsImported++;
          console.log(`✅ Created institution: ${group.title}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating institution ${group.title}:`, error);
        this.stats.errors.push(`Institution migration error: ${group.title} - ${error}`);
      }
    }
  }

  private async migrateAuthors(): Promise<void> {
    console.log('👥 Migrating authors...');
    
    const authors = this.parser.getAuthors();
    
    for (const [wpId, author] of authors) {
      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, author.email))
          .limit(1);
        
        if (existingUser.length > 0) {
          this.userMapping.set(author.email, existingUser[0].id);
        } else if (author.email && author.email.includes('@')) {
          // Create new user account for content authors
          const [newUser] = await db
            .insert(users)
            .values({
              name: author.displayName || `${author.firstName} ${author.lastName}`.trim(),
              email: author.email,
              passwordHash: 'temp_hash_to_be_reset', // They'll need to reset password
              role: 'content_creator', // Most WordPress authors become content creators
            })
            .returning();
          
          this.userMapping.set(author.email, newUser.id);
          this.stats.usersImported++;
          console.log(`✅ Created user: ${author.displayName} (${author.email})`);
        }
      } catch (error) {
        console.error(`❌ Error migrating author ${author.displayName}:`, error);
        this.stats.errors.push(`Author migration error: ${author.displayName} - ${error}`);
      }
    }
  }

  private async migrateCourses(): Promise<void> {
    console.log('📚 Migrating courses...');
    
    const parsedCourses = this.parser.getCourses();
    
    for (const [wpId, course] of parsedCourses) {
      try {
        const createdBy = this.getUserId(course.author);
        
        const [newCourse] = await db
          .insert(courses)
          .values({
            title: course.title,
            slug: this.generateSlug(course.slug || course.title),
            description: this.cleanDescription(course.description),
            language: course.language,
            level: course.level as 'beginner' | 'intermediate' | 'advanced',
            created_by: createdBy,
            is_published: course.status === 'publish',
            course_order: this.extractCourseOrder(course.title),
            estimated_duration: this.estimateCourseDuration(course),
            total_lessons: course.lessons.length,
            total_points: course.lessons.length * 50, // Rough estimate
            wp_course_id: wpId,
          })
          .returning();
        
        this.courseMapping.set(wpId, {
          wpId,
          newId: newCourse.id,
          language: course.language
        });
        
        this.stats.coursesImported++;
        console.log(`✅ Migrated course: ${course.title} (${course.language})`);
        
      } catch (error) {
        console.error(`❌ Error migrating course ${course.title}:`, error);
        this.stats.errors.push(`Course migration error: ${course.title} - ${error}`);
      }
    }
  }

  private async migrateLessons(): Promise<void> {
    console.log('📖 Migrating lessons...');
    
    const parsedLessons = this.parser.getLessons();
    
    for (const [wpId, lesson] of parsedLessons) {
      try {
        const courseMapping = this.courseMapping.get(lesson.courseId);
        if (!courseMapping) {
          console.warn(`⚠️ No course found for lesson ${lesson.title}, skipping...`);
          continue;
        }
        
        const [newLesson] = await db
          .insert(lessons)
          .values({
            course_id: courseMapping.newId,
            title: lesson.title,
            slug: this.generateSlug(lesson.slug || lesson.title),
            description: this.cleanDescription(lesson.description),
            content: lesson.content,
            lesson_type: lesson.lessonType as 'story' | 'game' | 'vocabulary' | 'grammar' | 'culture' | 'assessment',
            lesson_order: this.extractLessonOrder(lesson.title),
            estimated_duration: this.estimateLessonDuration(lesson),
            points_value: 50, // Default points per lesson
            is_published: lesson.status === 'publish',
            wp_lesson_id: wpId,
          })
          .returning();
        
        this.lessonMapping.set(wpId, {
          wpId,
          newId: newLesson.id,
          courseId: courseMapping.newId
        });
        
        this.stats.lessonsImported++;
        console.log(`✅ Migrated lesson: ${lesson.title}`);
        
      } catch (error) {
        console.error(`❌ Error migrating lesson ${lesson.title}:`, error);
        this.stats.errors.push(`Lesson migration error: ${lesson.title} - ${error}`);
      }
    }
  }

  private async migrateTopics(): Promise<void> {
    console.log('📝 Migrating topics...');
    
    const parsedTopics = this.parser.getTopics();
    
    for (const [wpId, topic] of parsedTopics) {
      try {
        const lessonMapping = this.lessonMapping.get(topic.lessonId);
        if (!lessonMapping) {
          console.warn(`⚠️ No lesson found for topic ${topic.title}, skipping...`);
          continue;
        }
        
        const [newTopic] = await db
          .insert(topics)
          .values({
            lesson_id: lessonMapping.newId,
            title: topic.title,
            slug: this.generateSlug(topic.slug || topic.title),
            content: topic.content,
            topic_type: topic.topicType as any,
            topic_order: this.extractTopicOrder(topic.title),
            difficulty_level: this.extractDifficultyLevel(topic.title, topic.content),
            points_value: this.calculateTopicPoints(topic.topicType),
            time_limit: this.extractTimeLimit(topic.metaData),
            is_published: topic.status === 'publish',
            interactive_data: topic.interactiveData,
            wp_topic_id: wpId,
          })
          .returning();
        
        this.topicMapping.set(wpId, {
          wpId,
          newId: newTopic.id,
          lessonId: lessonMapping.newId
        });
        
        this.stats.topicsImported++;
        
        // Log progress every 100 topics
        if (this.stats.topicsImported % 100 === 0) {
          console.log(`📝 Migrated ${this.stats.topicsImported} topics...`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating topic ${topic.title}:`, error);
        this.stats.errors.push(`Topic migration error: ${topic.title} - ${error}`);
      }
    }
  }

  private async migrateQuizzes(): Promise<void> {
    console.log('❓ Migrating quizzes and questions...');
    
    const parsedQuizzes = this.parser.getQuizzes();
    const parsedQuestions = this.parser.getQuestions();
    
    for (const [wpId, quiz] of parsedQuizzes) {
      try {
        const lessonMapping = quiz.lessonId ? this.lessonMapping.get(quiz.lessonId) : null;
        const topicMapping = quiz.topicId ? this.topicMapping.get(quiz.topicId) : null;
        
        const [newQuiz] = await db
          .insert(quizzes)
          .values({
            lesson_id: lessonMapping?.newId,
            topic_id: topicMapping?.newId,
            title: quiz.title,
            description: quiz.description,
            quiz_type: quiz.quizType as 'comprehension' | 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'writing',
            pass_percentage: 70, // Default
            time_limit: this.extractQuizTimeLimit(quiz.metaData),
            max_attempts: 3, // Default
            points_value: 25, // Default
            is_published: quiz.status === 'publish',
            wp_quiz_id: wpId,
          })
          .returning();
        
        // Migrate associated questions
        for (const questionId of quiz.questions) {
          const question = parsedQuestions.get(questionId);
          if (question) {
            await db
              .insert(quiz_questions)
              .values({
                quiz_id: newQuiz.id,
                question_text: question.questionText,
                question_type: question.questionType as any,
                correct_answer: question.correctAnswer,
                answer_options: question.answerOptions,
                explanation: question.explanation,
                points: question.points,
                question_order: 0, // Will need to be set properly
                wp_question_id: question.wpId,
              });
            
            this.stats.questionsImported++;
          }
        }
        
        this.stats.quizzesImported++;
        console.log(`✅ Migrated quiz: ${quiz.title} with ${quiz.questions.length} questions`);
        
      } catch (error) {
        console.error(`❌ Error migrating quiz ${quiz.title}:`, error);
        this.stats.errors.push(`Quiz migration error: ${quiz.title} - ${error}`);
      }
    }
  }

  private async migrateVocabulary(): Promise<void> {
    console.log('📚 Extracting vocabulary from content...');
    
    // Extract vocabulary from lesson and topic content
    const parsedLessons = this.parser.getLessons();
    const parsedTopics = this.parser.getTopics();
    
    for (const [wpId, lesson] of parsedLessons) {
      try {
        const lessonMapping = this.lessonMapping.get(wpId);
        if (!lessonMapping) continue;
        
        const vocabularyWords = this.extractVocabularyFromContent(lesson.content, lesson.title);
        
        for (const word of vocabularyWords) {
          await db
            .insert(vocabulary)
            .values({
              ...word,
              lesson_id: lessonMapping.newId,
              difficulty_level: 1, // Default
            });
          
          this.stats.vocabularyImported++;
        }
        
      } catch (error) {
        console.error(`❌ Error extracting vocabulary from lesson ${lesson.title}:`, error);
      }
    }
  }

  private async migrateCulturalContent(): Promise<void> {
    console.log('🌍 Creating cultural content entries...');
    
    const parsedLessons = this.parser.getLessons();
    
    for (const [wpId, lesson] of parsedLessons) {
      try {
        const lessonMapping = this.lessonMapping.get(wpId);
        if (!lessonMapping) continue;
        
        const courseMapping = this.courseMapping.get(lesson.courseId);
        if (!courseMapping) continue;
        
        // Generate cultural content based on lesson themes
        const culturalEntries = this.generateCulturalContent(lesson, courseMapping.language);
        
        for (const cultural of culturalEntries) {
          await db
            .insert(cultural_content)
            .values({
              lesson_id: lessonMapping.newId,
              title: cultural.title,
              description: cultural.description,
              content: cultural.content,
              culture_type: cultural.culture_type as any,
              language: courseMapping.language,
              country: this.getCountryForLanguage(courseMapping.language),
              is_published: true,
            });
        }
        
      } catch (error) {
        console.error(`❌ Error creating cultural content for lesson ${lesson.title}:`, error);
      }
    }
  }

  // Helper methods
  private getUserId(authorEmail: string): number {
    return this.userMapping.get(authorEmail) || this.defaultUserId;
  }

  private generateSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private cleanDescription(description: string): string {
    // Remove HTML tags and clean up description
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limit length
  }

  private extractInstitutionType(title: string): 'school' | 'university' | 'language_center' | 'private_tutor' | 'corporate' {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('university') || lowerTitle.includes('college')) return 'university';
    if (lowerTitle.includes('school')) return 'school';
    if (lowerTitle.includes('center') || lowerTitle.includes('centre')) return 'language_center';
    if (lowerTitle.includes('tutor')) return 'private_tutor';
    if (lowerTitle.includes('corporate') || lowerTitle.includes('business')) return 'corporate';
    return 'school'; // Default
  }

  private extractCourseOrder(title: string): number {
    // Extract order from title patterns like "Course 1", "Level 2", etc.
    const match = title.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractLessonOrder(title: string): number {
    // Extract order from lesson titles
    const match = title.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractTopicOrder(title: string): number {
    // Extract order from topic titles
    const pageMatch = title.match(/page\s*(\d+)/i);
    if (pageMatch) return parseInt(pageMatch[1]);
    
    const generalMatch = title.match(/(\d+)/);
    return generalMatch ? parseInt(generalMatch[1]) : 0;
  }

  private estimateCourseDuration(course: ParsedCourse): number {
    // Estimate total course duration based on lessons
    return course.lessons.length * 30; // 30 minutes per lesson estimate
  }

  private estimateLessonDuration(lesson: ParsedLesson): number {
    // Estimate lesson duration based on content length and type
    const contentLength = lesson.content.length;
    const baseTime = lesson.lessonType === 'game' ? 15 : 30;
    return baseTime + Math.floor(contentLength / 1000) * 2; // 2 minutes per 1000 characters
  }

  private extractDifficultyLevel(title: string, content: string): number {
    // Determine difficulty based on title and content complexity
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('beginner') || lowerTitle.includes('basic')) return 1;
    if (lowerTitle.includes('intermediate') || lowerTitle.includes('medium')) return 3;
    if (lowerTitle.includes('advanced') || lowerTitle.includes('expert')) return 5;
    
    // Estimate based on content length and complexity
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) return 1;
    if (wordCount < 300) return 2;
    if (wordCount < 500) return 3;
    if (wordCount < 800) return 4;
    return 5;
  }

  private calculateTopicPoints(topicType: string): number {
    const pointValues: { [key: string]: number } = {
      'story_page': 5,
      'comprehension_quiz': 15,
      'listening_gap_fill': 10,
      'vocabulary_game': 10,
      'anagram': 8,
      'matching_pairs': 8,
      'find_the_match': 8,
      'cultural_note': 5,
      'grammar_exercise': 12,
    };
    
    return pointValues[topicType] || 10;
  }

  private extractTimeLimit(metaData: any): number | null {
    const timeLimit = metaData['time_limit'] || metaData['_time_limit'];
    return timeLimit ? parseInt(timeLimit) : null;
  }

  private extractQuizTimeLimit(metaData: any): number | null {
    const timeLimit = metaData['quiz_time_limit'] || metaData['_quiz_time_limit'];
    return timeLimit ? parseInt(timeLimit) : null;
  }

  private extractVocabularyFromContent(content: string, title: string): any[] {
    // This is a simplified vocabulary extraction
    // In a real implementation, you'd use NLP libraries to extract vocabulary
    const words: any[] = [];
    
    // Extract words that appear to be vocabulary (simplified approach)
    const vocabPattern = /\b[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇßäöüÄÖÜáéíóúñÁÉÍÓÚÑ]+\b/g;
    const matches = content.match(vocabPattern) || [];
    
    // Take unique words and create vocabulary entries
    const uniqueWords = [...new Set(matches)].slice(0, 10); // Limit to avoid too many entries
    
    uniqueWords.forEach(word => {
      if (word.length > 3 && word.length < 20) { // Reasonable word length
        const vocabEntry: any = {
          word_english: word, // This would need proper translation in real implementation
          context_sentence: content.substring(0, 200), // First 200 chars as context
        };
        
        // Set language-specific word based on course language
        const language = this.extractLanguageFromTitle(title);
        if (language === 'french') vocabEntry.word_french = word;
        else if (language === 'german') vocabEntry.word_german = word;
        else if (language === 'spanish') vocabEntry.word_spanish = word;
        
        words.push(vocabEntry);
      }
    });
    
    return words;
  }

  private extractLanguageFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('french')) return 'french';
    if (lowerTitle.includes('german')) return 'german';
    if (lowerTitle.includes('spanish')) return 'spanish';
    return 'french'; // Default
  }

  private generateCulturalContent(lesson: ParsedLesson, language: string): any[] {
    const culturalEntries: any[] = [];
    
    // Generate cultural content based on lesson themes
    const themes = this.extractThemesFromLesson(lesson);
    
    themes.forEach(theme => {
      const cultural = {
        title: `Cultural Context: ${theme}`,
        description: `Learn about ${theme} in ${language} culture`,
        content: `Cultural information about ${theme} would be generated here based on the lesson content.`,
        culture_type: this.mapThemeToCultureType(theme),
      };
      
      culturalEntries.push(cultural);
    });
    
    return culturalEntries;
  }

  private extractThemesFromLesson(lesson: ParsedLesson): string[] {
    const themes: string[] = [];
    const lowerTitle = lesson.title.toLowerCase();
    
    // Common themes in language learning
    if (lowerTitle.includes('food') || lowerTitle.includes('restaurant')) themes.push('Food & Dining');
    if (lowerTitle.includes('family')) themes.push('Family');
    if (lowerTitle.includes('school')) themes.push('Education');
    if (lowerTitle.includes('holiday') || lowerTitle.includes('travel')) themes.push('Travel & Holidays');
    if (lowerTitle.includes('health')) themes.push('Health & Wellness');
    if (lowerTitle.includes('town') || lowerTitle.includes('city')) themes.push('Geography');
    if (lowerTitle.includes('christmas') || lowerTitle.includes('festival')) themes.push('Festivals');
    
    return themes.length > 0 ? themes : ['General Culture'];
  }

  private mapThemeToCultureType(theme: string): string {
    const mapping: { [key: string]: string } = {
      'Food & Dining': 'food',
      'Family': 'tradition',
      'Education': 'tradition',
      'Travel & Holidays': 'geography',
      'Health & Wellness': 'tradition',
      'Geography': 'geography',
      'Festivals': 'festival',
      'General Culture': 'tradition',
    };
    
    return mapping[theme] || 'tradition';
  }

  private getCountryForLanguage(language: string): string {
    const countryMapping: { [key: string]: string } = {
      'french': 'France',
      'german': 'Germany',
      'spanish': 'Spain',
    };
    
    return countryMapping[language] || 'France';
  }

  private printMigrationSummary(): void {
    console.log('\n🎉 Migration Summary:');
    console.log(`📚 Courses imported: ${this.stats.coursesImported}`);
    console.log(`📖 Lessons imported: ${this.stats.lessonsImported}`);
    console.log(`📝 Topics imported: ${this.stats.topicsImported}`);
    console.log(`❓ Quizzes imported: ${this.stats.quizzesImported}`);
    console.log(`❔ Questions imported: ${this.stats.questionsImported}`);
    console.log(`🏫 Institutions imported: ${this.stats.institutionsImported}`);
    console.log(`👥 Users imported: ${this.stats.usersImported}`);
    console.log(`📚 Vocabulary entries: ${this.stats.vocabularyImported}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n⚠️ Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
} 