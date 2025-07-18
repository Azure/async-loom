import { DesignTokens, FluentIcons } from './designSystem';

export function createTaskCreationCard() {
  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "Container",
        style: "emphasis",
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: "🚀",
                    size: DesignTokens.typography.sizes.extraLarge
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Create Coding Task",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: "Accent"
                  },
                  {
                    type: "TextBlock",
                    text: "Describe your coding task and let our AI agents help you build it!",
                    wrap: true,
                    spacing: DesignTokens.spacing.small,
                    isSubtle: true
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: 2,
            items: [
              {
                type: "Input.Text",
                id: "taskDescription",
                label: "Task Description",
                placeholder: "e.g., Create a React component for a todo list with drag and drop functionality",
                isMultiline: true,
                maxLength: 1000,
                isRequired: true,
                errorMessage: "Please provide a detailed description of your coding task"
              },
              {
                type: "Input.ChoiceSet",
                id: "taskType",
                label: "Task Type",
                isRequired: true,
                errorMessage: "Please select a task type",
                choices: [
                  {
                    title: "🌐 Web Development",
                    value: "web"
                  },
                  {
                    title: "📱 Mobile App",
                    value: "mobile"
                  },
                  {
                    title: "🔧 API Development",
                    value: "api"
                  },
                  {
                    title: "🗄️ Database Design",
                    value: "database"
                  },
                  {
                    title: "🤖 AI/ML Integration",
                    value: "ai"
                  },
                  {
                    title: "🔒 Security Implementation",
                    value: "security"
                  },
                  {
                    title: "⚡ Performance Optimization",
                    value: "performance"
                  },
                  {
                    title: "🧪 Testing & QA",
                    value: "testing"
                  },
                  {
                    title: "📊 Data Analysis",
                    value: "data"
                  },
                  {
                    title: "🔄 DevOps & CI/CD",
                    value: "devops"
                  },
                  {
                    title: "🛠️ General Development",
                    value: "general"
                  }
                ]
              },
              {
                type: "Input.ChoiceSet",
                id: "priority",
                label: "Priority Level",
                value: "medium",
                choices: [
                  {
                    title: "🔴 High Priority",
                    value: "high"
                  },
                  {
                    title: "🟡 Medium Priority",
                    value: "medium"
                  },
                  {
                    title: "🟢 Low Priority",
                    value: "low"
                  }
                ]
              },
              {
                type: "Input.ChoiceSet",
                id: "complexity",
                label: "Expected Complexity",
                value: "medium",
                choices: [
                  {
                    title: "🟢 Simple (1-2 hours)",
                    value: "simple"
                  },
                  {
                    title: "🟡 Medium (2-8 hours)",
                    value: "medium"
                  },
                  {
                    title: "🔴 Complex (8+ hours)",
                    value: "complex"
                  }
                ]
              }
            ]
          },
          {
            type: "Column",
            width: 1,
            items: [
              {
                type: "Image",
                url: "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Fluent%20System%20Icons.png",
                altText: "Coding illustration",
                size: "Auto",
                spacing: "Medium"
              },
              {
                type: "Container",
                style: "good",
                items: [
                  {
                    type: "ColumnSet",
                    columns: [
                      {
                        type: "Column",
                        width: "auto",
                        items: [
                          {
                            type: "TextBlock",
                            text: "💡",
                            size: DesignTokens.typography.sizes.medium
                          }
                        ]
                      },
                      {
                        type: "Column",
                        width: "stretch",
                        items: [
                          {
                            type: "TextBlock",
                            text: "Tips for better results",
                            weight: DesignTokens.typography.weights.bold,
                            color: "Good"
                          }
                        ]
                      }
                    ]
                  }
                ],
                spacing: DesignTokens.spacing.large
              },
              {
                type: "TextBlock",
                text: "• Be specific about requirements\n• Mention preferred technologies\n• Include any constraints or limitations\n• Describe the expected outcome",
                wrap: true,
                spacing: "Small",
                size: "Small"
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "🔍 Preview Task",
        data: { action: "preview_task" }
      },
      {
        type: "Action.Submit",
        title: `${FluentIcons.create} Create Task`,
        data: { action: "create_task" }
      },
      {
        type: "Action.Submit",
        title: "❌ Cancel",
        data: { action: "cancel_task" }
      }
    ]
  };
}

