import styles from "./page.module.css";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <h1 className={styles.title}>LP制作依頼管理（管理画面）</h1>
        <p className={styles.description}>
          制作案件の進捗管理・修正対応・公開作業を行うシステムです。
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/projects" });
          }}
        >
          <button type="submit" className={styles.loginButton}>
            Googleでログイン
          </button>
        </form>
      </div>
    </main>
  );
}