import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NotificationItem from "./NotificationItem";
import MarkAllReadButton from "./MarkAllReadButton";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const notifications = await prisma.notification.findMany({
    where: { recipientId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>通知</h1>
          <Link href="/projects" className={styles.back}>
            案件一覧へ戻る
          </Link>
        </div>

        {hasUnread && (
          <div className={styles.markAllRow}>
            <MarkAllReadButton />
          </div>
        )}

        {notifications.length > 0 ? (
          <div className={styles.list}>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                projectId={n.projectId}
                message={n.message}
                isRead={n.isRead}
                createdAt={n.createdAt.toLocaleString("ja-JP")}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>通知はありません。</p>
        )}
      </div>
    </main>
  );
}