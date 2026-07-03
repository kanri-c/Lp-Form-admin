"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { markAsRead } from "./actions";

type Props = {
  id: string;
  projectId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationItem({
  id,
  projectId,
  message,
  isRead,
  createdAt,
}: Props) {
  const router = useRouter();

  const handleClick = async () => {
    if (!isRead) {
      await markAsRead(id);
    }
    router.push(`/projects/${projectId}`);
  };

  return (
    <button
      type="button"
      className={`${styles.item} ${!isRead ? styles.itemUnread : ""}`}
      onClick={handleClick}
    >
      {!isRead && <span className={styles.dot} />}
      <div className={styles.itemBody}>
        <p className={styles.itemMessage}>{message}</p>
        <p className={styles.itemDate}>{createdAt}</p>
      </div>
    </button>
  );
}