# Personalized Micro-Learning Scheduler - Complete n8n Workflow

## System Overview

This advanced automation system creates personalized 5-minute learning bursts, intelligently schedules them based on calendar availability, and maintains engagement through smart notifications.

## Complete n8n Workflow Structure

### 1. MAIN WORKFLOW: User Registration & Profile Setup

#### Node 1: Form Trigger (Webhook)

```json
{
  "node": "Form Submission Webhook",
  "type": "n8n-nodes-base.webhook",
  "settings": {
    "httpMethod": "POST",
    "path": "learning-signup",
    "responseMode": "onReceived"
  },
  "note": "Receives form submissions from Google Forms or custom web form. Expected fields: name, email, whatsapp, job_title, skill_gaps, learning_format, preferred_time"
}
```

#### Node 2: Data Validation & Cleanup

```json
{
  "node": "Validate User Data",
  "type": "n8n-nodes-base.function",
  "code": "
    const userData = items[0].json;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'skill_gaps'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Clean and structure data
    const cleanedData = {
      user_id: userData.email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      whatsapp: userData.whatsapp?.replace(/[^0-9]/g, '') || '',
      job_title: userData.job_title || 'Professional',
      skill_gaps: userData.skill_gaps.split(',').map(s => s.trim()),
      learning_format: userData.learning_format || 'Mixed',
      preferred_time: userData.preferred_time || 'Morning',
      registration_date: new Date().toISOString(),
      last_learning_session: null,
      total_sessions: 0,
      status: 'active'
    };
    
    return [{ json: cleanedData }];
  ",
  "note": "Validates incoming form data, creates unique user ID, structures data for storage"
}
```

#### Node 3: Store User Profile (Airtable)

```json
{
  "node": "Save to Airtable",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "create",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Users",
    "fields": {
      "user_id": "={{$json.user_id}}",
      "name": "={{$json.name}}",
      "email": "={{$json.email}}",
      "whatsapp": "={{$json.whatsapp}}",
      "job_title": "={{$json.job_title}}",
      "skill_gaps": "={{$json.skill_gaps}}",
      "learning_format": "={{$json.learning_format}}",
      "preferred_time": "={{$json.preferred_time}}",
      "registration_date": "={{$json.registration_date}}",
      "status": "={{$json.status}}"
    }
  },
  "note": "Stores user profile in Airtable Users table. Configure with your Airtable base ID and API key"
}
```

#### Node 4: Generate Initial Learning Plan (OpenAI)

```json
{
  "node": "Create Learning Plan",
  "type": "n8n-nodes-base.openAi",
  "settings": {
    "resource": "chat",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a learning curriculum designer. Create a 30-day micro-learning plan with 5-minute daily lessons."
      },
      {
        "role": "user",
        "content": "Create a personalized learning plan for: Name: {{$json.name}}, Role: {{$json.job_title}}, Skill Gaps: {{$json.skill_gaps.join(', ')}}, Format: {{$json.learning_format}}. Return as JSON array with 30 lessons, each having: day, title, content_type, description, keywords"
      }
    ]
  },
  "note": "Uses OpenAI to generate personalized 30-day learning curriculum based on user profile"
}
```

#### Node 5: Parse & Store Learning Plan

```json
{
  "node": "Store Learning Plan",
  "type": "n8n-nodes-base.function",
  "code": "
    const learningPlan = JSON.parse(items[0].json.message.content);
    const userData = items[1].json; // From previous node
    
    const lessonsToStore = learningPlan.map((lesson, index) => ({
      user_id: userData.user_id,
      lesson_id: `${userData.user_id}_day_${lesson.day}`,
      day: lesson.day,
      title: lesson.title,
      content_type: lesson.content_type,
      description: lesson.description,
      keywords: lesson.keywords,
      status: 'pending',
      created_date: new Date().toISOString()
    }));
    
    return lessonsToStore.map(lesson => ({ json: lesson }));
  ",
  "note": "Parses OpenAI response and prepares lesson data for storage with proper structure"
}
```

#### Node 6: Bulk Store Lessons (Airtable)

