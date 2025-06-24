/**
 * Sample Data for Airtable Tables
 * Provides test data for development and testing purposes
 */

const { BASE_CONFIG } = require('../config/base-config');

/**
 * Sample Users Data
 */
const SAMPLE_USERS = [
  {
    user_id: 'user_001',
    name: 'Alice Johnson',
    email: 'alice.johnson@techcorp.com',
    whatsapp: '+1234567890',
    job_title: 'Product Manager',
    skill_gaps: ['Data Analysis', 'Leadership', 'Python'],
    learning_format: 'Mixed',
    preferred_time: 'Morning',
    timezone: 'America/New_York',
    registration_date: '2024-01-15',
    total_sessions: 12,
    completion_rate: 85,
    status: 'active',
    calendar_email: 'alice.johnson@techcorp.com',
    notification_preferences: ['Email', 'WhatsApp']
  },
  {
    user_id: 'user_002',
    name: 'Bob Chen',
    email: 'bob.chen@startup.io',
    whatsapp: '+1987654321',
    job_title: 'Software Engineer',
    skill_gaps: ['Leadership', 'Communication', 'Project Management'],
    learning_format: 'Video',
    preferred_time: 'Evening',
    timezone: 'America/Los_Angeles',
    registration_date: '2024-01-20',
    total_sessions: 8,
    completion_rate: 75,
    status: 'active',
    calendar_email: 'bob.chen@startup.io',
    notification_preferences: ['Email']
  },
  {
    user_id: 'user_003',
    name: 'Carol Davis',
    email: 'carol.davis@consulting.com',
    whatsapp: '+1555123456',
    job_title: 'Business Analyst',
    skill_gaps: ['Python', 'Machine Learning', 'Data Visualization'],
    learning_format: 'Article',
    preferred_time: 'Lunch',
    timezone: 'America/Chicago',
    registration_date: '2024-02-01',
    total_sessions: 15,
    completion_rate: 92,
    status: 'active',
    calendar_email: 'carol.davis@consulting.com',
    notification_preferences: ['Email', 'WhatsApp', 'Calendar']
  },
  {
    user_id: 'user_004',
    name: 'David Wilson',
    email: 'david.wilson@enterprise.com',
    whatsapp: '+1777888999',
    job_title: 'Team Lead',
    skill_gaps: ['Communication', 'Strategic Thinking'],
    learning_format: 'Exercise',
    preferred_time: 'Afternoon',
    timezone: 'Europe/London',
    registration_date: '2024-02-10',
    total_sessions: 5,
    completion_rate: 60,
    status: 'paused',
    calendar_email: 'david.wilson@enterprise.com',
    notification_preferences: ['Email']
  },
  {
    user_id: 'user_005',
    name: 'Eva Rodriguez',
    email: 'eva.rodriguez@agency.com',
    whatsapp: '+1333444555',
    job_title: 'Marketing Manager',
    skill_gaps: ['Data Analysis', 'Python', 'Leadership'],
    learning_format: 'Mixed',
    preferred_time: 'Morning',
    timezone: 'America/Denver',
    registration_date: '2024-02-15',
    total_sessions: 20,
    completion_rate: 95,
    status: 'active',
    calendar_email: 'eva.rodriguez@agency.com',
    notification_preferences: ['Email', 'WhatsApp']
  }
];

/**
 * Sample Lessons Data
 */
