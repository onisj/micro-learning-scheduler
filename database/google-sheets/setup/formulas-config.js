/**
 * Formulas Configuration for Google Sheets
 * Defines formulas for data calculations, aggregations, and analytics
 */

/**
 * User Analytics Formulas
 */
const USER_ANALYTICS_FORMULAS = {
  // Total registered users
  totalUsers: {
    formula: '=COUNTA(Users!B:B)-1',
    description: 'Count total number of registered users',
    cell: 'Analytics!B2'
  },

  // Active users (users with sessions in last 30 days)
  activeUsers: {
    formula: '=COUNTIFS(Users!L:L,">="&TODAY()-30)',
    description: 'Count users with activity in last 30 days',
    cell: 'Analytics!B3'
  },

  // Average completion rate
  avgCompletionRate: {
    formula: '=AVERAGE(Users!M:M)',
    description: 'Average completion rate across all users',
    cell: 'Analytics!B4'
  },

  // Users by learning format
  videoLearners: {
    formula: '=COUNTIF(Users!G:G,"video")',
    description: 'Count users preferring video format',
    cell: 'Analytics!D2'
  },

  textLearners: {
    formula: '=COUNTIF(Users!G:G,"text")',
    description: 'Count users preferring text format',
    cell: 'Analytics!D3'
  },

  interactiveLearners: {
    formula: '=COUNTIF(Users!G:G,"interactive")',
    description: 'Count users preferring interactive format',
    cell: 'Analytics!D4'
  },

  // Registration trend (daily)
  dailyRegistrations: {
    formula: '=COUNTIFS(Users!J:J,">="&A2,Users!J:J,"<"&A2+1)',
    description: 'Count registrations for specific date (A2)',
    cell: 'Analytics!B2',
    isArrayFormula: true
  },

  // Completion rate by format
  videoCompletionRate: {
    formula: '=AVERAGEIF(Users!G:G,"video",Users!M:M)',
    description: 'Average completion rate for video learners',
    cell: 'Analytics!E2'
  },

  textCompletionRate: {
    formula: '=AVERAGEIF(Users!G:G,"text",Users!M:M)',
    description: 'Average completion rate for text learners',
    cell: 'Analytics!E3'
  },

  interactiveCompletionRate: {
    formula: '=AVERAGEIF(Users!G:G,"interactive",Users!M:M)',
    description: 'Average completion rate for interactive learners',
    cell: 'Analytics!E4'
  }
};

/**
 * Lesson Performance Formulas
 */
const LESSON_PERFORMANCE_FORMULAS = {
  // Total lessons delivered
  totalLessonsDelivered: {
    formula: '=COUNTIF(Lessons!J:J,"delivered")',
    description: 'Count total delivered lessons',
    cell: 'Performance!B2'
  },

  // Total lessons completed
  totalLessonsCompleted: {
    formula: '=COUNTIF(Lessons!J:J,"completed")',
    description: 'Count total completed lessons',
    cell: 'Performance!B3'
  },

  // Overall completion rate
  overallCompletionRate: {
    formula: '=Performance!B3/Performance!B2*100',
    description: 'Overall lesson completion percentage',
    cell: 'Performance!B4'
  },

  // Average engagement score
  avgEngagementScore: {
    formula: '=AVERAGE(Lessons!O:O)',
    description: 'Average engagement score across all lessons',
    cell: 'Performance!B5'
  },

  // Lessons by content type
  videoLessons: {
    formula: '=COUNTIF(Lessons!E:E,"video")',
    description: 'Count video lessons',
    cell: 'Performance!D2'
  },

  textLessons: {
    formula: '=COUNTIF(Lessons!E:E,"text")',
    description: 'Count text lessons',
    cell: 'Performance!D3'
  },

  interactiveLessons: {
    formula: '=COUNTIF(Lessons!E:E,"interactive")',
    description: 'Count interactive lessons',
    cell: 'Performance!D4'
  },

  // Completion rate by content type
  videoCompletionRate: {
    formula: '=COUNTIFS(Lessons!E:E,"video",Lessons!J:J,"completed")/COUNTIF(Lessons!E:E,"video")*100',
    description: 'Completion rate for video lessons',
    cell: 'Performance!E2'
  },

  textCompletionRate: {
    formula: '=COUNTIFS(Lessons!E:E,"text",Lessons!J:J,"completed")/COUNTIF(Lessons!E:E,"text")*100',
    description: 'Completion rate for text lessons',
    cell: 'Performance!E3'
  },

  interactiveCompletionRate: {
    formula: '=COUNTIFS(Lessons!E:E,"interactive",Lessons!J:J,"completed")/COUNTIF(Lessons!E:E,"interactive")*100',
    description: 'Completion rate for interactive lessons',
    cell: 'Performance!E4'
  },

  // Daily lesson delivery trend
  dailyDeliveries: {
    formula: '=COUNTIFS(Lessons!L:L,">="&M2,Lessons!L:L,"<"&M2+1)',
    description: 'Count lessons delivered on specific date (M2)',
    cell: 'Performance!N2',
    isArrayFormula: true
  },

  // Average lesson duration by type
  avgVideoDuration: {
    formula: '=AVERAGEIF(Lessons!E:E,"video",Lessons!I:I)',
    description: 'Average duration for video lessons',
    cell: 'Performance!G2'
  },

  avgTextDuration: {
    formula: '=AVERAGEIF(Lessons!E:E,"text",Lessons!I:I)',
    description: 'Average duration for text lessons',
    cell: 'Performance!G3'
  },

  avgInteractiveDuration: {
    formula: '=AVERAGEIF(Lessons!E:E,"interactive",Lessons!I:I)',
    description: 'Average duration for interactive lessons',
    cell: 'Performance!G4'
  }
};

