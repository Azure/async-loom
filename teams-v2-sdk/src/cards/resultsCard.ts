import { DesignTokens, FluentIcons, ModernColors } from './designSystem';

export function createResultsCard(sessionData: any, results: any) {
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
                    color: "Good",
                    horizontalAlignment: "Center"
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Task Completed Successfully!",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: "Good"
                  },
                  {
                    type: "TextBlock",
                    text: `Session ${sessionData.id}`,
                    isSubtle: true,
                    spacing: DesignTokens.spacing.none
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      },
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
                    text: "📋",
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
                    text: "Task Summary",
                    weight: DesignTokens.typography.weights.bold,
                    color: "Accent"
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.large
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Task:",
            value: sessionData.task || "No description"
          },
          {
            title: "Duration:",
            value: results.duration || "N/A"
          },
          {
            title: "Completed:",
            value: sessionData.completed_at ? new Date(sessionData.completed_at).toLocaleString() : "Just now"
          },
          {
            title: "Files Modified:",
            value: results.filesModified?.length?.toString() || "0"
          },
          {
            title: "Lines Changed:",
            value: results.linesChanged?.toString() || "N/A"
          }
        ],
        spacing: "Medium"
      },
      ...(results.codeChanges && results.codeChanges.length > 0 ? [
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
                      text: FluentIcons.code,
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
                      text: "Code Changes",
                      weight: DesignTokens.typography.weights.bold,
                      color: "Accent"
                    }
                  ]
                }
              ]
            }
          ],
          spacing: DesignTokens.spacing.large
        },
        ...results.codeChanges.slice(0, 3).map((change: any) => ({
          type: "Container",
          style: "emphasis",
          spacing: "Medium",
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
                      text: getChangeTypeIcon(change.type),
                      size: "Medium"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: change.file || "Unknown file",
                      weight: "Bolder",
                      size: "Small"
                    },
                    {
                      type: "TextBlock",
                      text: change.description || "No description",
                      wrap: true,
                      size: "Small",
                      spacing: "None"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: `+${change.additions || 0}/-${change.deletions || 0}`,
                      size: "Small",
                      color: "Good",
                      horizontalAlignment: "Right"
                    }
                  ]
                }
              ]
            }
          ]
        }))
      ] : []),
      ...(results.filesModified && results.filesModified.length > 0 ? [
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
                      text: FluentIcons.folder,
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
                      text: "Files Modified",
                      weight: DesignTokens.typography.weights.bold,
                      color: "Accent"
                    }
                  ]
                }
              ]
            }
          ],
          spacing: DesignTokens.spacing.large
        },
        {
          type: "Container",
          style: "emphasis",
          spacing: "Medium",
          items: results.filesModified.slice(0, 5).map((file: any) => ({
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: getFileTypeIcon(file.name),
                    size: "Small"
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: file.name || "Unknown file",
                    size: "Small",
                    weight: "Bolder"
                  }
                ]
              },
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: file.status || "modified",
                    size: "Small",
                    color: getFileStatusColor(file.status),
                    horizontalAlignment: "Right"
                  }
                ]
              }
            ]
          }))
        }
      ] : []),
      ...(results.externalLinks && results.externalLinks.length > 0 ? [
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
                      text: FluentIcons.link,
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
                      text: "External Links",
                      weight: DesignTokens.typography.weights.bold,
                      color: "Accent"
                    }
                  ]
                }
              ]
            }
          ],
          spacing: DesignTokens.spacing.large
        },
        {
          type: "Container",
          style: "emphasis",
          spacing: "Medium",
          items: results.externalLinks.map((link: any) => ({
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: getLinkTypeIcon(link.type),
                    size: "Small"
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: `[${link.title || link.url}](${link.url})`,
                    size: "Small"
                  },
                  {
                    type: "TextBlock",
                    text: link.description || "",
                    size: "Small",
                    isSubtle: true,
                    spacing: "None"
                  }
                ]
              }
            ]
          }))
        }
      ] : []),
      ...(results.summary ? [
        {
          type: "TextBlock",
          text: "📝 **Summary**",
          weight: "Bolder",
          spacing: "Large"
        },
        {
          type: "TextBlock",
          text: results.summary,
          wrap: true,
          spacing: "Medium"
        }
      ] : [])
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "📊 View Details",
        data: { 
          action: "view_detailed_results",
          sessionId: sessionData.id
        }
      },
      ...(results.externalLinks?.some((link: any) => link.type === 'github_pr') ? [{
        type: "Action.OpenUrl",
        title: "🔗 View GitHub PR",
        url: results.externalLinks.find((link: any) => link.type === 'github_pr')?.url
      }] : []),
      ...(results.externalLinks?.some((link: any) => link.type === 'deployment') ? [{
        type: "Action.OpenUrl",
        title: "🚀 View Deployment",
        url: results.externalLinks.find((link: any) => link.type === 'deployment')?.url
      }] : []),
      {
        type: "Action.Submit",
        title: `${FluentIcons.download} Download Results`,
        data: { 
          action: "download_results",
          sessionId: sessionData.id
        }
      },
      {
        type: "Action.Submit",
        title: "🚀 Create New Task",
        data: { action: "create_new_task" }
      },
      {
        type: "Action.Submit",
        title: `${FluentIcons.home} Back to Menu`,
        data: { action: "show_help" }
      }
    ]
  };
}

