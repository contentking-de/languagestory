import * as fs from 'fs';
import * as xml2js from 'xml2js';

// WordPress export content types
export interface WPPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  postType: string;
  status: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  metaData: { [key: string]: any };
  categories: string[];
  tags: string[];
}

export interface WPAuthor {
  id: number;
  login: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  parent: string;
}

export interface WPGroup {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

// Parsed content structures
export interface ParsedCourse {
  wpId: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  language: string;
  level: string;
  status: string;
  author: string;
  createdAt: string;
  metaData: any;
  lessons: number[]; // lesson IDs
}

export interface ParsedLesson {
  wpId: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  lessonType: string;
  courseId: number;
  status: string;
  author: string;
  createdAt: string;
  metaData: any;
  topics: number[]; // topic IDs
}

export interface ParsedTopic {
  wpId: number;
  title: string;
  slug: string;
  content: string;
  topicType: string;
  lessonId: number;
  status: string;
  author: string;
  createdAt: string;
  metaData: any;
  interactiveData: any;
}

export interface ParsedQuiz {
  wpId: number;
  title: string;
  description: string;
  quizType: string;
  lessonId?: number;
  topicId?: number;
  status: string;
  createdAt: string;
  metaData: any;
  questions: number[]; // question IDs
}

export interface ParsedQuestion {
  wpId: number;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  answerOptions: string[];
  explanation: string;
  points: number;
  metaData: any;
}

export class WordPressXMLParser {
  private authors: Map<number, WPAuthor> = new Map();
  private categories: Map<number, WPCategory> = new Map();
  private posts: Map<number, WPPost> = new Map();
  private courses: Map<number, ParsedCourse> = new Map();
  private lessons: Map<number, ParsedLesson> = new Map();
  private topics: Map<number, ParsedTopic> = new Map();
  private quizzes: Map<number, ParsedQuiz> = new Map();
  private questions: Map<number, ParsedQuestion> = new Map();
  private groups: Map<number, WPGroup> = new Map();

  async parseXMLFile(filePath: string): Promise<void> {
    console.log('📖 Starting XML parsing...');
    
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });
    