const SAMPLE_LESSONS = [
  // Python lessons for user_001
  {
    lesson_id: 'user_001_lesson_001',
    user_id: 'user_001',
    day: 1,
    title: 'Python Variables and Data Types',
    content_type: 'Video',
    description: 'Learn about Python variables, strings, numbers, and basic data types.',
    keywords: ['Python', 'Variables', 'Data Types'],
    difficulty_level: 'Beginner',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-01-15T09:00:00Z',
    delivery_date: '2024-01-16T09:00:00Z',
    completion_date: '2024-01-16T09:05:00Z',
    delivery_method: 'email',
    engagement_score: 9,
    user_feedback: 'Very clear explanation!'
  },
  {
    lesson_id: 'user_001_lesson_002',
    user_id: 'user_001',
    day: 2,
    title: 'Python Lists and Dictionaries',
    content_type: 'Article',
    description: 'Understanding Python data structures: lists, dictionaries, and their methods.',
    keywords: ['Python', 'Lists', 'Dictionaries'],
    difficulty_level: 'Beginner',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-01-16T09:00:00Z',
    delivery_date: '2024-01-17T09:00:00Z',
    completion_date: '2024-01-17T09:07:00Z',
    delivery_method: 'email',
    engagement_score: 8,
    user_feedback: 'Good examples'
  },
  // Leadership lessons for user_002
  {
    lesson_id: 'user_002_lesson_001',
    user_id: 'user_002',
    day: 1,
    title: 'Effective Team Communication',
    content_type: 'Exercise',
    description: 'Practice active listening and clear communication techniques.',
    keywords: ['Leadership', 'Communication', 'Team Management'],
    difficulty_level: 'Intermediate',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-01-20T18:00:00Z',
    delivery_date: '2024-01-21T18:00:00Z',
    completion_date: '2024-01-21T18:06:00Z',
    delivery_method: 'whatsapp',
    engagement_score: 7,
    user_feedback: 'Practical tips'
  },
  {
    lesson_id: 'user_002_lesson_002',
    user_id: 'user_002',
    day: 2,
    title: 'Delegation and Trust Building',
    content_type: 'Video',
    description: 'Learn how to delegate effectively while building team trust.',
    keywords: ['Leadership', 'Delegation', 'Trust'],
    difficulty_level: 'Intermediate',
    estimated_duration: 5,
    status: 'in_progress',
    created_date: '2024-01-21T18:00:00Z',
    delivery_date: '2024-01-22T18:00:00Z',
    delivery_method: 'email',
    engagement_score: null,
    user_feedback: null
  },
  // Data Analysis lessons for user_003
  {
    lesson_id: 'user_003_lesson_001',
    user_id: 'user_003',
    day: 1,
    title: 'Introduction to Data Visualization',
    content_type: 'Article',
    description: 'Basic principles of effective data visualization and chart selection.',
    keywords: ['Data Analysis', 'Visualization', 'Charts'],
    difficulty_level: 'Beginner',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-02-01T12:00:00Z',
    delivery_date: '2024-02-02T12:00:00Z',
    completion_date: '2024-02-02T12:04:00Z',
    delivery_method: 'email',
    engagement_score: 10,
    user_feedback: 'Excellent content!'
  },
  {
    lesson_id: 'user_003_lesson_002',
    user_id: 'user_003',
    day: 2,
    title: 'Python for Data Analysis - Pandas Basics',
    content_type: 'Exercise',
    description: 'Hands-on practice with Pandas DataFrames and basic operations.',
    keywords: ['Python', 'Pandas', 'Data Analysis'],
    difficulty_level: 'Intermediate',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-02-02T12:00:00Z',
    delivery_date: '2024-02-03T12:00:00Z',
    completion_date: '2024-02-03T12:08:00Z',
    delivery_method: 'email',
    engagement_score: 9,
    user_feedback: 'Very helpful exercises'
  },
  // Communication lessons for user_004
  {
    lesson_id: 'user_004_lesson_001',
    user_id: 'user_004',
    day: 1,
    title: 'Strategic Communication Planning',
    content_type: 'Article',
    description: 'How to plan and structure strategic communications.',
    keywords: ['Communication', 'Strategy', 'Planning'],
    difficulty_level: 'Advanced',
    estimated_duration: 5,
    status: 'pending',
    created_date: '2024-02-10T14:00:00Z',
    delivery_method: 'email',
    engagement_score: null,
    user_feedback: null
  },
  // Mixed lessons for user_005
  {
    lesson_id: 'user_005_lesson_001',
    user_id: 'user_005',
    day: 1,
    title: 'Data-Driven Marketing Decisions',
    content_type: 'Video',
    description: 'Using data analysis to improve marketing campaign effectiveness.',
    keywords: ['Data Analysis', 'Marketing', 'Decision Making'],
    difficulty_level: 'Intermediate',
    estimated_duration: 5,
    status: 'completed',
    created_date: '2024-02-15T09:00:00Z',
    delivery_date: '2024-02-16T09:00:00Z',
    completion_date: '2024-02-16T09:06:00Z',
    delivery_method: 'email',
    engagement_score: 9,
    user_feedback: 'Great real-world examples'
  }
];

/**
 * Get sample data by type
 */
function getSampleData(type) {
  switch (type) {
    case 'users':
      return SAMPLE_USERS;
    case 'lessons':
      return SAMPLE_LESSONS;
    default:
      throw new Error(`Unknown sample data type: ${type}`);
  }
}

/**
 * Get sample data for a specific user
 */
function getSampleDataForUser(userId) {
  return {
    user: SAMPLE_USERS.find(u => u.user_id === userId),
    lessons: SAMPLE_LESSONS.filter(l => l.user_id === userId)
  };
}

/**
 * Generate random sample user
 */
function generateRandomUser(userId) {
  const names = ['Alex Smith', 'Jordan Brown', 'Taylor Johnson', 'Casey Davis', 'Riley Wilson'];
  const jobTitles = ['Developer', 'Designer', 'Manager', 'Analyst', 'Consultant'];
  const skillGaps = [
    ['Python', 'Data Analysis'],
    ['Leadership', 'Communication'],
    ['Project Management', 'Strategy'],
    ['Machine Learning', 'Statistics'],
    ['Design Thinking', 'User Research']
  ];
  const formats = ['Video', 'Article', 'Exercise', 'Mixed'];
  const times = ['Morning', 'Lunch', 'Afternoon', 'Evening'];
  const timezones = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London'];
  
  const randomIndex = Math.floor(Math.random() * names.length);
  
  return {
    user_id: userId,
    name: names[randomIndex],
    email: `${userId}@example.com`,
    whatsapp: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
    skill_gaps: skillGaps[Math.floor(Math.random() * skillGaps.length)],
    learning_format: formats[Math.floor(Math.random() * formats.length)],
    preferred_time: times[Math.floor(Math.random() * times.length)],
    timezone: timezones[Math.floor(Math.random() * timezones.length)],
    registration_date: new Date().toISOString().split('T')[0],
    total_sessions: 0,
    completion_rate: 0,
    status: 'active',
    calendar_email: `${userId}@example.com`,
    notification_preferences: ['Email']
  };
}

module.exports = {
  SAMPLE_USERS,
  SAMPLE_LESSONS,
  getSampleData,
  getSampleDataForUser,
  generateRandomUser
};
