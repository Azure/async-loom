import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  secretKey: string
  secretLabel: string
}

const agents: Agent[] = [
  {
    id: 'codex',
    name: 'Codex',
    description: "OpenAI's code generation model",
    secretKey: 'AZURE_OPENAI_API_KEY',
    secretLabel: 'AZURE_OPENAI_API_KEY (for Codex)'
  },
  {
    id: 'github_copilot',
    name: 'GitHub Copilot Coding Agent',
    description: 'Enhanced code assistance',
    secretKey: 'OPENAI_API_KEY',
    secretLabel: 'OPENAI_API_KEY (for GitHub Copilot)'
  },
  {
    id: 'devin',
    name: 'Devin',
    description: 'Autonomous software engineer',
    secretKey: 'DEVIN_API_KEY',
    secretLabel: 'DEVIN_API_KEY (for Devin)'
  },
  {
    id: 'replit',
    name: 'Replit Agent',
    description: 'Cloud-based development assistant',
    secretKey: 'REPLIT_TOKEN',
    secretLabel: 'REPLIT_TOKEN (for Replit Agent)'
  }
]

interface GitHubActionsWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function GitHubActionsWizard({ isOpen, onClose }: GitHubActionsWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState('refactor authentication module')
  const [secretValue, setSecretValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent)

  const generateWorkflow = () => {
    if (!selectedAgentData) return ''

    return `name: AI Agent Workflow
on: [push, pull_request]

jobs:
  agent_task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup ${selectedAgentData.name}
        run: |
          echo "Setting up ${selectedAgentData.name} environment..."
          
      - name: Run ${selectedAgentData.name}
        env:
          ${selectedAgentData.secretKey}: \${{ secrets.${selectedAgentData.secretKey} }}
          TASK_DESCRIPTION: "${taskDescription}"
        run: |
          echo "Running ${selectedAgentData.name} with task: ${taskDescription}"
          # Agent-specific commands will be executed here
          echo "Task completed successfully"
`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateWorkflow())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedAgent('')
    setTaskDescription('refactor authentication module')
    setSecretValue('')
    setCopied(false)
    setIsLoading(false)
    onClose()
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedAgent !== ''
      case 2:
        return taskDescription.trim() !== ''
      case 3:
        return secretValue.trim() !== ''
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Available Agents:</h3>
            </div>
            
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{agent.name}</span>
                    <span className="text-slate-600 dark:text-slate-400"> - {agent.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Choose your agent from the dropdown below:
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an AI agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Setup Instructions:</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  2
                </Badge>
                <span className="font-medium text-slate-900 dark:text-slate-100">Describe your task</span>
                <span className="text-slate-600 dark:text-slate-400">(e.g., 'refactor authentication module')</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Task Description:
                </Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what you want the AI agent to do..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">🔐</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Required Secrets:</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  3
                </Badge>
                <span className="font-medium text-slate-900 dark:text-slate-100">Add secrets</span>
                <span className="text-slate-600 dark:text-slate-400">to your GitHub repository:</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  - Go to Settings → Secrets and variables → Actions
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  - Add required API keys (shown below based on your agent choice)
                </p>
              </div>

              {selectedAgentData && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedAgentData.secretLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret-value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedAgentData.secretKey} Value:
                    </Label>
                    <Input
                      id="secret-value"
                      type="password"
                      value={secretValue}
                      onChange={(e) => setSecretValue(e.target.value)}
                      placeholder={`Enter your ${selectedAgentData.secretKey}...`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Generated Workflow:</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  4
                </Badge>
                <span className="font-medium text-slate-900 dark:text-slate-100">Copy the generated workflow to</span>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-slate-700 dark:text-slate-300">
                  .github/workflows/agent-workflow.yml
                </code>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <code>{generateWorkflow()}</code>
                </pre>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Your GitHub Actions workflow has been generated successfully! Copy the code above and save it to 
                  <code className="bg-green-100 dark:bg-green-800 px-1 py-0.5 rounded text-xs font-mono mx-1">
                    .github/workflows/agent-workflow.yml
                  </code>
                  in your repository.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Configure GitHub Actions with AI Agents
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Select an AI agent and configure your GitHub Actions workflow:
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step < currentStep
                        ? 'bg-green-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[60vh] px-1">
            {renderStepContent()}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-start space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleClose} disabled={isLoading} className="flex items-center">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
