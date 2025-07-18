import { DesignTokens, FluentIcons } from './designSystem';

export function createConfigurationCard(currentConfig?: { devinApiKey?: string; githubToken?: string; azureOpenAiApiKey?: string; azureOpenAiEndpoint?: string; githubRepo?: string }) {
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
                    text: FluentIcons.settings,
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
                    text: "Configuration Settings",
                    size: DesignTokens.typography.sizes.large,
                    weight: DesignTokens.typography.weights.bold,
                    color: "Accent"
                  },
                  {
                    type: "TextBlock",
                    text: "Configure your API keys and tokens to start using coding agents",
                    wrap: true,
                    isSubtle: true,
                    spacing: DesignTokens.spacing.small
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
                    text: "GitHub Copilot Configuration",
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
        type: "TextBlock",
        text: "Get your token from:",
        wrap: true,
        spacing: "Small"
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.OpenUrl",
            title: "🔗 Open GitHub Token Settings",
            url: "https://github.com/settings/tokens"
          }
        ],
        spacing: "Small"
      },
      {
        type: "Input.Text",
        id: "githubToken",
        label: "GitHub Copilot Token",
        placeholder: "Enter your GitHub token",
        value: currentConfig?.githubToken ? "••••••••••••••••" : "",
        spacing: "Small"
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
                    text: "🧠",
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
                    text: "Azure OpenAI Configuration (for Codex-CLI)",
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
        type: "TextBlock",
        text: "Get your API key from:",
        wrap: true,
        spacing: "Small"
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.OpenUrl",
            title: "🔗 Open Azure OpenAI Portal",
            url: "https://portal.azure.com/"
          }
        ],
        spacing: "Small"
      },
      {
        type: "Input.Text",
        id: "azureOpenAiApiKey",
        label: "Azure OpenAI API Key",
        placeholder: "Enter your Azure OpenAI API key",
        value: currentConfig?.azureOpenAiApiKey ? "••••••••••••••••" : "",
        spacing: "Small"
      },
      {
        type: "Input.Text",
        id: "azureOpenAiEndpoint",
        label: "Azure OpenAI Endpoint (Optional)",
        placeholder: "https://your-resource.openai.azure.com/",
        value: currentConfig?.azureOpenAiEndpoint || "",
        spacing: "Small"
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
                    text: "Repository Configuration",
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
        type: "Input.Text",
        id: "githubRepo",
        label: "GitHub Repository (for Codex-CLI)",
        placeholder: "owner/repository-name",
        value: currentConfig?.githubRepo || "",
        spacing: "Small"
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
                    text: "Devin API Configuration",
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
        type: "TextBlock",
        text: "Get your API key from:",
        wrap: true,
        spacing: "Small"
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.OpenUrl",
            title: "🔗 Open Devin API Settings",
            url: "https://app.devin.ai/settings/api-keys"
          }
        ],
        spacing: "Small"
      },
      {
        type: "Input.Text",
        id: "devinApiKey",
        label: "Devin API Key",
        placeholder: "Enter your Devin API key",
        value: currentConfig?.devinApiKey ? "••••••••••••••••" : "",
        spacing: "Small"
      },
      ...(currentConfig ? [
        {
          type: "Container",
          style: "good",
          items: [
            {
              type: "TextBlock",
              text: "📊 Current Status",
              weight: DesignTokens.typography.weights.bold,
              color: "Good"
            }
          ],
          spacing: DesignTokens.spacing.large
        },
        {
          type: "TextBlock",
          text: `Devin API: ${currentConfig.devinApiKey ? '✅ Configured' : '❌ Not configured'}`,
          spacing: "Small"
        },
        {
          type: "TextBlock",
          text: `GitHub Copilot: ${currentConfig.githubToken ? '✅ Configured' : '❌ Not configured'}`,
          spacing: "Small"
        },
        {
          type: "TextBlock",
          text: `Azure OpenAI: ${currentConfig.azureOpenAiApiKey ? '✅ Configured' : '❌ Not configured'}`,
          spacing: "Small"
        },
        {
          type: "TextBlock",
          text: `GitHub Repo: ${currentConfig.githubRepo ? '✅ Configured' : '❌ Not configured'}`,
          spacing: "Small"
        }
      ] : [])
    ],
    actions: [
      {
        type: "Action.Submit",
        title: `${FluentIcons.save} Save Configuration`,
        data: { action: "save_config" }
      },
      {
        type: "Action.Submit",
        title: "📋 Show Current Status",
        data: { action: "show_status" }
      },
      {
        type: "Action.Submit",
        title: "❓ Help",
        data: { action: "show_help" }
      }
    ]
  };
}

export function createConfigurationSuccessCard(message: string) {
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
                    text: "Configuration Updated",
                    size: DesignTokens.typography.sizes.large,
                    weight: DesignTokens.typography.weights.bold,
                    color: "Good"
                  },
                  {
                    type: "TextBlock",
                    text: message,
                    wrap: true,
                    spacing: DesignTokens.spacing.small
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "⚙️ Configure Again",
        data: { action: "show_config" }
      }
    ]
  };
}

export function createConfigurationErrorCard(error: string) {
  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
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
                    text: FluentIcons.error,
                    size: DesignTokens.typography.sizes.extraLarge,
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
                    text: "Configuration Error",
                    size: DesignTokens.typography.sizes.large,
                    weight: DesignTokens.typography.weights.bold,
                    color: "Attention"
                  },
                  {
                    type: "TextBlock",
                    text: error,
                    wrap: true,
                    spacing: DesignTokens.spacing.small
                  }
                ]
              }
            ]
          }
        ],
        spacing: DesignTokens.spacing.medium
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "🔄 Try Again",
        data: { action: "show_config" }
      }
    ]
  };
}
