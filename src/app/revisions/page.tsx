import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NotificationBell from "@/lib/NotificationBell";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function RevisionsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { status } = await searchParams;

  const revisions = await prisma.revision.findMany({
    where: status ? { status: status as "open" | "done" } : undefined,
    include: {
      project: {
        include: { detail: { select: { storeName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
      <div className={styles.header}>
          <h1 className={styles.title}>修正依頼一覧</h1>
          <div className={styles.headerRight}>
            <NotificationBell />
            <Link href="/projects" className={styles.back}>
              案件一覧へ戻る
            </Link>
          </div>
        </div>

        {/* ステータス絞り込み */}
        <div className={styles.filterTabs}>
          <Link
            href="/revisions"
            className={`${styles.filterTab} ${!status ? styles.filterTabActive : ""}`}
          >
            すべて
          </Link>
          <Link
            href="/revisions?status=open"
            className={`${styles.filterTab} ${status === "open" ? styles.filterTabActive : ""}`}
          >
            対応中
          </Link>
          <Link
            href="/revisions?status=done"
            className={`${styles.filterTab} ${status === "done" ? styles.filterTabActive : ""}`}
          >
            対応済み
          </Link>
        </div>

        {revisions.length > 0 ? (
          <div className={styles.list}>
            {revisions.map((rev) => (
              <Link
                key={rev.id}
                href={`/projects/${rev.projectId}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.storeName}>
                    {rev.project.detail?.storeName ?? "（未設定）"}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      rev.status === "done"
                        ? styles.statusDone
                        : styles.statusOpen
                    }`}
                  >
                    {rev.status === "done" ? "対応済み" : "対応中"}
                  </span>
                </div>
                <p className={styles.meta}>
                  {rev.seqNo}回目・
                  {rev.phase === "pre" ? "公開前" : "公開後"}・
                  {rev.createdAt.toLocaleDateString("ja-JP")}
                </p>
                {rev.targetArea && (
                  <p className={styles.targetArea}>該当箇所: {rev.targetArea}</p>
                )}
                <p className={styles.content}>{rev.content}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>該当する修正依頼がありません。</p>
        )}
      </div>
    </main>
  );
}