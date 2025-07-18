import { DesignTokens, FluentIcons } from './designSystem';

export function createHelpCard() {
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
                    text: FluentIcons.devin,
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
                    text: "Coding Agent Teams App",
                    weight: DesignTokens.typography.weights.bold,
                    size: DesignTokens.typography.sizes.large,
                    color: "Accent"
                  },
                  {
                    type: "TextBlock",
                    text: "Interact with AI coding agents like Devin directly from Microsoft Teams!",
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
        type: "Container",
        style: "default",
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
                    text: "Available Commands",
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
                    text: FluentIcons.settings,
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
                    text: "**Configuration**",
                    weight: "Bolder",
                    size: "Small"
                  },
                  {
                    type: "TextBlock",
                    text: "`/config` - Configure your API keys and tokens",
                    size: "Small",
                    spacing: "None"
                  }
                ]
              }
            ]
          },
          {
            type: "ColumnSet",
            spacing: "Medium",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: FluentIcons.devin,
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
                    text: "**Devin Commands**",
                    weight: "Bolder",
                    size: "Small"
                  },
                  {
                    type: "TextBlock",
                    text: "`/devin` - Create a new coding task with rich dialog\n`/devin-status <session-id>` - Check session status\n`/devin-message <session-id> <message>` - Send message to Devin",
                    size: "Small",
                    spacing: "None"
                  }
                ]
              }
            ]
          },
          {
            type: "ColumnSet",
            spacing: "Medium",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "TextBlock",
                    text: FluentIcons.github,
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
                    text: "**GitHub Commands**",
                    weight: "Bolder",
                    size: "Small"
                  },
                  {
                    type: "TextBlock",
                    text: "`/github <task>` - Copilot coding agent (preview)\n`/github-status <task-id>` - Check Copilot task status\n`/github-action <repo> <workflow> <task>` - Trigger GitHub Action",
                    size: "Small",
                    spacing: "None"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: "Container",
        style: "default",
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
                    text: "🎯",
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
                    text: "Getting Started",
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
        style: "good",
        spacing: "Medium",
        items: [
          {
            type: "TextBlock",
            text: "**Step 1:** Get your API keys",
            weight: "Bolder",
            size: "Small"
          },
          {
            type: "TextBlock",
            text: "• Devin API key: [app.devin.ai/settings/api-keys](https://app.devin.ai/settings/api-keys)\n• GitHub token: [github.com/settings/tokens](https://github.com/settings/tokens)",
            size: "Small",
            spacing: "Small"
          },
          {
            type: "TextBlock",
            text: "**Step 2:** Configure your keys",
            weight: "Bolder",
            size: "Small",
            spacing: "Medium"
          },
          {
            type: "TextBlock",
            text: "Use the `/config` command to securely store your API keys",
            size: "Small",
            spacing: "Small"
          },
          {
            type: "TextBlock",
            text: "**Step 3:** Start coding!",
            weight: "Bolder",
            size: "Small",
            spacing: "Medium"
          },
          {
            type: "TextBlock",
            text: "Use `/devin` to create coding tasks with our rich dialog interface",
            size: "Small",
            spacing: "Small"
          }
        ]
      },
      {
        type: "Container",
        style: "default",
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
                    text: "Examples",
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
        style: "attention",
        spacing: "Medium",
        items: [
          {
            type: "TextBlock",
            text: "`/devin` → Opens rich task creation dialog\n`/devin-status session-123` → Shows detailed status card\n`/github Create a login system` → GitHub coding task (preview)",
            size: "Small",
            fontType: "Monospace"
          }
        ]
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: `${FluentIcons.settings} Configure Now`,
        data: { action: "show_config" }
      },
      {
        type: "Action.Submit",
        title: `${FluentIcons.create} Create Task`,
        data: { action: "create_new_task" }
      },
      {
        type: "Action.Submit",
        title: "📊 View Sessions",
        data: { action: "view_all_sessions" }
      },
      {
        type: "Action.OpenUrl",
        title: "📚 Learn More",
        url: "https://docs.devin.ai/api-reference/overview"
      }
    ]
  };
}
