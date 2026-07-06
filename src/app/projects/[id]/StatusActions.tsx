"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./StatusActions.module.css";
import {
  publishProject,
  suspendProject,
  deleteProject,
} from "./actions";
import type { ProjectStatus } from "@/lib/types";

type Props = {
  projectId: string;
  status: ProjectStatus;
};

export default function StatusActions({ projectId, status }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePublish = async () => {
    if (!confirm("電気マッチングを確認しましたか？公開を行います。")) return;
    setIsLoading(true);
    const result = await publishProject(projectId);
    setIsLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  };

  const handleSuspend = async () => {
    if (!confirm("公開を停止しますか？")) return;
    setIsLoading(true);
    const result = await suspendProject(projectId);
    setIsLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("この案件を削除しますか？この操作は取り消せません。")) return;
    setIsLoading(true);
    const result = await deleteProject(projectId);
    setIsLoading(false);
    if (result?.error) setError(result.error);
    // deleteProjectは成功時にredirectするのでここには基本来ない
  };

  return (
    <div className={styles.actionRow}>
      {error && <p className={styles.actionError}>{error}</p>}
      <div className={styles.actionButtons}>
        {status === "publish_waiting" && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={handlePublish}
            disabled={isLoading}
          >
            公開
          </button>
        )}
        {status === "published" && (
          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleSuspend}
            disabled={isLoading}
          >
            公開を停止する
          </button>
        )}
        <button
          type="button"
          className={styles.dangerButton}
          onClick={handleDelete}
          disabled={isLoading}
        >
          案件を削除する
        </button>
      </div>
    </div>
  );
}