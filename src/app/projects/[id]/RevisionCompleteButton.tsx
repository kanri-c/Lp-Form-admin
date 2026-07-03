"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { completeRevision } from "./actions";

type Props = {
  projectId: string;
  revisionId: string;
};

export default function RevisionCompleteButton({ projectId, revisionId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    await completeRevision(projectId, revisionId);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      className={styles.smallButton}
      onClick={handleComplete}
      disabled={isLoading}
    >
      {isLoading ? "処理中..." : "対応完了にする"}
    </button>
  );
}