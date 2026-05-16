"use client";

import type { Session } from "../lib/sessions";

interface SidebarProps {
  sessions: Session[]; // 所有会话列表（已排序）
  currentId: string | null; // 当前活跃会话 ID
  onSelect: (id: string) => void; // 切换会话回调
  onNew: () => void; // 新建会话回调
  onDelete: (id: string) => void; // 删除会话回调
  collapsed: boolean; // 是否折叠侧边栏
  onToggleCollapse: () => void; // 折叠/展开切换
}

export default function Sidebar({
  sessions,
  currentId,
  onSelect,
  onNew,
  onDelete,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  if (collapsed) {
    // 折叠态：只显示一个窄条 + 展开按钮
    return (
      <aside className="flex flex-col items-center w-12 border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80 py-4 gap-3">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="展开侧边栏"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
        <button
          onClick={onNew}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="新建日报"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </aside>
    );
  }

  // 展开态：显示完整侧边栏
  return (
    <aside className="flex flex-col w-64 border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* 顶部：新建按钮 + 折叠按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          新建日报
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="折叠侧边栏"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">
            暂无历史会话
            <br />
            点击「新建日报」开始
          </p>
        )}

        {sessions.map((session) => {
          const isActive = session.id === currentId; // 当前活跃会话高亮
          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`group flex items-center justify-between px-4 py-3 cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${
                isActive
                  ? "bg-white dark:bg-zinc-800 border-l-2 border-l-zinc-900 dark:border-l-zinc-400"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-l-2 border-l-transparent"
              }`}
            >
              <div className="min-w-0 flex-1">
                {/* 标题 */}
                <p
                  className={`text-sm truncate ${
                    isActive
                      ? "font-medium text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {session.title}
                </p>
                {/* 更新时间 */}
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(session.updatedAt).toLocaleString("zh-CN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* 删除按钮：hover 时显示 */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 阻止冒泡，避免触发 onSelect
                  onDelete(session.id);
                }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                title="删除会话"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 5h10M6 5V3.5A0.5 0.5 0 016.5 3h3a0.5 0.5 0 01.5.5V5M5 8v5a1 1 0 001 1h4a1 1 0 001-1V8M7 8v4M9 8v4" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
