"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Trash2,
  LayoutTemplate,
  Search,
  X,
  CalendarDays,
  Zap,
  Users,
  GitBranch,
  TrendingUp,
  Activity,
  FileSearch,
} from "lucide-react";
import {
  type Session,
  getSessions,
  getCurrentId,
  getSessionById,
  saveSession,
  deleteSession,
  setCurrentId,
  createEmptySession,
} from "@/app/lib/sessions";

export default function DailyDigest() {
  // ── 会话状态 ──
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentId, setLocalCurrentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── 表单状态 ──
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("全部模板");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化
  useEffect(() => {
    const all = getSessions();
    setSessions(all);
    const savedId = getCurrentId();
    if (savedId && getSessionById(savedId)) {
      setLocalCurrentId(savedId);
      const session = getSessionById(savedId)!;
      setContent(session.content);
      setSummary(session.summary);
    } else if (all.length > 0) {
      setLocalCurrentId(all[0].id);
      setContent(all[0].content);
      setSummary(all[0].summary);
    }
  }, []);

  // 自动保存
  const autoSave = useCallback(
    (newContent: string, newSummary: string, id: string | null) => {
      if (!id) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const session = getSessionById(id);
        if (session) {
          session.content = newContent;
          session.summary = newSummary;
          session.updatedAt = Date.now();
          saveSession(session);
          setSessions(getSessions());
        }
      }, 1000);
    },
    []
  );

  useEffect(() => {
    if (currentId) autoSave(content, summary, currentId);
  }, [content, summary, currentId, autoSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function handleNew() {
    const session = createEmptySession();
    saveSession(session);
    setCurrentId(session.id);
    setLocalCurrentId(session.id);
    setContent("");
    setSummary("");
    setError("");
    setSessions(getSessions());
  }

  function handleSelect(id: string) {
    if (currentId) {
      const current = getSessionById(currentId);
      if (current) {
        current.content = content;
        current.summary = summary;
        current.updatedAt = Date.now();
        saveSession(current);
      }
    }
    setCurrentId(id);
    setLocalCurrentId(id);
    const session = getSessionById(id);
    if (session) {
      setContent(session.content);
      setSummary(session.summary);
      setError("");
    }
  }

  function handleDelete(id: string) {
    deleteSession(id);
    const remaining = getSessions();
    setSessions(remaining);
    if (id === currentId) {
      if (remaining.length > 0) {
        setCurrentId(remaining[0].id);
        setLocalCurrentId(remaining[0].id);
        setContent(remaining[0].content);
        setSummary(remaining[0].summary);
      } else {
        const session = createEmptySession();
        saveSession(session);
        setCurrentId(session.id);
        setLocalCurrentId(session.id);
        setSessions(getSessions());
        setContent("");
        setSummary("");
      }
    }
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !currentId) return;
    setLoading(true);
    setStreaming(false);
    setError("");
    setSummary("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "请求失败");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("无法读取响应");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedSummary = "";
      setLoading(false);
      setStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedSummary += decoder.decode(value, { stream: true });
        setSummary(accumulatedSummary);
      }
    } catch {
      setError("网络错误，请稍后重试");
      setLoading(false);
    } finally {
      setStreaming(false);
    }
  }

  // —— 模板数据 ——————————————————————————————
  const templates: { name: string; desc: string; icon: React.ComponentType<{ className?: string }>; content: string; category: string }[] = [
    { name: "工作日报", desc: "每日工作进展汇报", icon: FileText, category: "日常工作", content: "今日工作内容：\n1. \n2. \n3. \n\n遇到的问题：\n\n明日计划：" },
    { name: "周报总结", desc: "每周工作成果汇总", icon: CalendarDays, category: "日常工作", content: "本周工作总结：\n\n完成事项：\n\n进行中：\n\n下周计划：" },
    { name: "项目进度报告", desc: "项目状态与里程碑", icon: Zap, category: "项目管理", content: "项目进展汇报：\n\n里程碑：\n\n风险与阻塞：\n\n需要支持：" },
    { name: "会议纪要", desc: "会议记录与决议", icon: Users, category: "会议记录", content: "会议主题：\n\n参会人员：\n\n讨论内容：\n\n决议事项：\n\n下一步行动：" },
    { name: "技术日报", desc: "开发进度与技术方案", icon: GitBranch, category: "日常工作", content: "开发进度：\n\n技术方案：\n\n代码审查：\n\n问题与解决：" },
    { name: "销售日报", desc: "销售业绩与客户跟进", icon: TrendingUp, category: "日常工作", content: "销售数据：\n\n客户拜访：\n\n签约进展：\n\n回款情况：" },
    { name: "运营日报", desc: "运营数据与活动复盘", icon: Activity, category: "日常工作", content: "关键指标：\n\n活动效果：\n\n用户反馈：\n\n优化措施：" },
    { name: "研究报告", desc: "调研分析与洞察", icon: FileSearch, category: "项目管理", content: "调研主题：\n\n数据来源：\n\n核心发现：\n\n建议与结论：" },
  ];

  const categories = ["全部模板", "日常工作", "项目管理", "会议记录"];

  // 筛选模板
  const filteredTemplates = templates.filter((t) => {
    const matchCategory = templateCategory === "全部模板" || t.category === templateCategory;
    const matchSearch = !templateSearch || t.name.includes(templateSearch) || t.desc.includes(templateSearch);
    return matchCategory && matchSearch;
  });

  function handleSelectTemplate(template: typeof templates[0]) {
    setContent(template.content);
    setTemplateOpen(false);
    setTemplateSearch("");
    setTemplateCategory("全部模板");
    if (!currentId) {
      const session = createEmptySession();
      saveSession(session);
      setCurrentId(session.id);
      setLocalCurrentId(session.id);
      setSessions(getSessions());
    }
  }

  // ── UI ───────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background">
      {/* —— 左侧边栏 —— */}
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* 头部：logo + 折叠 */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border h-14",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-sidebar-foreground">
                  AI 工作台
                </span>
              </Link>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* 收起态：AI 日报图标 */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-4 flex-1 py-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={handleNew}
              className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground transition-colors"
              title="新建"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 当前工具信息 */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-sidebar-border">
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-sidebar-accent/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground">AI 日报</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  智能生成专业日报、周报和工作总结
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 新建按钮 */}
        <div className={cn("p-3", sidebarCollapsed && "px-2")}>
          <button
            onClick={handleNew}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg",
              "border border-dashed border-sidebar-border",
              "hover:bg-sidebar-accent hover:border-sidebar-primary/30",
              "transition-all duration-200 text-sm font-medium text-sidebar-foreground",
              sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
            )}
            title={sidebarCollapsed ? "新建" : undefined}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>新建</span>}
          </button>
        </div>

        {/* 会话列表 / 空状态 */}
        {!sidebarCollapsed && (
          <ScrollArea className="flex-1 px-3">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">暂无历史会话</p>
              </div>
            ) : (
              <div className="space-y-1 pb-3">
                {sessions.map((session) => {
                  const isActive = session.id === currentId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelect(session.id)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                        isActive
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm truncate",
                            isActive
                              ? "font-medium text-sidebar-foreground"
                              : "text-sidebar-foreground/80"
                          )}
                        >
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(session.updatedAt).toLocaleString("zh-CN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}

        {/* 用户区 */}
        <div
          className={cn(
            "border-t border-sidebar-border mt-auto",
            sidebarCollapsed ? "p-2" : "p-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg transition-all hover:bg-sidebar-accent cursor-pointer",
              sidebarCollapsed ? "p-2 justify-center" : "p-2"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
              张
            </div>
            {!sidebarCollapsed && (
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
        <div className="flex flex-col w-full max-w-2xl mx-auto gap-8 py-12 px-8">
          {/* 返回链接 */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            返回工作台
          </Link>

          {/* 标题区 */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-5" />
              新建日报
            </h1>
            <p className="mt-2 text-muted-foreground">
              输入工作内容，AI 帮你生成专业的日报总结
            </p>
          </div>

          {/* 输入区域 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                主题或关键词
              </label>
              <div className="relative">
                <Textarea
                  className="h-52 resize-none pr-24"
                  placeholder="输入日报主题、工作内容、项目进展等关键信息..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (!currentId) {
                      const session = createEmptySession();
                      saveSession(session);
                      setCurrentId(session.id);
                      setLocalCurrentId(session.id);
                      setSessions(getSessions());
                    }
                  }}
                  disabled={loading}
                />
                {/* 选择模板 */}
                <button
                  type="button"
                  onClick={() => setTemplateOpen(true)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  选择模板
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !content.trim()}
              size="lg"
              className="self-end"
            >
              {loading && <Loader2 className="animate-spin" />}
              <Sparkles className="w-4 h-4" />
              {loading ? "生成中..." : "生成日报"}
            </Button>
          </form>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 生成结果 */}
          {summary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  生成结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                  {summary}
                  {streaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse align-middle rounded-sm" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 空状态引导 */}
          {!summary && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sidebar-accent flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                开始生成你的日报
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                在上方输入你的工作内容、进展或遇到的挑战，AI 将智能整理成结构化的日报
              </p>
            </div>
          )}
        </div>
      </main>

      {/* —— 模板选择弹窗 —— */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择模板</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-2">
            选择一个模板快速开始，或直接输入主题
          </p>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="搜索模板..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setTemplateCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  templateCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 模板卡片网格 */}
          <div className="grid grid-cols-3 gap-3">
            {filteredTemplates.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => handleSelectTemplate(tpl)}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group/tpl"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover/tpl:bg-primary/10 transition-colors">
                  <tpl.icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {tpl.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              没有找到匹配的模板
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
