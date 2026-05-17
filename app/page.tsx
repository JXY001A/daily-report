"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  BookOpen,
  Brain,
  MessageSquare,
  PenTool,
  Lightbulb,
  BarChart3,
  Lock,
} from "lucide-react";

// ——— 工具定义 ——————————————————————————————
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status: "active" | "coming-soon";
  href: string;
}

const tools: Tool[] = [
  {
    id: "daily-digest",
    name: "AI 日报",
    description: "智能生成专业日报、周报和工作总结",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    status: "active",
    href: "/daily-digest",
  },
  {
    id: "knowledge-base",
    name: "知识库",
    description: "构建个人或团队知识库，AI 智能问答",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "ai-assistant",
    name: "AI 助手",
    description: "基于知识库的智能对话助手",
    icon: Brain,
    color: "from-green-500 to-emerald-500",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "meeting-notes",
    name: "会议纪要",
    description: "自动整理会议内容，生成结构化纪要",
    icon: MessageSquare,
    color: "from-orange-500 to-amber-500",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "content-writer",
    name: "内容创作",
    description: "文章、文案、营销内容智能创作",
    icon: PenTool,
    color: "from-rose-500 to-red-500",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "idea-generator",
    name: "灵感激发",
    description: "头脑风暴、创意激发和方案生成",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "data-analysis",
    name: "数据分析",
    description: "上传数据，AI 生成分析报告和可视化",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-500",
    status: "coming-soon",
    href: "#",
  },
];

// 当前活跃的工具（AI 日报）
const activeTool = tools[0];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* —— 左侧边栏 —— */}
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          sidebarOpen ? "w-72" : "w-16"
        )}
      >
        {/* 头部：logo + 折叠按钮 */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border h-14",
            sidebarOpen ? "justify-between px-4" : "justify-center px-2"
          )}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-sidebar-foreground">
                  AI 工作台
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 工具选择器 */}
        <div className="p-3 border-b border-sidebar-border">
          <button
            className={cn(
              "w-full flex items-center gap-3 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent border border-sidebar-border",
              sidebarOpen ? "p-2.5" : "p-2.5 justify-center"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                activeTool.color
              )}
            >
              <activeTool.icon className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {activeTool.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeTool.description}
                </p>
              </div>
            )}
          </button>
        </div>

        {/* 新建按钮 */}
        <div className={cn("p-3", !sidebarOpen && "px-2")}>
          <Link href="/daily-digest">
            <button
              className={cn(
                "w-full flex items-center gap-2 rounded-lg",
                "border border-dashed border-sidebar-border",
                "hover:bg-sidebar-accent hover:border-sidebar-primary/30",
                "transition-all duration-200 text-sm font-medium text-sidebar-foreground",
                sidebarOpen ? "px-3 py-2.5" : "p-2.5 justify-center"
              )}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>新建</span>}
            </button>
          </Link>
        </div>

        {/* 用户区 */}
        <div
          className={cn(
            "mt-auto border-t border-sidebar-border",
            sidebarOpen ? "p-3" : "p-2"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg transition-all",
              "hover:bg-sidebar-accent cursor-pointer",
              sidebarOpen ? "p-2" : "p-2 justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
              张
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  张三
                </p>
                <p className="text-xs text-muted-foreground">Pro</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* —— 右侧主内容区 —— */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-16 px-8 max-w-4xl mx-auto gap-10">
          {/* 顶部标签 */}
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          >
            AI 驱动的智能工作台
          </Badge>

          {/* 欢迎语 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              你好，张三
            </h1>
            <p className="text-muted-foreground text-lg">
              选择一个工具，开始高效工作
            </p>
          </div>

          {/* AI 日报 — 主推卡片 */}
          <Link href="/daily-digest" className="w-full max-w-md block group">
            <Card className="border-0 bg-gradient-to-br from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 transition-all duration-300 cursor-pointer group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-blue-500/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">AI 日报</h3>
                  <p className="text-sm text-blue-200/80 mt-1">
                    智能生成专业日报、周报和工作总结
                  </p>
                </div>
                <div className="self-center text-blue-300/50 group-hover:text-blue-200 group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 即将上线 */}
          <div className="w-full max-w-2xl space-y-5">
            <h2 className="text-lg font-semibold text-foreground text-center">
              即将上线
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {tools.slice(1).map((tool) => (
                <Card
                  key={tool.id}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-not-allowed group/tool"
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                        tool.color
                      )}
                    >
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      即将上线
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 底部链接 */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-8">
            <span>AI 工作台 v1.0</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              帮助中心
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              反馈建议
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