/**
 * Engagement Analytics Formulas
 */
const ENGAGEMENT_FORMULAS = {
  // Total interactions
  totalInteractions: {
    formula: '=COUNTA(Engagement!A:A)-1',
    description: 'Count total user interactions',
    cell: 'Engagement!F2'
  },

  // Interactions by type
  viewInteractions: {
    formula: '=COUNTIF(Engagement!D:D,"view")',
    description: 'Count view interactions',
    cell: 'Engagement!G2'
  },

  startInteractions: {
    formula: '=COUNTIF(Engagement!D:D,"start")',
    description: 'Count start interactions',
    cell: 'Engagement!G3'
  },

  completeInteractions: {
    formula: '=COUNTIF(Engagement!D:D,"complete")',
    description: 'Count complete interactions',
    cell: 'Engagement!G4'
  },

  feedbackInteractions: {
    formula: '=COUNTIF(Engagement!D:D,"feedback")',
    description: 'Count feedback interactions',
    cell: 'Engagement!G5'
  },

  // Average session duration
  avgSessionDuration: {
    formula: '=AVERAGE(Engagement!F:F)',
    description: 'Average session duration in minutes',
    cell: 'Engagement!F3'
  },

  // Device type distribution
  mobileUsers: {
    formula: '=COUNTIF(Engagement!G:G,"mobile")',
    description: 'Count mobile device interactions',
    cell: 'Engagement!L2'
  },

  desktopUsers: {
    formula: '=COUNTIF(Engagement!G:G,"desktop")',
    description: 'Count desktop device interactions',
    cell: 'Engagement!L3'
  },

  tabletUsers: {
    formula: '=COUNTIF(Engagement!G:G,"tablet")',
    description: 'Count tablet device interactions',
    cell: 'Engagement!L4'
  },

  // Hourly engagement pattern
  hourlyEngagement: {
    formula: '=COUNTIFS(Engagement!E:E,">="&TIME(I2,0,0),Engagement!E:E,"<"&TIME(I2+1,0,0))',
    description: 'Count interactions for specific hour (I2)',
    cell: 'Engagement!J2',
    isArrayFormula: true
  },

  // Average engagement score
  avgEngagementScore: {
    formula: '=AVERAGE(Engagement!L:L)',
    description: 'Average engagement score',
    cell: 'Engagement!F4'
  },

  // Peak engagement time
  peakEngagementHour: {
    formula: '=INDEX(I:I,MATCH(MAX(J:J),J:J,0))',
    description: 'Hour with highest engagement',
    cell: 'Engagement!F5'
  }
};

/**
 * Performance Metrics Formulas
 */
const PERFORMANCE_METRICS_FORMULAS = {
  // System performance indicators
  systemUptime: {
    formula: '=100',
    description: 'System uptime percentage (placeholder)',
    cell: 'Performance!B6'
  },

  // User satisfaction metrics
  avgUserSatisfaction: {
    formula: '=AVERAGE(Lessons!P:P)',
    description: 'Average user feedback score',
    cell: 'Performance!B7'
  },

  // Content effectiveness
  contentEffectiveness: {
    formula: '=(Performance!B3/Performance!B2)*Performance!B5/10*100',
    description: 'Content effectiveness score based on completion and engagement',
    cell: 'Performance!B8'
  },

  // Weekly metrics
  weeklyActiveUsers: {
    formula: '=COUNTIFS(Users!L:L,">="&TODAY()-7)',
    description: 'Users active in last 7 days',
    cell: 'Performance!B9'
  },

  weeklyLessonsDelivered: {
    formula: '=COUNTIFS(Lessons!L:L,">="&TODAY()-7)',
    description: 'Lessons delivered in last 7 days',
    cell: 'Performance!B10'
  },

  weeklyCompletionRate: {
    formula: '=COUNTIFS(Lessons!L:L,">="&TODAY()-7,Lessons!J:J,"completed")/COUNTIFS(Lessons!L:L,">="&TODAY()-7)*100',
    description: 'Completion rate for last 7 days',
    cell: 'Performance!B11'
  },

  // Monthly trends
  monthlyGrowthRate: {
    formula: '=(COUNTIFS(Users!J:J,">="&EOMONTH(TODAY(),-1)+1)-COUNTIFS(Users!J:J,">="&EOMONTH(TODAY(),-2)+1,Users!J:J,"<="&EOMONTH(TODAY(),-1)))/COUNTIFS(Users!J:J,">="&EOMONTH(TODAY(),-2)+1,Users!J:J,"<="&EOMONTH(TODAY(),-1))*100',
    description: 'Monthly user growth rate percentage',
    cell: 'Performance!B12'
  },

  // Retention metrics
  userRetentionRate: {
    formula: '=COUNTIFS(Users!L:L,">="&TODAY()-30)/Performance!B2*100',
    description: '30-day user retention rate',
    cell: 'Performance!B13'
  }
};