```json
{
  "node": "Save Lessons to Airtable",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "create",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Lessons",
    "bulkCreate": true
  },
  "note": "Stores all generated lessons in Airtable Lessons table for the user"
}
```

#### Node 7: Send Welcome Message

```json
{
  "node": "Welcome Email",
  "type": "n8n-nodes-base.gmail",
  "settings": {
    "operation": "send",
    "to": "={{$('Validate User Data').item.json.email}}",
    "subject": "🎓 Welcome to Your Personalized Learning Journey!",
    "body": "Hi {{$('Validate User Data').item.json.name}},\n\nWelcome to your personalized micro-learning experience! We've created a custom 30-day learning plan based on your goals.\n\nYour first lesson will be delivered tomorrow during your preferred time slot. Get ready for 5-minute daily learning bursts that will transform your skills!\n\nBest regards,\nYour Learning Assistant"
  },
  "note": "Sends personalized welcome email to new users with their learning plan confirmation"
}
```

### 2. DAILY WORKFLOW: Calendar Analysis & Content Delivery

#### Node 1: Daily Trigger (Schedule)

```json
{
  "node": "Daily Scheduler",
  "type": "n8n-nodes-base.scheduleTrigger",
  "settings": {
    "rule": {
      "interval": [
        { "field": "hour", "hour": 8 },
        { "field": "minute", "minute": 0 }
      ]
    }
  },
  "note": "Triggers daily at 8 AM to analyze calendars and schedule learning sessions"
}
```

#### Node 2: Get Active Users

```json
{
  "node": "Fetch Active Users",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "list",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Users",
    "filterByFormula": "status = 'active'"
  },
  "note": "Retrieves all active users who should receive daily learning content"
}
```

#### Node 3: Loop Through Users

```json
{
  "node": "Process Each User",
  "type": "n8n-nodes-base.splitInBatches",
  "settings": {
    "batchSize": 1
  },
  "note": "Processes each user individually for personalized scheduling"
}
```

#### Node 4: Get User's Calendar (Google Calendar)

```json
{
  "node": "Analyze Calendar",
  "type": "n8n-nodes-base.googleCalendar",
  "settings": {
    "operation": "getAll",
    "calendar": "primary",
    "timeMin": "={{DateTime.now().toFormat('yyyy-MM-dd')}}T00:00:00.000Z",
    "timeMax": "={{DateTime.now().plus({days: 1}).toFormat('yyyy-MM-dd')}}T00:00:00.000Z"
  },
  "note": "Fetches today's calendar events for the current user to identify free time slots"
}
```

#### Node 5: Find Free Time Slots

```json
{
  "node": "Calculate Free Slots",
  "type": "n8n-nodes-base.function",
  "code": "
    const userData = items[0].json;
    const calendarEvents = items[1].json.items || [];
    
    // Define working hours based on user preference
    const timePreferences = {
      'Morning': { start: 9, end: 12 },
      'Afternoon': { start: 13, end: 17 },
      'Evening': { start: 18, end: 21 }
    };
    
    const userPref = timePreferences[userData.preferred_time] || timePreferences['Morning'];
    
    // Create time slots (15-minute intervals)
    const timeSlots = [];
    for (let hour = userPref.start; hour < userPref.end; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        timeSlots.push({
          start: new Date().setHours(hour, minute, 0, 0),
          end: new Date().setHours(hour, minute + 15, 0, 0)
        });
      }
    }
    
    // Filter out busy times
    const freeSlots = timeSlots.filter(slot => {
      return !calendarEvents.some(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date).getTime();
        const eventEnd = new Date(event.end.dateTime || event.end.date).getTime();
        return (slot.start >= eventStart && slot.start < eventEnd) ||
               (slot.end > eventStart && slot.end <= eventEnd);
      });
    });
    
    // Select best time slot (prefer first available)
    const bestSlot = freeSlots.length > 0 ? freeSlots[0] : null;
    
    return [{
      json: {
        ...userData,
        scheduled_time: bestSlot ? new Date(bestSlot.start).toISOString() : null,
        free_slots_count: freeSlots.length
      }
    }];
  ",
  "note": "Analyzes calendar events and finds optimal free time slots for learning sessions"
}
```

