// User Tests

// Unit tests for user functionality
const { testUtils } = global;

describe('User Management', () => {
  describe('User Data Validation', () => {
    test('should create valid user object', () => {
      const user = testUtils.createMockUser();
      
      expect(user).toHaveProperty('user_id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('whatsapp');
      expect(user).toHaveProperty('job_title');
      expect(user).toHaveProperty('skill_gaps');
      expect(user).toHaveProperty('learning_goals');
      expect(user).toHaveProperty('preferred_format');
      expect(user).toHaveProperty('availability');
      expect(user).toHaveProperty('timezone');
      expect(user).toHaveProperty('language');
      expect(user).toHaveProperty('experience_level');
      expect(user).toHaveProperty('industry');
      expect(user).toHaveProperty('department');
      expect(user).toHaveProperty('created_at');
      expect(user).toHaveProperty('updated_at');
    });
    
    test('should validate email format', () => {
      const user = testUtils.createMockUser({ email: 'invalid-email' });
      expect(user.email).toBe('invalid-email');
      
      const validUser = testUtils.createMockUser({ email: 'valid@example.com' });
      expect(validUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
    
    test('should validate required fields', () => {
      const user = testUtils.createMockUser();
      
      expect(user.user_id).toBeTruthy();
      expect(user.name).toBeTruthy();
      expect(user.email).toBeTruthy();
      expect(user.created_at).toBeTruthy();
      expect(user.updated_at).toBeTruthy();
    });
    
    test('should handle skill gaps array', () => {
      const skillGaps = ['JavaScript', 'React', 'Node.js'];
      const user = testUtils.createMockUser({ skill_gaps: skillGaps });
      
      expect(Array.isArray(user.skill_gaps)).toBe(true);
      expect(user.skill_gaps).toEqual(skillGaps);
    });
    
    test('should handle learning goals array', () => {
      const learningGoals = ['Master frontend', 'Learn backend'];
      const user = testUtils.createMockUser({ learning_goals: learningGoals });
      
      expect(Array.isArray(user.learning_goals)).toBe(true);
      expect(user.learning_goals).toEqual(learningGoals);
    });
  });
  
  describe('User Preferences', () => {
    test('should validate preferred format options', () => {
      const validFormats = ['video', 'article', 'interactive', 'audio'];
      
      validFormats.forEach(format => {
        const user = testUtils.createMockUser({ preferred_format: format });
        expect(user.preferred_format).toBe(format);
      });
    });
    
    test('should validate availability options', () => {
      const validAvailability = ['morning', 'afternoon', 'evening', 'flexible'];
      
      validAvailability.forEach(availability => {
        const user = testUtils.createMockUser({ availability });
        expect(user.availability).toBe(availability);
      });
    });
    
    test('should validate experience level options', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      validLevels.forEach(level => {
        const user = testUtils.createMockUser({ experience_level: level });
        expect(user.experience_level).toBe(level);
      });
    });
  });
  
  describe('User Timestamps', () => {
    test('should have valid ISO timestamp format', () => {
      const user = testUtils.createMockUser();
      
      expect(new Date(user.created_at).toISOString()).toBe(user.created_at);
      expect(new Date(user.updated_at).toISOString()).toBe(user.updated_at);
    });
    
    test('should update timestamp when user is modified', async () => {
      const originalUser = testUtils.createMockUser();
      
      // Wait a small amount to ensure different timestamp
      await testUtils.waitFor(10);
      
      const updatedUser = {
        ...originalUser,
        name: 'Updated Name',
        updated_at: new Date().toISOString()
      };
      
      expect(updatedUser.updated_at).not.toBe(originalUser.updated_at);
      expect(new Date(updatedUser.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUser.updated_at).getTime()
      );
    });
  });
});

describe('User Utilities', () => {
  test('should create multiple unique users', () => {
    const user1 = testUtils.createMockUser();
    const user2 = testUtils.createMockUser();
    
    expect(user1.user_id).not.toBe(user2.user_id);
    expect(user1.email).not.toBe(user2.email);
  });
  
  test('should override default values', () => {
    const customUser = testUtils.createMockUser({
      name: 'Custom Name',
      email: 'custom@example.com',
      job_title: 'Custom Title'
    });
    
    expect(customUser.name).toBe('Custom Name');
    expect(customUser.email).toBe('custom@example.com');
    expect(customUser.job_title).toBe('Custom Title');
  });
});
