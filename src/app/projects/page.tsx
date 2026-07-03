import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STATUS_CONFIG } from "@/lib/types";
import NotificationBell from "@/lib/NotificationBell";
import AutoRefresh from "@/lib/AutoRefresh";

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { q, status } = await searchParams;

  // 検索条件を組み立てる
  const projects = await prisma.project.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { uniqueId: { contains: q, mode: "insensitive" } },
              { detail: { storeName: { contains: q, mode: "insensitive" } } },
              { detail: { phone: { contains: q } } },
              { detail: { repName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { detail: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={styles.main}>
      <AutoRefresh />
      <div className={styles.container}>
      <div className={styles.header}>
          <h1 className={styles.title}>全案件一覧</h1>
          <div className={styles.headerRight}>
            <Link href="/revisions" className={styles.navLink}>
              修正依頼一覧
            </Link>
            <NotificationBell />
            <span className={styles.roleBadge}>
              {user.role === "admin" ? "管理" : "営業"}
            </span>
          </div>
        </div>

        {/* 検索フォーム */}
        <form className={styles.searchForm}>
          <input
            type="text"
            name="q"
            placeholder="ユニークID・案件名・電話番号・代表者名で検索"
            defaultValue={q}
            className={styles.searchInput}
          />
          <select name="status" defaultValue={status ?? ""} className={styles.statusSelect}>
            <option value="">すべてのステータス</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.searchButton}>
            検索
          </button>
        </form>

        {/* 案件一覧 */}
        {projects.length > 0 ? (
          <div className={styles.list}>
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.storeName}>
                    {project.detail?.storeName ?? "（未設定）"}
                  </span>
                  <span
                    className={styles.statusBadge}
                    style={{
                      color: STATUS_CONFIG[project.status].color,
                      backgroundColor: STATUS_CONFIG[project.status].bgColor,
                    }}
                  >
                    {STATUS_CONFIG[project.status].label}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <span>ID: {project.uniqueId ?? "未登録"}</span>
                  <span>代表者: {project.detail?.repName ?? "-"}</span>
                  <span>電話: {project.detail?.phone ?? "-"}</span>
                  <span>
                    依頼日: {project.createdAt.toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>該当する案件がありません。</p>
        )}
      </div>
    </main>
  );
}