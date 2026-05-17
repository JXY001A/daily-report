"use client";

import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Session } from "../lib/sessions";

interface SidebarProps {
  sessions: Session[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
  // 折叠态：只显示窄条 + 展开/新建按钮
  if (collapsed) {
    return (
      <aside className="flex flex-col items-center w-12 border-r border-sidebar-border bg-sidebar py-4 gap-3">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="展开侧边栏"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          onClick={onNew}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="新建日报"
        >
          <Plus className="size-4" />
        </button>
      </aside>
    );
  }

  // 展开态
  return (
    <aside className="flex flex-col w-64 border-r border-sidebar-border bg-sidebar">
      {/* 顶部：新建按钮 + 折叠按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <Button onClick={onNew} size="sm">
          <Plus />
          新建日报
        </Button>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="折叠侧边栏"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1">
        {sessions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            暂无历史会话
            <br />
            点击「新建日报」开始
          </p>
        )}

        {sessions.map((session) => {
          const isActive = session.id === currentId;
          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={cn(
                "group flex items-center justify-between px-4 py-3 cursor-pointer border-b border-sidebar-border transition-colors",
                isActive
                  ? "bg-sidebar-accent border-l-2 border-l-primary"
                  : "hover:bg-sidebar-accent/50 border-l-2 border-l-transparent"
              )}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm truncate",
                    isActive
                      ? "font-medium text-sidebar-primary-foreground"
                      : "text-sidebar-foreground"
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

              {/* 删除按钮：hover 时显示 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="删除会话"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </ScrollArea>
    </aside>
  );
}