#### Node 6: Get Today's Lesson

```json
{
  "node": "Fetch Lesson Content",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "list",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Lessons",
    "filterByFormula": "AND(user_id = '{{$json.user_id}}', status = 'pending')",
    "sort": [{"field": "day", "direction": "asc"}],
    "maxRecords": 1
  },
  "note": "Retrieves the next pending lesson for the current user"
}
```

#### Node 7: Generate Learning Content (OpenAI)

```json
{
  "node": "Create Learning Content",
  "type": "n8n-nodes-base.openAi",
  "settings": {
    "resource": "chat",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a micro-learning content creator. Create engaging 5-minute learning content with actionable insights."
      },
      {
        "role": "user",
        "content": "Create content for: Title: {{$('Fetch Lesson Content').item.json.title}}, Description: {{$('Fetch Lesson Content').item.json.description}}, Format: {{$('Calculate Free Slots').item.json.learning_format}}, Keywords: {{$('Fetch Lesson Content').item.json.keywords}}. Include: 1) Key concept (2 sentences), 2) Quick tip, 3) Action item, 4) Resource recommendation"
      }
    ]
  },
  "note": "Generates personalized learning content based on lesson plan and user preferences"
}
```

#### Node 8: Schedule Content Delivery

```json
{
  "node": "Smart Content Delivery",
  "type": "n8n-nodes-base.switch",
  "settings": {
    "rules": [
      {
        "conditions": [
          {
            "field": "{{$('Calculate Free Slots').item.json.scheduled_time}}",
            "operation": "isNotEmpty"
          }
        ],
        "output": 0
      }
    ],
    "fallbackOutput": 1
  },
  "note": "Routes to immediate delivery if free time found, otherwise schedules for later"
}
```

#### Node 9a: Immediate WhatsApp Delivery (If Free Time Available)

```json
{
  "node": "Send WhatsApp Learning",
  "type": "n8n-nodes-base.twilio",
  "settings": {
    "resource": "message",
    "operation": "send",
    "from": "YOUR_TWILIO_WHATSAPP_NUMBER",
    "to": "whatsapp:+{{$('Calculate Free Slots').item.json.whatsapp}}",
    "body": "🎓 *5-Minute Learning Break* 📚\n\n*{{$('Fetch Lesson Content').item.json.title}}*\n\n{{$('Create Learning Content').item.json.message.content}}\n\n✨ Perfect timing - you have a free slot now! Take 5 minutes to level up your skills."
  },
  "note": "Sends immediate WhatsApp message when user has free time available"
}
```

#### Node 9b: Email Delivery (Fallback)

```json
{
  "node": "Send Email Learning",
  "type": "n8n-nodes-base.gmail",
  "settings": {
    "operation": "send",
    "to": "={{$('Calculate Free Slots').item.json.email}}",
    "subject": "📚 Your 5-Minute Learning: {{$('Fetch Lesson Content').item.json.title}}",
    "body": "{{$('Create Learning Content').item.json.message.content}}"
  },
  "note": "Sends email delivery when WhatsApp isn't available or no immediate free time"
}
```

#### Node 10: Log Engagement

```json
{
  "node": "Log to Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "settings": {
    "operation": "append",
    "spreadsheetId": "YOUR_GOOGLE_SHEETS_ID",
    "range": "Engagement!A:H",
    "values": [
      [
        "={{DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')}}",
        "={{$('Calculate Free Slots').item.json.user_id}}",
        "={{$('Calculate Free Slots').item.json.name}}",
        "={{$('Fetch Lesson Content').item.json.title}}",
        "={{$('Calculate Free Slots').item.json.scheduled_time ? 'WhatsApp' : 'Email'}}",
        "={{$('Calculate Free Slots').item.json.free_slots_count}}",
        "={{$('Fetch Lesson Content').item.json.day}}",
        "sent"
      ]
    ]
  },
  "note": "Logs all learning session deliveries for analytics and tracking"
}
```

