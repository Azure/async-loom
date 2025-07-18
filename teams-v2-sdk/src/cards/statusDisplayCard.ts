import { DesignTokens, FluentIcons, ModernColors } from './designSystem';

interface DevinSession {
  id: string;
  status: string;
  task: string;
  created_at: string;
  updated_at?: string;
  progress?: number;
  error?: string;
  logs?: string[];
}

function validateSessionData(sessionData: any): DevinSession {
  if (!sessionData || typeof sessionData !== 'object') {
    throw new Error('Session data is required and must be an object');
  }
  
  if (!sessionData.id || typeof sessionData.id !== 'string') {
    throw new Error('Session ID is required and must be a string');
  }
  
  if (!sessionData.status || typeof sessionData.status !== 'string') {
    throw new Error('Session status is required and must be a string');
  }
  
  if (!sessionData.task || typeof sessionData.task !== 'string') {
    throw new Error('Session task is required and must be a string');
  }
  
  if (!sessionData.created_at || typeof sessionData.created_at !== 'string') {
    throw new Error('Session created_at is required and must be a string');
  }
  
  return {
    id: sessionData.id,
    status: sessionData.status,
    task: sessionData.task,
    created_at: sessionData.created_at,
    updated_at: sessionData.updated_at,
    progress: typeof sessionData.progress === 'number' ? sessionData.progress : undefined,
    error: typeof sessionData.error === 'string' ? sessionData.error : undefined,
    logs: Array.isArray(sessionData.logs) ? sessionData.logs : undefined
  };
}

export function createStatusDisplayCard(sessionData: any) {
  const validatedSession = validateSessionData(sessionData);
  const statusColor = getStatusColor(validatedSession.status);
  const statusIcon = getStatusIcon(validatedSession.status);
  
  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "Container",
        style: getContainerStyle(validatedSession.status),
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
                    text: statusIcon,
                    size: DesignTokens.typography.sizes.extraLarge,
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
                    text: "Session Status",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: statusColor
                  },
                  {
                    type: "TextBlock",
                    text: `Session ${validatedSession.id}`,
                    isSubtle: true,
                    spacing: DesignTokens.spacing.none
                  }
                ]
              },
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: validatedSession.status.toUpperCase(),
                    weight: DesignTokens.typography.weights.bold,
                    color: statusColor,
                    horizontalAlignment: "Right"
                  },
                  {
                    type: "TextBlock",
                    text: getStatusDescription(validatedSession.status),
                    size: DesignTokens.typography.sizes.small,
                    isSubtle: true,
                    horizontalAlignment: "Right",
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
        type: "FactSet",
        facts: [
          {
            title: "Session ID:",
            value: validatedSession.id
          },
          {
            title: "Task:",
            value: validatedSession.task
          },
          {
            title: "Status:",
            value: validatedSession.status
          },
          {
            title: "Created:",
            value: new Date(validatedSession.created_at).toLocaleString()
          },
          {
            title: "Last Updated:",
            value: validatedSession.updated_at ? new Date(validatedSession.updated_at).toLocaleString() : "N/A"
          },
          ...(validatedSession.progress !== undefined ? [{
            title: "Progress:",
            value: `${validatedSession.progress}%`
          }] : [])
        ],
        spacing: "Medium"
      },
      ...(validatedSession.error ? [{
        type: "Container",
        style: "attention",
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
                    text: FluentIcons.warning,
                    size: DesignTokens.typography.sizes.medium,
                    color: "Attention"
                  }
                ]
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Error Details",
                    weight: DesignTokens.typography.weights.bold,
                    color: "Attention"
                  },
                  {
                    type: "TextBlock",
                    text: validatedSession.error,
                    wrap: true,
                    color: "Attention",
                    spacing: DesignTokens.spacing.small
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      }] : []),
      ...(validatedSession.logs && validatedSession.logs.length > 0 ? [{
        type: "TextBlock",
        text: "📝 **Recent Activity:**",
        weight: "Bolder",
        spacing: "Medium"
      }, {
        type: "TextBlock",
        text: validatedSession.logs.slice(-3).join('\n'),
        wrap: true,
        spacing: "Small",
        fontType: "Monospace"
      }] : [])
    ],
    actions: [
      {
        type: "Action.Submit",
        title: `${FluentIcons.refresh} Refresh Status`,
        data: { 
          action: "refresh_status",
          sessionId: validatedSession.id
        }
      },
      ...(validatedSession.status === 'running' ? [{
        type: "Action.Submit",
        title: "💬 Send Message",
        data: { 
          action: "send_message",
          sessionId: validatedSession.id
        }
      }] : []),
      ...(validatedSession.status === 'running' ? [{
        type: "Action.Submit",
        title: "⏹️ Cancel Session",
        data: { 
          action: "cancel_session",
          sessionId: validatedSession.id
        }
      }] : []),
      {
        type: "Action.Submit",
        title: "📋 View Logs",
        data: { 
          action: "view_logs",
          sessionId: validatedSession.id
        }
      },
      {
        type: "Action.Submit",
        title: `${FluentIcons.home} Back to Menu`,
        data: { action: "show_help" }
      }
    ]
  };
}