export function createTaskPreviewCard(taskData: any) {
  const complexityIcon = taskData.complexity === 'simple' ? '🟢' :
                        taskData.complexity === 'medium' ? '🟡' : '🔴';

  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "Container",
        style: "emphasis",
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: "🔍",
                    size: DesignTokens.typography.sizes.extraLarge
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Task Preview",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: "Accent"
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
      {
        type: "TextBlock",
        text: "Review your task details before submission:",
        wrap: true,
        spacing: "Medium",
        isSubtle: true
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Task Type:",
            value: getTaskTypeDisplay(taskData.taskType)
          },
          {
            title: "Priority:",
            value: `${getPriorityIcon(taskData.priority)} ${taskData.priority?.toUpperCase() || 'MEDIUM'}`
          },
          {
            title: "Complexity:",
            value: `${complexityIcon} ${taskData.complexity?.toUpperCase() || 'MEDIUM'}`
          }
        ],
        spacing: "Medium"
      },
      {
        type: "Container",
        style: "default",
        items: [
          {
            type: "TextBlock",
            text: "Task Description",
            weight: DesignTokens.typography.weights.bold,
            color: "Accent"
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
      {
        type: "TextBlock",
        text: taskData.taskDescription || "No description provided",
        wrap: true,
        spacing: "Small",
        style: "emphasis"
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "✅ Confirm & Create",
        data: { 
          action: "confirm_create_task",
          taskDescription: taskData.taskDescription,
          taskType: taskData.taskType,
          priority: taskData.priority,
          complexity: taskData.complexity
        }
      },
      {
        type: "Action.Submit",
        title: "✏️ Edit Task",
        data: { action: "edit_task" }
      },
      {
        type: "Action.Submit",
        title: "❌ Cancel",
        data: { action: "cancel_task" }
      }
    ]
  };
}

export function createTaskSuccessCard(sessionData: any) {
  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "Container",
        style: "good",
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: FluentIcons.success,
                    size: DesignTokens.typography.sizes.extraLarge,
                    color: "Good"
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Task Created Successfully!",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: "Good"
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
      {
        type: "TextBlock",
        text: "Your coding task has been submitted to Devin and is now being processed.",
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Session ID:",
            value: sessionData.id || "N/A"
          },
          {
            title: "Status:",
            value: sessionData.status || "Starting"
          },
          {
            title: "Created:",
            value: sessionData.created_at ? new Date(sessionData.created_at).toLocaleString() : "Just now"
          }
        ],
        spacing: "Medium"
      },
      {
        type: "Container",
        style: "emphasis",
        items: [
          {
            type: "TextBlock",
            text: "Next Steps",
            weight: DesignTokens.typography.weights.bold,
            color: "Accent"
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
      {
        type: "TextBlock",
        text: "• Monitor progress with `/devin-status " + (sessionData.id || "session-id") + "`\n• Send messages with `/devin-message " + (sessionData.id || "session-id") + " <message>`\n• Check back periodically for updates",
        wrap: true,
        spacing: "Small"
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "📊 Check Status",
        data: { 
          action: "check_status",
          sessionId: sessionData.id
        }
      },
      {
        type: "Action.Submit",
        title: "🚀 Create Another Task",
        data: { action: "create_new_task" }
      }
    ]
  };
}

function getTaskTypeDisplay(taskType: string): string {
  const taskTypes: { [key: string]: string } = {
    'web': '🌐 Web Development',
    'mobile': '📱 Mobile App',
    'api': '🔧 API Development',
    'database': '🗄️ Database Design',
    'ai': '🤖 AI/ML Integration',
    'security': '🔒 Security Implementation',
    'performance': '⚡ Performance Optimization',
    'testing': '🧪 Testing & QA',
    'data': '📊 Data Analysis',
    'devops': '🔄 DevOps & CI/CD',
    'general': '🛠️ General Development'
  };
  return taskTypes[taskType] || '🛠️ General Development';
}

function getPriorityIcon(priority: string): string {
  const icons: { [key: string]: string } = {
    'high': '🔴',
    'medium': '🟡',
    'low': '🟢'
  };
  return icons[priority] || '🟡';
}
