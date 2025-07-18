import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { GitBranch, Users, Workflow, Bot, FileText, ExternalLink, Play, Sparkles, Star } from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { GitHubActionsWizard } from '@/components/GitHubActionsWizard'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'

interface CardData {
  id: number
  title: string
  description: string
  url: string
  category: string
  features: string[]
  video_placeholder: string
  icon: string
  buttons?: Array<{
    label: string
    url: string
    variant: string
  }>
  modal?: {
    title: string
    content: string
  }
}

const iconMap = {
  GitBranch: GitBranch,
  Users: Users,
  Workflow: Workflow,
  Bot: Bot,
  Template: FileText
}

function CollapsedBanner() {
  const { state } = useSidebar()
  
  if (state !== 'collapsed') {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-blue-200 dark:border-blue-800/50 px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-1">
            Async Loom - Async Agent Platform
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Showcasing the new paradigm shift in SDLC with async agents. Modern software engineers focus on context engineering, verification & validation of agent results, and administering an army of agents.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<{title: string, content: string} | null>(null)
  const [isGitHubActionsWizardOpen, setIsGitHubActionsWizardOpen] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/cards`)
        if (!response.ok) {
          throw new Error('Failed to fetch cards')
        }
        const data = await response.json()
        setCards(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarOpen(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleCardClick = (card: CardData) => {
    if (card.buttons) {
      return
    }

    if (card.modal) {
      setCurrentModal(card.modal)
      setIsModalOpen(true)
      return
    }

    if (card.url.startsWith('http')) {
      window.open(card.url, '_blank')
    }
  }

  const handleButtonClick = (url: string, card?: CardData, button?: any) => {
    if (url === '#configure-actions') {
      setIsGitHubActionsWizardOpen(true)
      return
    }
    
    if (button?.action === 'open_modal' && card?.id === 4) {
      if (card.modal) {
        const modalWithDownload = {
          ...card.modal,
          content: card.modal.content + '\n\n## 📥 **Download Extension**\n\n[**📦 Download AGU Copilot Extension (.zip)**](/api/copilot-extension/download)\n\nAfter downloading, follow the Manual Installation steps above.'
        };
        setCurrentModal(modalWithDownload);
        setIsModalOpen(true);
      }
      return
    }
    
    if (url === '#manual-install-teams') {
      const manualInstallModal = {
        title: "Manual Teams App Installation",
        content: `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              📥 PANE 1: Download & Setup
            </h3>
            <div class="space-y-4">
              <p class="text-sm text-blue-800 dark:text-blue-200">Get the complete Teams app package and prepare for installation.</p>
              
              <div class="space-y-3">
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">1. Download Teams App Package</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">Click the download button below to get the complete ZIP package</p>
                  <a href="/api/teams/download" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                    📦 Download Teams App
                  </a>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">2. Extract ZIP File</h4>
                  <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Extract to your preferred location on your computer</li>
                    <li>• The package contains manifest.json, icons, and setup instructions</li>
                  </ul>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">3. Choose Installation Method</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400">Select from the installation options in Pane 2 →</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              ⚙️ PANE 2: Installation Options
            </h3>
            <div class="space-y-4">
              <p class="text-sm text-green-800 dark:text-green-200">Choose your preferred installation method:</p>
              
              <div class="space-y-3">
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                    🚀 Option 1: Install in Microsoft Teams
                  </h4>
                  <ol class="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Open Microsoft Teams (desktop or web app)</li>
                    <li>Navigate to Apps → Manage your apps → Upload an app</li>
                    <li>Upload the ZIP file you downloaded from Pane 1</li>
                    <li>Configure the bot with your Azure Bot credentials</li>
                    <li>Start using the <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded">/devin</code> command in Teams</li>
                  </ol>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                    🔧 Option 2: Run Locally for Testing
                  </h4>
                  <ol class="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Navigate to extracted folder in your terminal</li>
                    <li>Install dependencies: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded">npm install</code></li>
                    <li>Create a .env file with your credentials</li>
                    <li>Start the bot: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded">npm start</code></li>
                    <li>Test with Bot Framework Emulator or ngrok</li>
                  </ol>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-4 rounded border">
                  <h4 class="font-medium text-green-900 dark:text-green-100 mb-2">💡 Need Help?</h4>
                  <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Azure Bot Setup: Visit Azure Portal → Bot Services</li>
                    <li>• Teams App Studio: Use for advanced manifest editing</li>
                    <li>• Bot Framework Emulator: Download from Microsoft</li>
                    <li>• Documentation: Full setup guide included in package</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>`
      }
      setCurrentModal(manualInstallModal)
      setIsModalOpen(true)
      return
    }
    
    if (url === '/api/teams/download' || url === '/api/copilot/download') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      window.open(`${apiUrl}${url}`, '_blank')
      return
    }
    
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Agent Loom...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-700">
          <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
            {/* Expanded state */}
            <div className="group-data-[collapsible=icon]:hidden flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                    <img src="/async-loom-logo.svg" alt="Async Loom" className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Async Loom
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Collapsed state */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                  <img src="/async-loom-logo.svg" alt="Async Loom" className="h-5 w-5" />
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <div className="group-data-[collapsible=icon]:hidden space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your comprehensive platform for AI agent integrations in the Software Development Life Cycle
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{cards.length} Integrations Available</span>
                  </div>
                  <a 
                    href="https://github.com/azure/async-loom" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>Star on GitHub</span>
                  </a>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="group-data-[collapsible=icon]:hidden">
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3 w-3 text-orange-500" />
                <span>⚠️ Experimental - Work in Progress</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <CollapsedBanner />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-700 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>

          <div className="flex-1 p-6 md:p-10">
            {/* Prominent Cards Section */}
            <div className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {cards.filter(card => card.id === 1 || card.id === 5).map((card) => {
                  const IconComponent = iconMap[card.icon as keyof typeof iconMap] || FileText
                  const isExternalLink = card.url.startsWith('http')

                  return (
                    <Card
                      key={card.id}
                      className={`group hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-500 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 flex flex-col ${!card.buttons && !card.modal ? 'cursor-pointer' : ''}`}
                      onClick={() => handleCardClick(card)}
                    >
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-800/40 dark:group-hover:to-blue-700/40 transition-all duration-300 shadow-sm">
                            <IconComponent className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Badge variant="secondary" className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1">
                            {card.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-3 leading-tight">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {card.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <div className="mb-6">
                          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-300 relative">
                            <img 
                              src={card.video_placeholder} 
                              alt={`${card.title} demo`}
                              className="w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                              <div className="text-center">
                                <Play className="h-10 w-10 text-slate-400 dark:text-slate-500 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hover to see demo</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Features:</h4>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                            {card.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                                <span className="leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto">
                          {card.buttons ? (
                            <div className="flex gap-2">
                              {card.buttons.map((button, index) => (
                                <Button
                                  key={index}
                                  variant={button.variant === 'outline' ? 'outline' : 'default'}
                                  size="sm"
                                  className="flex-1 max-w-[48%] h-10 text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleButtonClick(button.url, card, button)
                                  }}
                                >
                                  <span className="truncate">{button.label}</span>
                                  <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-10 font-medium group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCardClick(card)
                              }}
                            >
                              {card.modal ? (
                                'View Instructions'
                              ) : isExternalLink ? (
                                <>
                                  Visit Site
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </>
                              ) : (
                                'Learn More'
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Other Cards Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Additional Asynchronous workflows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-none">
                {cards.filter(card => card.id !== 1 && card.id !== 5).map((card) => {
                  const IconComponent = iconMap[card.icon as keyof typeof iconMap] || FileText
                  const isExternalLink = card.url.startsWith('http')

                  return (
                    <Card
                      key={card.id}
                      className={`group hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-500 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 flex flex-col ${!card.buttons && !card.modal ? 'cursor-pointer' : ''}`}
                      onClick={() => handleCardClick(card)}
                    >
                    <CardHeader className="pb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-800/40 dark:group-hover:to-blue-700/40 transition-all duration-300 shadow-sm">
                          <IconComponent className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1">
                          {card.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-3 leading-tight">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <div className="mb-6">
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-300 relative">
                          <img 
                            src={card.video_placeholder} 
                            alt={`${card.title} demo`}
                            className="w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                            <div className="text-center">
                              <Play className="h-10 w-10 text-slate-400 dark:text-slate-500 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hover to see demo</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Features:</h4>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                          {card.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        {card.buttons ? (
                          <div className="flex gap-2">
                            {card.buttons.map((button, index) => (
                              <Button
                                key={index}
                                variant={button.variant === 'outline' ? 'outline' : 'default'}
                                size="sm"
                                className="flex-1 max-w-[48%] h-10 text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleButtonClick(button.url, card, button)
                                }}
                              >
                                <span className="truncate">{button.label}</span>
                                <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 font-medium group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCardClick(card)
                            }}
                          >
                            {card.modal ? (
                              'View Instructions'
                            ) : isExternalLink ? (
                              <>
                                Visit Site
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              'Learn More'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            </div>
          </div>
        </SidebarInset>

        {isModalOpen && currentModal && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{currentModal.title}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <MarkdownRenderer content={currentModal.content} />
              </div>
              <DialogFooter className="flex gap-3">
                {currentModal.title.includes('GitHub Copilot Extension') && (
                  <Button 
                    onClick={() => handleButtonClick('/api/copilot/download')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Download Extension Package
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <GitHubActionsWizard 
          isOpen={isGitHubActionsWizardOpen} 
          onClose={() => setIsGitHubActionsWizardOpen(false)} 
        />
    </SidebarProvider>
  )
}

export default App
