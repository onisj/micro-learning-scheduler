/**
 * Charts Configuration for Google Sheets Dashboard
 * Defines chart specifications for analytics and engagement visualization
 */

/**
 * User Analytics Charts Configuration
 */
const USER_ANALYTICS_CHARTS = {
  // User Registration Trend Chart
  registrationTrend: {
    type: 'LINE_CHART',
    title: 'User Registration Trend',
    subtitle: 'Daily user registrations over time',
    sourceRange: 'Analytics!A1:B30', // Date and Registration Count
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 0,
          rowIndex: 1,
          columnIndex: 4
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 600,
        heightPixels: 371
      }
    },
    basicChart: {
      chartType: 'LINE',
      legendPosition: 'BOTTOM_LEGEND',
      axis: [
        {
          position: 'BOTTOM_AXIS',
          title: 'Date'
        },
        {
          position: 'LEFT_AXIS',
          title: 'Number of Registrations'
        }
      ],
      domains: [
        {
          domain: {
            sourceRange: {
              sources: [
                {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: 30,
                  startColumnIndex: 0,
                  endColumnIndex: 1
                }
              ]
            }
          }
        }
      ],
      series: [
        {
          series: {
            sourceRange: {
              sources: [
                {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: 30,
                  startColumnIndex: 1,
                  endColumnIndex: 2
                }
              ]
            }
          },
          targetAxis: 'LEFT_AXIS'
        }
      ]
    }
  },

  // Completion Rate by Learning Format
  completionByFormat: {
    type: 'PIE_CHART',
    title: 'Completion Rate by Learning Format',
    subtitle: 'Distribution of completion rates across different learning formats',
    sourceRange: 'Analytics!D1:E10',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 0,
          rowIndex: 1,
          columnIndex: 11
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 400,
        heightPixels: 300
      }
    },
    pieChart: {
      legendPosition: 'LABELED_LEGEND',
      pieHole: 0.4,
      domain: {
        sourceRange: {
          sources: [
            {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 10,
              startColumnIndex: 3,
              endColumnIndex: 4
            }
          ]
        }
      },
      series: {
        sourceRange: {
          sources: [
            {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 10,
              startColumnIndex: 4,
              endColumnIndex: 5
            }
          ]
        }
      }
    }
  },

  // Weekly Engagement Score Trend
  weeklyEngagement: {
    type: 'COLUMN_CHART',
    title: 'Weekly Engagement Score Trend',
    subtitle: 'Average engagement scores by week',
    sourceRange: 'Analytics!G1:H20',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 0,
          rowIndex: 20,
          columnIndex: 4
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 600,
        heightPixels: 371
      }
    },
    basicChart: {
      chartType: 'COLUMN',
      legendPosition: 'BOTTOM_LEGEND',
      axis: [
        {
          position: 'BOTTOM_AXIS',
          title: 'Week'
        },
        {
          position: 'LEFT_AXIS',
          title: 'Average Engagement Score'
        }
      ],
      domains: [
        {
          domain: {
            sourceRange: {
              sources: [
                {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: 20,
                  startColumnIndex: 6,
                  endColumnIndex: 7
                }
              ]
            }
          }
        }
      ],
      series: [
        {
          series: {
            sourceRange: {
              sources: [
                {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: 20,
                  startColumnIndex: 7,
                  endColumnIndex: 8
                }
              ]
            }
          },
          targetAxis: 'LEFT_AXIS'
        }
      ]
    }
  }
};

/**
 * Lesson Performance Charts Configuration
 */
const LESSON_PERFORMANCE_CHARTS = {
  // Lesson Completion Rate by Content Type
  completionByContentType: {
    type: 'BAR_CHART',
    title: 'Lesson Completion Rate by Content Type',
    subtitle: 'Completion rates across different content types',
    sourceRange: 'Lessons!J1:K10',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 1,
          rowIndex: 1,
          columnIndex: 13
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 500,
        heightPixels: 300
      }
    },
    basicChart: {
      chartType: 'BAR',
      legendPosition: 'BOTTOM_LEGEND',
      axis: [
        {
          position: 'BOTTOM_AXIS',
          title: 'Completion Rate (%)'
        },
        {
          position: 'LEFT_AXIS',
          title: 'Content Type'
        }
      ]
    }
  },

  // Daily Lesson Delivery Trend
  dailyDeliveryTrend: {
    type: 'AREA_CHART',
    title: 'Daily Lesson Delivery Trend',
    subtitle: 'Number of lessons delivered per day',
    sourceRange: 'Lessons!M1:N30',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 1,
          rowIndex: 20,
          columnIndex: 13
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 600,
        heightPixels: 300
      }
    },
    basicChart: {
      chartType: 'AREA',
      legendPosition: 'BOTTOM_LEGEND',
      stackedType: 'NOT_STACKED'
    }
  }
};

/**
 * Engagement Analytics Charts Configuration
 */
