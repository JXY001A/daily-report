import { 
  FileText, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  PenTool,
  Lightbulb,
  BarChart3,
  Workflow
} from 'lucide-react'

export interface AppTool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  status: 'active' | 'coming-soon' | 'beta'
  href: string
}

export interface UserPlan {
  id: string
  name: string
  features: string[]
  limits: {
    dailyGenerations: number
    knowledgeBases: number
    storageGB: number
  }
}

// Available tools in the platform
export const appTools: AppTool[] = [
  {
    id: 'daily-digest',
    name: 'AI 日报',
    description: '智能生成专业日报、周报和工作总结',
    icon: FileText,
    color: 'from-cyan-500 to-blue-500',
    status: 'active',
    href: '/tools/daily-digest',
  },
  {
    id: 'knowledge-base',
    name: '知识库',
    description: '构建个人或团队知识库，AI 智能问答',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    status: 'coming-soon',
    href: '/tools/knowledge-base',
  },
  {
    id: 'ai-assistant',
    name: 'AI 助手',
    description: '基于知识库的智能对话助手',
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    status: 'coming-soon',
    href: '/tools/ai-assistant',
  },
  {
    id: 'meeting-notes',
    name: '会议纪要',
    description: '自动整理会议内容，生成结构化纪要',
    icon: MessageSquare,
    color: 'from-orange-500 to-amber-500',
    status: 'coming-soon',
    href: '/tools/meeting-notes',
  },
  {
    id: 'content-writer',
    name: '内容创作',
    description: '文章、文案、营销内容智能创作',
    icon: PenTool,
    color: 'from-rose-500 to-red-500',
    status: 'coming-soon',
    href: '/tools/content-writer',
  },
  {
    id: 'idea-generator',
    name: '灵感激发',
    description: '头脑风暴、创意激发和方案生成',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    status: 'coming-soon',
    href: '/tools/idea-generator',
  },
  {
    id: 'data-analysis',
    name: '数据分析',
    description: '上传数据，AI 生成分析报告和可视化',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
    status: 'coming-soon',
    href: '/tools/data-analysis',
  },
  {
    id: 'workflow-automation',
    name: '工作流',
    description: '自动化工作流程，串联多种 AI 能力',
    icon: Workflow,
    color: 'from-teal-500 to-cyan-500',
    status: 'coming-soon',
    href: '/tools/workflow',
  },
]

// User plans configuration
export const userPlans: Record<string, UserPlan> = {
  free: {
    id: 'free',
    name: '免费版',
    features: ['每日 10 次生成', '基础模版', '7 天历史记录'],
    limits: {
      dailyGenerations: 10,
      knowledgeBases: 0,
      storageGB: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    features: ['无限生成', '全部模版', '个人知识库', '30 天历史记录', '优先客服'],
    limits: {
      dailyGenerations: -1,
      knowledgeBases: 3,
      storageGB: 5,
    },
  },
  team: {
    id: 'team',
    name: '团队版',
    features: ['团队协作', '共享知识库', '团队模版', '无限历史', 'API 接入', '专属客服'],
    limits: {
      dailyGenerations: -1,
      knowledgeBases: -1,
      storageGB: 50,
    },
  },
}

// Get current active tool
export function getActiveToolFromPath(pathname: string): AppTool | undefined {
  return appTools.find(tool => pathname.startsWith(tool.href))
}
