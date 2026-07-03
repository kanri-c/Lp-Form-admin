"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { registerUniqueId } from "./actions";

type Props = {
  projectId: string;
  currentValue: string | null;
};

export default function UniqueIdForm({ projectId, currentValue }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentValue ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    const result = await registerUniqueId(projectId, value);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className={styles.actionRow}>
      <label className={styles.actionLabel}>
        ユニークID（エネパル申込番号）
      </label>
      <div className={styles.actionInputRow}>
        <input
          type="text"
          className={styles.actionInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="エネパル申込番号を入力"
        />
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "登録中..." : "登録"}
        </button>
      </div>
      {error && <p className={styles.actionError}>{error}</p>}
    </div>
  );
}