    try {
      const result = await parser.parseStringPromise(xmlContent);
      const channel = result.rss.channel;
      
      // Parse authors
      this.parseAuthors(channel['wp:author'] || []);
      
      // Parse categories
      this.parseCategories(channel['wp:category'] || []);
      
      // Parse all posts
      this.parsePosts(channel.item || []);
      
      // Organize LearnDash content
      this.organizeLearndashContent();
      
      console.log('✅ XML parsing completed successfully!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Error parsing XML:', error);
      throw error;
    }
  }

  private parseAuthors(authorsData: any[]): void {
    const authors = Array.isArray(authorsData) ? authorsData : [authorsData];
    
    authors.forEach(author => {
      if (!author) return;
      
      this.authors.set(parseInt(author['wp:author_id']), {
        id: parseInt(author['wp:author_id']),
        login: author['wp:author_login'] || '',
        email: author['wp:author_email'] || '',
        displayName: author['wp:author_display_name'] || '',
        firstName: author['wp:author_first_name'] || '',
        lastName: author['wp:author_last_name'] || '',
      });
    });
    
    console.log(`👥 Parsed ${this.authors.size} authors`);
  }

  private parseCategories(categoriesData: any[]): void {
    const categories = Array.isArray(categoriesData) ? categoriesData : [categoriesData];
    
    categories.forEach(cat => {
      if (!cat) return;
      
      this.categories.set(parseInt(cat['wp:term_id']), {
        id: parseInt(cat['wp:term_id']),
        name: cat['wp:cat_name'] || '',
        slug: cat['wp:category_nicename'] || '',
        parent: cat['wp:category_parent'] || '',
      });
    });
    
    console.log(`📁 Parsed ${this.categories.size} categories`);
  }

  private parsePosts(postsData: any[]): void {
    const posts = Array.isArray(postsData) ? postsData : [postsData];
    
    posts.forEach(post => {
      if (!post) return;
      
      const wpId = parseInt(post['wp:post_id']);
      const postType = post['wp:post_type'];
      
      // Parse meta data
      const metaData: { [key: string]: any } = {};
      const metaEntries = post['wp:postmeta'] || [];
      const metaArray = Array.isArray(metaEntries) ? metaEntries : [metaEntries];
      
      metaArray.forEach((meta: any) => {
        if (meta && meta['wp:meta_key'] && meta['wp:meta_value']) {
          metaData[meta['wp:meta_key']] = meta['wp:meta_value'];
        }
      });

      // Parse categories for this post
      const postCategories: string[] = [];
      const categoryEntries = post.category || [];
      const catArray = Array.isArray(categoryEntries) ? categoryEntries : [categoryEntries];
      catArray.forEach((cat: any) => {
        if (cat && cat._) {
          postCategories.push(cat._);
        }
      });

      const wpPost: WPPost = {
        id: wpId,
        title: post.title || '',
        slug: post['wp:post_name'] || '',
        content: post['content:encoded'] || '',
        excerpt: post['excerpt:encoded'] || '',
        postType: postType || '',
        status: post['wp:status'] || 'draft',
        author: post['dc:creator'] || '',
        createdAt: post['wp:post_date'] || '',
        updatedAt: post['wp:post_date_gmt'] || '',
        metaData,
        categories: postCategories,
        tags: [],
      };

      this.posts.set(wpId, wpPost);
    });
    
    console.log(`📝 Parsed ${this.posts.size} total posts`);
  }

  private organizeLearndashContent(): void {
    console.log('🎓 Organizing LearnDash content...');
    
    // Extract courses
    this.posts.forEach(post => {
      if (post.postType === 'sfwd-courses') {
        const course: ParsedCourse = {
          wpId: post.id,
          title: post.title,
          slug: post.slug,
          description: post.excerpt,
          content: post.content,
          language: this.extractLanguageFromTitle(post.title),
          level: 'beginner', // Default, can be enhanced
          status: post.status,
          author: post.author,
          createdAt: post.createdAt,
          metaData: post.metaData,
          lessons: [],
        };
        this.courses.set(post.id, course);
      }
    });

    // Extract lessons
    this.posts.forEach(post => {
      if (post.postType === 'sfwd-lessons') {
        const lesson: ParsedLesson = {
          wpId: post.id,
          title: post.title,
          slug: post.slug,
          description: post.excerpt,
          content: post.content,
          lessonType: this.extractLessonType(post.title, post.content),
          courseId: this.extractCourseId(post.metaData),
          status: post.status,
          author: post.author,
          createdAt: post.createdAt,
          metaData: post.metaData,
          topics: [],
        };
        this.lessons.set(post.id, lesson);
        
        // Link to course
        const course = this.courses.get(lesson.courseId);
        if (course) {
          course.lessons.push(post.id);
        }
      }
    });

    // Extract topics
    this.posts.forEach(post => {
      if (post.postType === 'sfwd-topic') {
        const topic: ParsedTopic = {
          wpId: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          topicType: this.extractTopicType(post.title, post.content),
          lessonId: this.extractLessonId(post.metaData),
          status: post.status,
          author: post.author,
          createdAt: post.createdAt,
          metaData: post.metaData,
          interactiveData: this.extractInteractiveData(post.content, post.metaData),
        };
        this.topics.set(post.id, topic);
        
        // Link to lesson
        const lesson = this.lessons.get(topic.lessonId);
        if (lesson) {
          lesson.topics.push(post.id);
        }
      }
    });

    // Extract quizzes
    this.posts.forEach(post => {
      if (post.postType === 'sfwd-quiz') {
        const quiz: ParsedQuiz = {
          wpId: post.id,
          title: post.title,
          description: post.content,
          quizType: this.extractQuizType(post.title),
          lessonId: this.extractLessonId(post.metaData),
          topicId: this.extractTopicId(post.metaData),
          status: post.status,
          createdAt: post.createdAt,
          metaData: post.metaData,
          questions: [],
        };
        this.quizzes.set(post.id, quiz);
      }
    });

    // Extract questions
    this.posts.forEach(post => {
      if (post.postType === 'sfwd-question') {
        const question: ParsedQuestion = {
          wpId: post.id,
          questionText: post.title,
          questionType: this.extractQuestionType(post.metaData),
          correctAnswer: this.extractCorrectAnswer(post.metaData),
          answerOptions: this.extractAnswerOptions(post.metaData),
          explanation: post.content,
          points: this.extractPoints(post.metaData),
          metaData: post.metaData,
        };
        this.questions.set(post.id, question);
      }
    });

    // Extract groups
    this.posts.forEach(post => {
      if (post.postType === 'groups') {
        const group: WPGroup = {
          id: post.id,
          title: post.title,
          description: post.content,
          status: post.status,
          createdAt: post.createdAt,
        };
        this.groups.set(post.id, group);
      }
    });
  }

  // Helper methods for content extraction
  private extractLanguageFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('french')) return 'french';
    if (lowerTitle.includes('german')) return 'german'; 
    if (lowerTitle.includes('spanish')) return 'spanish';
    return 'french'; // Default
  }

  private extractLessonType(title: string, content: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('game')) return 'game';
    if (lowerTitle.includes('story')) return 'story';
    if (lowerTitle.includes('vocabulary')) return 'vocabulary';
    if (lowerTitle.includes('grammar')) return 'grammar';
    return 'story'; // Default
  }

  private extractTopicType(title: string, content: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('quiz')) return 'comprehension_quiz';
    if (lowerTitle.includes('listening') && lowerTitle.includes('gap')) return 'listening_gap_fill';
    if (lowerTitle.includes('vocabulary') && lowerTitle.includes('game')) return 'vocabulary_game';
    if (lowerTitle.includes('anagram')) return 'anagram';
    if (lowerTitle.includes('matching') || lowerTitle.includes('pairs')) return 'matching_pairs';
    if (lowerTitle.includes('find') && lowerTitle.includes('match')) return 'find_the_match';
    if (lowerTitle.includes('page')) return 'story_page';
    return 'story_page'; // Default
  }

  private extractQuizType(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('vocabulary')) return 'vocabulary';
    if (lowerTitle.includes('listening')) return 'listening';
    if (lowerTitle.includes('grammar')) return 'grammar';
    if (lowerTitle.includes('writing')) return 'writing';
    return 'comprehension'; // Default
  }

  private extractQuestionType(metaData: any): string {
    // Based on LearnDash question types
    const questionType = metaData['question_type'] || metaData['_question_type'];
    switch (questionType) {
      case 'single': return 'multiple_choice';
      case 'multiple': return 'multiple_choice';
      case 'free_answer': return 'short_answer';
      case 'sort_answer': return 'ordering';
      case 'matrix_sort_answer': return 'matching';
      case 'cloze_answer': return 'fill_blank';
      default: return 'multiple_choice';
    }
  }

  private extractCourseId(metaData: any): number {
    return parseInt(metaData['course_id'] || metaData['_course_id'] || '0');
  }

  private extractLessonId(metaData: any): number {
    return parseInt(metaData['lesson_id'] || metaData['_lesson_id'] || '0');
  }

  private extractTopicId(metaData: any): number {
    return parseInt(metaData['topic_id'] || metaData['_topic_id'] || '0');
  }

  private extractCorrectAnswer(metaData: any): string {
    return metaData['_correct_answer'] || metaData['correct_answer'] || '';
  }

  private extractAnswerOptions(metaData: any): string[] {
    const answers = metaData['_answers'] || metaData['answers'] || '[]';
    try {
      return typeof answers === 'string' ? JSON.parse(answers) : answers;
    } catch {
      return [];
    }
  }

  private extractPoints(metaData: any): number {
    return parseInt(metaData['_points'] || metaData['points'] || '1');
  }

  private extractInteractiveData(content: string, metaData: any): any {
    // Extract any interactive configurations from content or metadata
    const interactiveData: any = {};
    
    // Check for H5P content
    if (content.includes('[h5p')) {
      interactiveData.hasH5P = true;
      const h5pMatch = content.match(/\[h5p id="(\d+)"\]/);
      if (h5pMatch) {
        interactiveData.h5pId = h5pMatch[1];
      }
    }
    
    // Check for shortcodes that indicate interactive content
    if (content.includes('[quiz')) {
      interactiveData.hasQuiz = true;
    }
    
    return Object.keys(interactiveData).length > 0 ? interactiveData : null;
  }

  private printSummary(): void {
    console.log('\n📊 Content Summary:');
    console.log(`📚 Courses: ${this.courses.size}`);
    console.log(`📖 Lessons: ${this.lessons.size}`);
    console.log(`📝 Topics: ${this.topics.size}`);
    console.log(`❓ Quizzes: ${this.quizzes.size}`);
    console.log(`❔ Questions: ${this.questions.size}`);
    console.log(`👥 Groups: ${this.groups.size}`);
    console.log(`👤 Authors: ${this.authors.size}`);
    
    // Language breakdown
    const languageCount = { french: 0, german: 0, spanish: 0 };
    this.courses.forEach(course => {
      languageCount[course.language as keyof typeof languageCount]++;
    });
    console.log(`\n🌍 Language Distribution:`);
    console.log(`🇫🇷 French: ${languageCount.french} courses`);
    console.log(`🇩🇪 German: ${languageCount.german} courses`);
    console.log(`🇪🇸 Spanish: ${languageCount.spanish} courses`);
  }

  // Getters for parsed content
  getCourses(): Map<number, ParsedCourse> { return this.courses; }
  getLessons(): Map<number, ParsedLesson> { return this.lessons; }
  getTopics(): Map<number, ParsedTopic> { return this.topics; }
  getQuizzes(): Map<number, ParsedQuiz> { return this.quizzes; }
  getQuestions(): Map<number, ParsedQuestion> { return this.questions; }
  getGroups(): Map<number, WPGroup> { return this.groups; }
  getAuthors(): Map<number, WPAuthor> { return this.authors; }
  getPosts(): Map<number, WPPost> { return this.posts; }
} 