#### Node 11: Update Lesson Status

```json
{
  "node": "Mark Lesson Complete",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "update",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Lessons",
    "id": "={{$('Fetch Lesson Content').item.json.id}}",
    "fields": {
      "status": "delivered",
      "delivery_date": "={{DateTime.now().toISO()}}",
      "delivery_method": "={{$('Calculate Free Slots').item.json.scheduled_time ? 'WhatsApp' : 'Email'}}"
    }
  },
  "note": "Updates lesson status to delivered and logs delivery details"
}
```

### 3. ENGAGEMENT MONITORING WORKFLOW: 3-Day Inactivity Alert

#### Node 1: Daily Engagement Check

```json
{
  "node": "Engagement Monitor",
  "type": "n8n-nodes-base.scheduleTrigger",
  "settings": {
    "rule": {
      "interval": [
        { "field": "hour", "hour": 20 },
        { "field": "minute", "minute": 0 }
      ]
    }
  },
  "note": "Runs daily at 8 PM to check for inactive users"
}
```

#### Node 2: Find Inactive Users

```json
{
  "node": "Query Inactive Users",
  "type": "n8n-nodes-base.googleSheets",
  "settings": {
    "operation": "read",
    "spreadsheetId": "YOUR_GOOGLE_SHEETS_ID",
    "range": "Engagement!A:H"
  },
  "note": "Reads engagement log to identify users with no activity in 3+ days"
}
```

#### Node 3: Analyze Inactivity

```json
{
  "node": "Calculate Inactivity",
  "type": "n8n-nodes-base.function",
  "code": "
    const engagementData = items[0].json.values || [];
    const threeDaysAgo = DateTime.now().minus({ days: 3 });
    
    // Group by user and find last activity
    const userActivity = {};
    engagementData.forEach(row => {
      if (row[0] && row[1]) { // timestamp and user_id
        const timestamp = DateTime.fromFormat(row[0], 'yyyy-MM-dd HH:mm:ss');
        const userId = row[1];
        
        if (!userActivity[userId] || timestamp > userActivity[userId].lastActivity) {
          userActivity[userId] = {
            lastActivity: timestamp,
            name: row[2],
            email: '', // We'll fetch this from Airtable
            userId: userId
          };
        }
      }
    });
    
    // Find inactive users
    const inactiveUsers = Object.values(userActivity).filter(user => 
      user.lastActivity < threeDaysAgo
    );
    
    return inactiveUsers.map(user => ({ json: user }));
  ",
  "note": "Processes engagement data to identify users inactive for 3+ days"
}
```

#### Node 4: Get User Details for Inactive Users

```json
{
  "node": "Fetch User Details",
  "type": "n8n-nodes-base.airtable",
  "settings": {
    "operation": "read",
    "base": "YOUR_AIRTABLE_BASE_ID",
    "table": "Users",
    "id": "={{$json.userId}}"
  },
  "note": "Retrieves full user details for inactive users to send re-engagement emails"
}
```

#### Node 5: Send Re-engagement Email

```json
{
  "node": "Re-engagement Notification",
  "type": "n8n-nodes-base.gmail",
  "settings": {
    "operation": "send",
    "to": "={{$json.email}}",
    "subject": "🎯 Missing You! Your Learning Journey Awaits",
    "body": "Hi {{$json.name}},\n\nWe noticed you haven't engaged with your learning sessions in the past few days. Don't worry - we're here to help you get back on track! 💪\n\n🔥 Your personalized learning plan is waiting\n⏰ We'll find the perfect time slots in your calendar\n📱 Get bite-sized lessons delivered just when you're free\n\nReady to continue your growth journey? Your next lesson is just a calendar slot away!\n\nStay curious,\nYour Learning Assistant\n\nP.S. Reply 'PAUSE' if you need a break, or 'RESUME' to continue your learning journey."
  },
  "note": "Sends motivational re-engagement email to users who haven't participated in 3+ days"
}
```

## Setup Instructions & Configuration

