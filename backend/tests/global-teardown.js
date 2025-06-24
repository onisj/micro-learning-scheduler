// Global teardown for Jest - runs once after all tests
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  const teardownStartTime = Date.now();
  
  try {
    // Clean up test files
    if (global.__TEST_CLEANUP__ && global.__TEST_CLEANUP__.files) {
      for (const filePath of global.__TEST_CLEANUP__.files) {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Cleaned up test file: ${filePath}`);
          }
        } catch (error) {
          console.warn(`⚠️  Failed to clean up file ${filePath}:`, error.message);
        }
      }
    }
    
    // Clean up temporary test directories
    const tempDirs = [
      path.resolve(__dirname, '../temp'),
      path.resolve(__dirname, '../logs'),
      path.resolve(__dirname, '../fixtures/temp')
    ];
    
    for (const dir of tempDirs) {
      try {
        if (fs.existsSync(dir)) {
          // Remove all files in the directory
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              fs.unlinkSync(filePath);
            }
          }
          // Remove the directory if it's empty
          if (fs.readdirSync(dir).length === 0) {
            fs.rmdirSync(dir);
            console.log(`📁 Cleaned up test directory: ${dir}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Failed to clean up directory ${dir}:`, error.message);
      }
    }
    
    // Close any open connections
    if (global.__TEST_CLEANUP__ && global.__TEST_CLEANUP__.connections) {
      for (const connection of global.__TEST_CLEANUP__.connections) {
        try {
          if (connection && typeof connection.close === 'function') {
            await connection.close();
            console.log('🔌 Closed test connection');
          }
        } catch (error) {
          console.warn('⚠️  Failed to close connection:', error.message);
        }
      }
    }
    
    // Performance reporting
    if (global.__PERFORMANCE__) {
      const totalTime = Date.now() - global.__PERFORMANCE__.startTime;
      console.log(`\n📊 Test Performance Summary:`);
      console.log(`⏱️  Total test suite time: ${totalTime}ms`);
      
      // Report slow tests (>5 seconds)
      const slowTests = Object.entries(global.__PERFORMANCE__.testTimes || {})
        .filter(([, time]) => time > 5000)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      
      if (slowTests.length > 0) {
        console.log('🐌 Slowest tests:');
        slowTests.forEach(([testName, time]) => {
          console.log(`   ${testName}: ${time}ms`);
        });
      }
    }
    
    // Memory usage reporting
    const memUsage = process.memoryUsage();
    console.log(`\n💾 Memory Usage:`);
    console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    
    // Clear global variables
    delete global.__TEST_START_TIME__;
    delete global.__TEST_ENV__;
    delete global.__TEST_DB__;
    delete global.__TEST_CLEANUP__;
    delete global.__MOCK_RESPONSES__;
    delete global.__PERFORMANCE__;
    delete global.testUtils;
    
    const teardownTime = Date.now() - teardownStartTime;
    console.log(`\n✅ Global test teardown completed in ${teardownTime}ms`);
    
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't throw the error to avoid failing the test suite
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('🗑️  Forced garbage collection');
  }
  
  console.log('👋 Test suite cleanup complete\n');
};