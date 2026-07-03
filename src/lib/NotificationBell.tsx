import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import styles from "./NotificationBell.module.css";

export default async function NotificationBell() {
  const user = await getCurrentUser();
  if (!user) return null;

  const unreadCount = await prisma.notification.count({
    where: { recipientId: user.id, isRead: false },
  });

  return (
    <Link href="/notifications" className={styles.bell}>
      <span className={styles.icon}>🔔</span>
      {unreadCount > 0 && (
        <span className={styles.badge}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}