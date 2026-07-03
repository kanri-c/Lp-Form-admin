"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  // 更新間隔（ミリ秒）。デフォルト30秒。
  intervalMs?: number;
};

// 一定間隔でページのデータを自動再取得するコンポーネント。
// 置いたページが定期的にサーバーから最新データを取り直すようになる。
export default function AutoRefresh({ intervalMs = 30000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}