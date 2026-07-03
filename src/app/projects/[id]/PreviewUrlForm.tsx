"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PreviewUrlForm.module.css";
import { registerPreviewUrl } from "./actions";

type Props = {
  projectId: string;
  currentValue: string | null;
};

export default function PreviewUrlForm({ projectId, currentValue }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentValue ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    const result = await registerPreviewUrl(projectId, value);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className={styles.actionRow}>
      <label className={styles.actionLabel}>初稿プレビューURL</label>
      <div className={styles.actionInputRow}>
        <input
          type="text"
          className={styles.actionInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://..."
        />
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "登録中..." : "登録して提出"}
        </button>
      </div>
      {error && <p className={styles.actionError}>{error}</p>}
    </div>
  );
}