export function createResultsSummaryCard(sessions: any[]) {
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalFiles = completedSessions.reduce((sum, s) => sum + (s.results?.filesModified?.length || 0), 0);
  const totalLines = completedSessions.reduce((sum, s) => sum + (s.results?.linesChanged || 0), 0);

  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "📈 **Results Summary**",
        weight: "Bolder",
        size: "Large",
        color: "Accent"
      },
      {
        type: "TextBlock",
        text: "Overview of your completed coding tasks",
        isSubtle: true,
        spacing: "Medium"
      },
      {
        type: "ColumnSet",
        spacing: "Large",
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: completedSessions.length.toString(),
                size: "ExtraLarge",
                weight: "Bolder",
                color: "Good",
                horizontalAlignment: "Center"
              },
              {
                type: "TextBlock",
                text: "Tasks Completed",
                size: "Small",
                horizontalAlignment: "Center",
                spacing: "None"
              }
            ]
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: totalFiles.toString(),
                size: "ExtraLarge",
                weight: "Bolder",
                color: "Accent",
                horizontalAlignment: "Center"
              },
              {
                type: "TextBlock",
                text: "Files Modified",
                size: "Small",
                horizontalAlignment: "Center",
                spacing: "None"
              }
            ]
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: totalLines.toString(),
                size: "ExtraLarge",
                weight: "Bolder",
                color: "Warning",
                horizontalAlignment: "Center"
              },
              {
                type: "TextBlock",
                text: "Lines Changed",
                size: "Small",
                horizontalAlignment: "Center",
                spacing: "None"
              }
            ]
          }
        ]
      },
      ...(completedSessions.length > 0 ? [
        {
          type: "TextBlock",
          text: "🏆 **Recent Completions**",
          weight: "Bolder",
          spacing: "Large"
        },
        ...completedSessions.slice(0, 3).map(session => ({
          type: "ColumnSet",
          spacing: "Medium",
          separator: true,
          columns: [
            {
              type: "Column",
              width: "auto",
              items: [
                {
                  type: "TextBlock",
                  text: "✅",
                  size: "Medium",
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
                  text: session.task || "No description",
                  weight: "Bolder",
                  size: "Small",
                  maxLines: 1
                },
                {
                  type: "TextBlock",
                  text: session.completed_at ? new Date(session.completed_at).toLocaleDateString() : "Recently",
                  size: "Small",
                  isSubtle: true,
                  spacing: "None"
                }
              ]
            },
            {
              type: "Column",
              width: "auto",
              items: [
                {
                  type: "TextBlock",
                  text: `${session.results?.filesModified?.length || 0} files`,
                  size: "Small",
                  horizontalAlignment: "Right"
                }
              ]
            }
          ],
          selectAction: {
            type: "Action.Submit",
            data: {
              action: "view_detailed_results",
              sessionId: session.id
            }
          }
        }))
      ] : [])
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "📊 View All Results",
        data: { action: "view_all_results" }
      },
      {
        type: "Action.Submit",
        title: "📈 Export Report",
        data: { action: "export_results_report" }
      },
      {
        type: "Action.Submit",
        title: "🚀 Create New Task",
        data: { action: "create_new_task" }
      }
    ]
  };
}

function getChangeTypeIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'added': '➕',
    'modified': '✏️',
    'deleted': '🗑️',
    'renamed': '📝',
    'moved': '📁'
  };
  return icons[type] || '📄';
}

function getFileTypeIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: { [key: string]: string } = {
    'js': '🟨',
    'ts': '🔷',
    'jsx': '⚛️',
    'tsx': '⚛️',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'md': '📝',
    'yml': '⚙️',
    'yaml': '⚙️'
  };
  return icons[ext || ''] || '📄';
}

function getFileStatusColor(status: string): string {
  return ModernColors.fileStatus[status as keyof typeof ModernColors.fileStatus] || 'Default';
}

function getLinkTypeIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'github_pr': '🔀',
    'deployment': '🚀',
    'documentation': '📚',
    'demo': '🎬',
    'repository': '📦'
  };
  return icons[type] || '🔗';
}
