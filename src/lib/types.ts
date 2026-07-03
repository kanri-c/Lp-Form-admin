// 案件のステータス（要件定義書 11.4 に対応）
export type ProjectStatus =
  | "waiting"
  | "in_production"
  | "draft_submitted"
  | "revising"
  | "publish_waiting"
  | "published"
  | "post_revising"
  | "suspended";

// ステータスの表示名とカラーの定義
export const STATUS_CONFIG: Record <
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  waiting: { label: "制作待ち", color: "#92610a", bgColor: "#fef3c7" },
  in_production: { label: "制作中", color: "#1d4ed8", bgColor: "#dbeafe" },
  draft_submitted: { label: "初稿提出済み", color: "#6d28d9", bgColor: "#ede9fe" },
  revising: { label: "修正中", color: "#b45309", bgColor: "#fef3c7" },
  publish_waiting: { label: "公開待ち", color: "#0f766e", bgColor: "#ccfbf1" },
  published: { label: "公開済み", color: "#166534", bgColor: "#dcfce7" },
  post_revising: { label: "公開後修正中", color: "#0f766e", bgColor: "#ccfbf1" },
  suspended: { label: "公開停止", color: "#991b1b", bgColor: "#fee2e2" },
};