### Required Credentials

1. **Google Calendar API**: For calendar access
2. **Airtable API**: For user and lesson storage
3. **OpenAI API**: For content generation
4. **Twilio API**: For WhatsApp messaging
5. **Gmail**: For email notifications
6. **Google Sheets API**: For analytics logging

### Airtable Base Structure

#### Users Table

- user_id (Single line text, Primary)
- name (Single line text)
- email (Email)
- whatsapp (Phone number)
- job_title (Single line text)
- skill_gaps (Multiple select)
- learning_format (Single select: Video, Text, Mixed)
- preferred_time (Single select: Morning, Afternoon, Evening)
- registration_date (Date)
- last_learning_session (Date)
- total_sessions (Number)
- status (Single select: active, paused, inactive)

#### Lessons Table

- lesson_id (Single line text, Primary)
- user_id (Single line text)
- day (Number)
- title (Single line text)
- content_type (Single line text)
- description (Long text)
- keywords (Multiple select)
- status (Single select: pending, delivered, completed)
- created_date (Date)
- delivery_date (Date)
- delivery_method (Single select: Email, WhatsApp)

### Google Sheets Structure (Engagement Sheet)

- Column A: Timestamp
- Column B: User ID
- Column C: User Name
- Column D: Lesson Title
- Column E: Delivery Method
- Column F: Free Slots Count
- Column G: Lesson Day
- Column H: Status

## Advanced Features & Optimizations

### 1. Smart Timing Algorithm

The system analyzes calendar patterns over time to learn optimal delivery windows for each user.

### 2. Content Adaptation

OpenAI generates content that adapts to user engagement patterns and feedback.

### 3. Multi-Channel Delivery

Prioritizes WhatsApp for immediate delivery, falls back to email for scheduled content.

### 4. Engagement Analytics

Comprehensive tracking of user interactions, completion rates, and optimal timing.

### 5. Automated Re-engagement

Sophisticated 3-day inactivity detection with personalized re-engagement campaigns.

## Workflow Activation Steps

1. Import all three workflows into n8n
2. Configure all API credentials
3. Set up Airtable base with proper structure
4. Create Google Sheets for analytics
5. Test each workflow individually
6. Activate triggers in sequence:
   - Main workflow (always active)
   - Daily workflow (scheduled)
   - Engagement monitor (scheduled)

This system provides intelligent, personalized micro-learning that adapts to each user's schedule and preferences while maintaining engagement through smart notifications and analytics.

## Key Features of This Advanced System

🎯 **Smart Calendar Integration**: Automatically detects free time slots by analyzing Google Calendar events and delivers content at optimal moments

🧠 **AI-Powered Content Generation**: Uses OpenAI to create personalized learning plans and generate tailored 5-minute lessons based on individual skill gaps

📱 **Multi-Channel Delivery**: Prioritizes WhatsApp for immediate delivery when users are free, with email fallback for scheduled content

📊 **Advanced Analytics**: Comprehensive tracking in Google Sheets with engagement metrics, delivery success rates, and timing optimization

🔔 **Smart Re-engagement**: Automatically detects 3-day inactivity and sends personalized motivational messages

## The system consists of 3 interconnected workflows

1. **User Registration Workflow**: Handles form submissions, creates personalized learning plans, and sends welcome messages
2. **Daily Content Delivery**: Analyzes calendars, finds free slots, generates content, and delivers at optimal times
3. **Engagement Monitoring**: Tracks user activity and sends re-engagement notifications for inactive users

## Setup Requirements

- **APIs**: Google Calendar, Airtable, OpenAI, Twilio (WhatsApp), Gmail, Google Sheets
- **Storage**: Airtable for user profiles and lessons, Google Sheets for analytics
- **Form**: Google Form or custom webhook for user registration

The system is designed to be truly "magical" - it learns from user patterns, adapts content delivery timing, and maintains engagement through intelligent automation. Users will receive perfectly timed learning content that fits seamlessly into their actual schedule!

Would you like me to elaborate on any specific part of the workflow or help you with the implementation details?