/**
 * Helper functions for formula management
 */
function applyFormula(sheets, spreadsheetId, sheetName, cell, formula) {
  const range = `${sheetName}!${cell}`;
  
  return sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[formula]]
    }
  });
}

function applyAllFormulas(sheets, spreadsheetId) {
  const allFormulas = {
    ...USER_ANALYTICS_FORMULAS,
    ...LESSON_PERFORMANCE_FORMULAS,
    ...ENGAGEMENT_FORMULAS,
    ...PERFORMANCE_METRICS_FORMULAS
  };
  
  const requests = [];
  
  Object.entries(allFormulas).forEach(([name, config]) => {
    const [sheetName, cellRef] = config.cell.split('!');
    
    requests.push({
      updateCells: {
        range: {
          sheetId: getSheetId(sheetName),
          startRowIndex: getCellRow(cellRef) - 1,
          endRowIndex: getCellRow(cellRef),
          startColumnIndex: getCellColumn(cellRef) - 1,
          endColumnIndex: getCellColumn(cellRef)
        },
        rows: [{
          values: [{
            userEnteredValue: {
              formulaValue: config.formula
            }
          }]
        }],
        fields: 'userEnteredValue'
      }
    });
  });
  
  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: {
      requests: requests
    }
  });
}

function createCalculatedColumns(sheets, spreadsheetId) {
  const calculatedColumns = [
    // Users sheet calculated columns
    {
      sheetName: 'Users',
      column: 'Q', // Days since registration
      formula: '=TODAY()-J2',
      description: 'Days since user registration'
    },
    {
      sheetName: 'Users',
      column: 'R', // User activity status
      formula: '=IF(L2>=TODAY()-30,"Active","Inactive")',
      description: 'User activity status based on last session'
    },
    
    // Lessons sheet calculated columns
    {
      sheetName: 'Lessons',
      column: 'Q', // Days to delivery
      formula: '=L2-K2',
      description: 'Days between creation and delivery'
    },
    {
      sheetName: 'Lessons',
      column: 'R', // Completion time
      formula: '=IF(M2<>"",M2-L2,"")',
      description: 'Time taken to complete lesson'
    },
    
    // Engagement sheet calculated columns
    {
      sheetName: 'Engagement',
      column: 'N', // Session efficiency
      formula: '=IF(F2>0,L2/F2*10,0)',
      description: 'Engagement efficiency score'
    }
  ];
  
  return calculatedColumns;
}

function getSheetId(sheetName) {
  const sheetIds = {
    'Users': 0,
    'Lessons': 1,
    'Analytics': 2,
    'Engagement': 3,
    'Performance': 4
  };
  
  return sheetIds[sheetName] || 0;
}

function getCellRow(cellRef) {
  return parseInt(cellRef.match(/\d+/)[0]);
}

function getCellColumn(cellRef) {
  const letters = cellRef.match(/[A-Z]+/)[0];
  let column = 0;
  
  for (let i = 0; i < letters.length; i++) {
    column = column * 26 + (letters.charCodeAt(i) - 64);
  }
  
  return column;
}

function updateFormula(sheets, spreadsheetId, formulaName, newFormula) {
  const allFormulas = {
    ...USER_ANALYTICS_FORMULAS,
    ...LESSON_PERFORMANCE_FORMULAS,
    ...ENGAGEMENT_FORMULAS,
    ...PERFORMANCE_METRICS_FORMULAS
  };
  
  const formulaConfig = allFormulas[formulaName];
  if (!formulaConfig) {
    throw new Error(`Formula '${formulaName}' not found`);
  }
  
  const [sheetName, cellRef] = formulaConfig.cell.split('!');
  const range = `${sheetName}!${cellRef}`;
  
  return sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[newFormula]]
    }
  });
}

function getFormulasByCategory(category) {
  const categories = {
    'user_analytics': USER_ANALYTICS_FORMULAS,
    'lesson_performance': LESSON_PERFORMANCE_FORMULAS,
    'engagement': ENGAGEMENT_FORMULAS,
    'performance_metrics': PERFORMANCE_METRICS_FORMULAS
  };
  
  return categories[category] || {};
}

module.exports = {
  USER_ANALYTICS_FORMULAS,
  LESSON_PERFORMANCE_FORMULAS,
  ENGAGEMENT_FORMULAS,
  PERFORMANCE_METRICS_FORMULAS,
  applyFormula,
  applyAllFormulas,
  createCalculatedColumns,
  updateFormula,
  getFormulasByCategory,
  getSheetId,
  getCellRow,
  getCellColumn
};
