/**
 * 会话管理模块
 *
 * 所有会话数据存储在浏览器 localStorage 中，纯前端实现。
 * 数据结构：
 *   sessions: Session[]  — 所有会话列表，按 updatedAt 降序
 *   currentId: string     — 当前活跃会话的 ID
 */

export interface Session {
  id: string; // 唯一标识，crypto.randomUUID() 生成
  title: string; // 会话标题，默认用创建日期 "2026-05-16 日报"
  content: string; // 用户输入的原始工作内容
  summary: string; // AI 生成的日报结果
  createdAt: number; // 创建时间戳
  updatedAt: number; // 最后更新时间戳
}

const SESSIONS_KEY = "daily-report:sessions";
const CURRENT_KEY = "daily-report:currentId";

// ── Sessions 读写 ──────────────────────────────────────────

/** 从 localStorage 读取所有会话，按更新时间降序 */
export function getSessions(): Session[] {
  // 服务端渲染（SSR）时 localStorage 不可用，返回空数组
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return []; // JSON 解析失败（极少情况），返回空数组降级
  }
}

/** 覆盖写入全部会话列表 */
function setSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ── 单条会话操作 ──────────────────────────────────────────

/** 保存/更新一条会话（按 id 匹配，存在则更新，不存在则新增） */
export function saveSession(session: Session): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);

  if (index >= 0) {
    sessions[index] = session; // 更新已有会话
  } else {
    sessions.unshift(session); // 新会话插入到列表最前面
  }

  setSessions(sessions);
}

/** 删除指定 ID 的会话 */
export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  setSessions(sessions);

  // 如果删除的是当前会话，清除当前会话标记
  if (getCurrentId() === id) {
    clearCurrentId();
  }
}

// ── 当前活跃会话 ──────────────────────────────────────────

/** 获取当前活跃会话 ID */
export function getCurrentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_KEY);
}

/** 设置当前活跃会话 ID */
export function setCurrentId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_KEY, id);
}

/** 清除当前活跃会话标记 */
function clearCurrentId(): void {
  localStorage.removeItem(CURRENT_KEY);
}

// ── 辅助函数 ───────────────────────────────────────────────

/** 根据 ID 获取单条会话 */
export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}

/** 创建一个全新的空白会话对象 */
export function createEmptySession(): Session {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // "2026-05-16"
  const timeStr = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: crypto.randomUUID(),
    title: `${dateStr} ${timeStr} 日报`,
    content: "",
    summary: "",
    createdAt: now.getTime(),
    updatedAt: now.getTime(),
  };
}