const ENGAGEMENT_CHARTS = {
  // Interaction Type Distribution
  interactionDistribution: {
    type: 'DONUT_CHART',
    title: 'User Interaction Type Distribution',
    subtitle: 'Breakdown of user interactions with lessons',
    sourceRange: 'Engagement!F1:G10',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 2,
          rowIndex: 1,
          columnIndex: 9
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 400,
        heightPixels: 400
      }
    },
    pieChart: {
      legendPosition: 'RIGHT_LEGEND',
      pieHole: 0.6
    }
  },

  // Hourly Engagement Pattern
  hourlyEngagement: {
    type: 'LINE_CHART',
    title: 'Hourly Engagement Pattern',
    subtitle: 'User engagement throughout the day',
    sourceRange: 'Engagement!I1:J25',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 2,
          rowIndex: 25,
          columnIndex: 9
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 600,
        heightPixels: 300
      }
    },
    basicChart: {
      chartType: 'LINE',
      legendPosition: 'BOTTOM_LEGEND'
    }
  },

  // Device Type Usage
  deviceTypeUsage: {
    type: 'COLUMN_CHART',
    title: 'Device Type Usage',
    subtitle: 'Lesson access by device type',
    sourceRange: 'Engagement!L1:M8',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 2,
          rowIndex: 1,
          columnIndex: 15
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 400,
        heightPixels: 300
      }
    },
    basicChart: {
      chartType: 'COLUMN',
      legendPosition: 'BOTTOM_LEGEND'
    }
  }
};

/**
 * Performance Metrics Charts Configuration
 */
const PERFORMANCE_METRICS_CHARTS = {
  // Overall System Performance
  systemPerformance: {
    type: 'COMBO_CHART',
    title: 'System Performance Overview',
    subtitle: 'Key performance indicators over time',
    sourceRange: 'Performance!A1:E30',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 3,
          rowIndex: 1,
          columnIndex: 7
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 800,
        heightPixels: 400
      }
    },
    basicChart: {
      chartType: 'COMBO',
      legendPosition: 'BOTTOM_LEGEND',
      axis: [
        {
          position: 'BOTTOM_AXIS',
          title: 'Date'
        },
        {
          position: 'LEFT_AXIS',
          title: 'Count'
        },
        {
          position: 'RIGHT_AXIS',
          title: 'Percentage'
        }
      ]
    }
  },

  // User Satisfaction Trend
  satisfactionTrend: {
    type: 'SCATTER_CHART',
    title: 'User Satisfaction Trend',
    subtitle: 'Engagement score vs completion rate correlation',
    sourceRange: 'Performance!G1:H100',
    position: {
      overlayPosition: {
        anchorCell: {
          sheetId: 3,
          rowIndex: 25,
          columnIndex: 7
        },
        offsetXPixels: 0,
        offsetYPixels: 0,
        widthPixels: 500,
        heightPixels: 300
      }
    },
    basicChart: {
      chartType: 'SCATTER',
      legendPosition: 'BOTTOM_LEGEND'
    }
  }
};

/**
 * Chart creation helper functions
 */
function createChart(sheets, spreadsheetId, chartConfig) {
  const request = {
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          addChart: {
            chart: chartConfig
          }
        }
      ]
    }
  };
  
  return sheets.spreadsheets.batchUpdate(request);
}

function createAllCharts(sheets, spreadsheetId) {
  const allCharts = [
    ...Object.values(USER_ANALYTICS_CHARTS),
    ...Object.values(LESSON_PERFORMANCE_CHARTS),
    ...Object.values(ENGAGEMENT_CHARTS),
    ...Object.values(PERFORMANCE_METRICS_CHARTS)
  ];
  
  const requests = allCharts.map(chart => ({
    addChart: {
      chart: chart
    }
  }));
  
  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: {
      requests: requests
    }
  });
}

function updateChartData(sheets, spreadsheetId, chartId, newRange) {
  const request = {
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          updateChartSpec: {
            chartId: chartId,
            spec: {
              basicChart: {
                domains: [
                  {
                    domain: {
                      sourceRange: {
                        sources: [{
                          sheetId: 0,
                          startRowIndex: newRange.startRow,
                          endRowIndex: newRange.endRow,
                          startColumnIndex: newRange.startCol,
                          endColumnIndex: newRange.endCol
                        }]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  };
  
  return sheets.spreadsheets.batchUpdate(request);
}

function deleteChart(sheets, spreadsheetId, chartId) {
  const request = {
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          deleteEmbeddedObject: {
            objectId: chartId
          }
        }
      ]
    }
  };
  
  return sheets.spreadsheets.batchUpdate(request);
}

/**
 * Get chart configuration by name
 */
function getChartConfig(chartName) {
  const allCharts = {
    ...USER_ANALYTICS_CHARTS,
    ...LESSON_PERFORMANCE_CHARTS,
    ...ENGAGEMENT_CHARTS,
    ...PERFORMANCE_METRICS_CHARTS
  };
  
  return allCharts[chartName] || null;
}

/**
 * Get all chart configurations for a specific category
 */
function getChartsByCategory(category) {
  const categories = {
    'user_analytics': USER_ANALYTICS_CHARTS,
    'lesson_performance': LESSON_PERFORMANCE_CHARTS,
    'engagement': ENGAGEMENT_CHARTS,
    'performance_metrics': PERFORMANCE_METRICS_CHARTS
  };
  
  return categories[category] || {};
}

module.exports = {
  USER_ANALYTICS_CHARTS,
  LESSON_PERFORMANCE_CHARTS,
  ENGAGEMENT_CHARTS,
  PERFORMANCE_METRICS_CHARTS,
  createChart,
  createAllCharts,
  updateChartData,
  deleteChart,
  getChartConfig,
  getChartsByCategory
};
