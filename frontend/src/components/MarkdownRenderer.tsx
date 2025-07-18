import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentSection: React.ReactNode[] = []
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLanguage = ''

    const flushCurrentSection = () => {
      if (currentSection.length > 0) {
        elements.push(
          <div key={elements.length} className="space-y-3">
            {currentSection}
          </div>
        )
        currentSection = []
      }
    }

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <Card key={elements.length} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {codeBlockLanguage || 'code'}
                </Badge>
              </div>
              <pre className="text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            </CardContent>
          </Card>
        )
        codeBlockContent = []
        codeBlockLanguage = ''
      }
    }

    lines.forEach((line) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock()
          inCodeBlock = false
        } else {
          flushCurrentSection()
          inCodeBlock = true
          codeBlockLanguage = line.slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        return
      }

      if (line.trim() === '---') {
        flushCurrentSection()
        elements.push(<Separator key={elements.length} className="my-6 border-slate-300 dark:border-slate-600" />)
        return
      }

      if (line.startsWith('# ')) {
        flushCurrentSection()
        const title = line.slice(2)
        const processedTitle = title
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
        elements.push(
          <h1 key={elements.length} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            <span dangerouslySetInnerHTML={{ __html: processedTitle }} />
          </h1>
        )
        return
      }

      if (line.startsWith('## ')) {
        flushCurrentSection()
        const title = line.slice(3)
        const processedTitle = title
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <span dangerouslySetInnerHTML={{ __html: processedTitle }} />
          </h2>
        )
        return
      }

      if (line.startsWith('### ')) {
        flushCurrentSection()
        const title = line.slice(4)
        const processedTitle = title
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
        elements.push(
          <h3 key={elements.length} className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span dangerouslySetInnerHTML={{ __html: processedTitle }} />
          </h3>
        )
        return
      }

      if (line.startsWith('🤖 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🤖</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('📝 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📝</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('🔐 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🔐</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('⚡ **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">⚡</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('📥 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📥</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('⚙️ **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">⚙️</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('🚀 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🚀</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('🔧 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🔧</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('💡 **') && line.endsWith('**')) {
        flushCurrentSection()
        const title = line.slice(4, -2)
        elements.push(
          <div key={elements.length} className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">💡</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        )
        return
      }

      if (line.startsWith('- ')) {
        const content = line.slice(2)
        const parts = content.split(' - ')
        if (parts.length === 2) {
          currentSection.push(
            <div key={currentSection.length} className="flex items-start space-x-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <Badge variant="outline" className="mr-2 text-xs">
                  {parts[0]}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">{parts[1]}</span>
              </div>
            </div>
          )
        } else {
          const processedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
          
          currentSection.push(
            <div key={currentSection.length} className="flex items-start space-x-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span 
                className="text-sm text-slate-600 dark:text-slate-400" 
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          )
        }
        return
      }

      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '')
        const processedContent = content
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">$1</a>')
        
        currentSection.push(
          <div key={currentSection.length} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
              {line.match(/^\d+/)?.[0]}
            </div>
            <div 
              className="flex-1 text-sm text-slate-600 dark:text-slate-400"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>
        )
        return
      }

      if (line.trim() === '') {
        if (currentSection.length > 0) {
          flushCurrentSection()
          elements.push(<Separator key={elements.length} className="my-4" />)
        }
        return
      }

      if (line.trim()) {
        const processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">$1</a>')
        
        currentSection.push(
          <p 
            key={currentSection.length} 
            className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        )
      }
    })

    flushCurrentSection()
    flushCodeBlock()

    return elements
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {renderContent()}
    </div>
  )
}
