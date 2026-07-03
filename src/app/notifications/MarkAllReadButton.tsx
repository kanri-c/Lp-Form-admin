"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { markAllAsRead } from "./actions";

export default function MarkAllReadButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await markAllAsRead();
    setIsLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      className={styles.markAllButton}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? "処理中..." : "すべて既読にする"}
    </button>
  );
}