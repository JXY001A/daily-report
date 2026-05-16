"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/sidebar";
import {
  type Session,
  getSessions,
  getCurrentId,
  getSessionById,
  saveSession,
  deleteSession,
  setCurrentId,
  createEmptySession,
} from "./lib/sessions";

export default function Home() {
  // ── 会话状态 ──────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentId, setLocalCurrentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── 表单状态 ──────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  // debounce 计时器，用于自动保存
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 初始化：从 localStorage 恢复数据 ─────────────────────
  // 仅在客户端挂载时执行一次
  useEffect(() => {
    const all = getSessions();
    setSessions(all);

    const savedId = getCurrentId();
    if (savedId && getSessionById(savedId)) {
      // 恢复上次关闭时的会话
      setLocalCurrentId(savedId);
      const session = getSessionById(savedId)!;
      setContent(session.content);
      setSummary(session.summary);
    } else if (all.length > 0) {
      // fallback：加载最近更新的会话
      setLocalCurrentId(all[0].id);
      setContent(all[0].content);
      setSummary(all[0].summary);
    }
  }, []);

  // ── 自动保存（debounce 1 秒） ──────────────────────────────
  // 当 content 或 summary 变化时，自动保存到当前会话
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

          // 更新侧边栏列表（排序可能变化）
          setSessions(getSessions());
        }
      }, 1000); // 1 秒 debounce，避免频繁写入
    },
    []
  );

  // 监听 content 变化触发自动保存
  useEffect(() => {
    if (currentId) {
      autoSave(content, summary, currentId);
    }
  }, [content, summary, currentId, autoSave]);

  // 组件卸载时清理 debounce 计时器
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // ── 会话操作 ──────────────────────────────────────────────

  /** 新建空白会话 */
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

  /** 切换到指定会话 */
  function handleSelect(id: string) {
    // 先保存当前会话（避免切换时丢失未保存内容）
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

  /** 删除会话 */
  function handleDelete(id: string) {
    deleteSession(id);
    const remaining = getSessions();
    setSessions(remaining);

    // 如果删除的是当前会话，切换到剩余的最近会话
    if (id === currentId) {
      if (remaining.length > 0) {
        setCurrentId(remaining[0].id);
        setLocalCurrentId(remaining[0].id);
        setContent(remaining[0].content);
        setSummary(remaining[0].summary);
      } else {
        // 全部删完了，创建新会话
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

  // ── 日报生成 ──────────────────────────────────────────────

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

      // ── 流式读取 ──────────────────────────────────────
      const reader = res.body?.getReader();
      if (!reader) {
        setError("无法读取响应");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedSummary = "";
      setLoading(false); // 结束 loading，开始展示结果区域
      setStreaming(true); // 进入流式输出状态，显示光标

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 追加到累积变量，避免 setSummary 依赖 prev 的 closure 问题
        accumulatedSummary += decoder.decode(value, { stream: true });
        setSummary(accumulatedSummary);
      }
    } catch {
      setError("网络错误，请稍后重试");
      setLoading(false);
    } finally {
      setStreaming(false); // 流式输出结束，隐藏光标
    }
  }

  // ── UI ───────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 左侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentId={currentId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col w-full max-w-2xl mx-auto gap-8 py-16 px-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              📋 日报助手
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              输入今天的工作内容，AI 帮你整理成日报
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 resize-none"
              placeholder="例如：&#10;上午跟产品对齐了新功能需求，确定了排期&#10;下午修了登录页的样式bug&#10;和前端同步了下周的迭代计划"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                // 如果有内容变化，确保已创建会话（首次使用时）
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

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="self-end px-6 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "生成中..." : "生成日报"}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {summary && (
            <div className="p-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-sm font-medium text-zinc-400 mb-4">
                生成结果
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {summary}
                {/* 流式输出进行中时，显示闪烁光标 */}
                {streaming && (
                  <span className="inline-block w-2 h-4 ml-0.5 bg-zinc-400 animate-pulse align-middle" />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