export function createSessionListCard(sessions: DevinSession[]) {
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
                    text: "📊",
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
                    text: "Your Devin Sessions",
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
        text: `You have ${sessions.length} session${sessions.length !== 1 ? 's' : ''}`,
        isSubtle: true,
        spacing: "Medium"
      },
      ...(sessions.length === 0 ? [{
        type: "TextBlock",
        text: "No sessions found. Create your first session with `/devin <task>`",
        wrap: true,
        spacing: "Medium",
        horizontalAlignment: "Center"
      }] : sessions.slice(0, 5).map(session => ({
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
                text: getStatusIcon(session.status),
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
                text: session.id,
                weight: "Bolder",
                size: "Small"
              },
              {
                type: "TextBlock",
                text: session.task || "No description",
                wrap: true,
                maxLines: 2,
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
                text: session.status?.toUpperCase() || "UNKNOWN",
                weight: "Bolder",
                color: getStatusColor(session.status),
                size: "Small",
                horizontalAlignment: "Right"
              },
              {
                type: "TextBlock",
                text: session.created_at ? new Date(session.created_at).toLocaleDateString() : "Unknown",
                size: "Small",
                isSubtle: true,
                horizontalAlignment: "Right",
                spacing: "None"
              }
            ]
          }
        ],
        selectAction: {
          type: "Action.Submit",
          data: {
            action: "view_session_status",
            sessionId: session.id
          }
        }
      })))
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "🚀 Create New Session",
        data: { action: "create_new_task" }
      },
      ...(sessions.length > 5 ? [{
        type: "Action.Submit",
        title: "📋 View All Sessions",
        data: { action: "view_all_sessions" }
      }] : []),
      {
        type: "Action.Submit",
        title: "🔄 Refresh List",
        data: { action: "refresh_session_list" }
      }
    ]
  };
}

export function createMessageInputCard(sessionId: string) {
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
                    text: "💬",
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
                    text: "Send Message to Devin",
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
        text: `Session: ${sessionId}`,
        isSubtle: true,
        spacing: "Medium"
      },
      {
        type: "Input.Text",
        id: "message",
        label: "Your Message",
        placeholder: "Type your message to Devin here...",
        isMultiline: true,
        maxLength: 2000,
        isRequired: true,
        errorMessage: "Please enter a message to send"
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: `${FluentIcons.upload} Send Message`,
        data: { 
          action: "send_message_submit",
          sessionId: sessionId
        }
      },
      {
        type: "Action.Submit",
        title: "❌ Cancel",
        data: { 
          action: "view_session_status",
          sessionId: sessionId
        }
      }
    ]
  };
}

function getStatusColor(status: string): string {
  return ModernColors.status[status?.toLowerCase() as keyof typeof ModernColors.status] || 'Default';
}

function getStatusIcon(status: string): string {
  const icons: { [key: string]: string } = {
    'running': FluentIcons.running,
    'completed': FluentIcons.success,
    'failed': FluentIcons.error,
    'cancelled': FluentIcons.cancelled,
    'pending': FluentIcons.pending
  };
  return icons[status?.toLowerCase()] || '❓';
}

function getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    'running': 'In Progress',
    'completed': 'Finished',
    'failed': 'Error',
    'cancelled': 'Stopped',
    'pending': 'Waiting'
  };
  return descriptions[status?.toLowerCase()] || 'Unknown';
}

function getContainerStyle(status: string): string {
  const styles: { [key: string]: string } = {
    'completed': 'good',
    'failed': 'attention',
    'cancelled': 'warning',
    'running': 'emphasis',
    'pending': 'emphasis'
  };
  return styles[status?.toLowerCase()] || 'default';
}
