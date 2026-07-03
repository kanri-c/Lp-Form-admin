"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ユニークID登録（ET確認 → 制作中へ遷移）。管理のみ。
export async function registerUniqueId(projectId: string, uniqueId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  if (!uniqueId.trim()) {
    return { error: "ユニークIDを入力してください。" };
  }

  const current = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });
  if (!current) return { error: "案件が見つかりません。" };

  const nextStatus = current.status === "waiting" ? "in_production" : current.status;

  await prisma.project.update({
    where: { id: projectId },
    data: { uniqueId, status: nextStatus },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 初稿プレビューURL登録（→ 初稿提出済みへ遷移）。管理のみ。
export async function registerPreviewUrl(projectId: string, previewUrl: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  if (!previewUrl.trim()) {
    return { error: "プレビューURLを入力してください。" };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { previewUrl, status: "draft_submitted" },
  });

  await prisma.notification.create({
    data: {
      recipientId: (
        await prisma.project.findUnique({ where: { id: projectId }, select: { clientId: true } })
      )!.clientId,
      projectId,
      type: "draft_shared",
      message: "初稿が提出されました。内容をご確認ください。",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 公開作業（電気マッチング確認後 → 公開済みへ）。管理のみ。
export async function publishProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "published", publishedAt: new Date() },
    select: { clientId: true, previewUrl: true },
  });

  await prisma.notification.create({
    data: {
      recipientId: project.clientId,
      projectId,
      type: "published",
      message: `公開作業が完了しました。${project.previewUrl ?? ""}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 公開停止（1年以内の電気解約）。管理のみ。
export async function suspendProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "suspended" },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 案件削除（電気契約なし・不正登録）。管理のみ。
export async function deleteProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  await prisma.project.delete({ where: { id: projectId } });

  redirect("/projects");
}

// 修正依頼の対応完了（修正版提出）。管理のみ。
export async function completeRevision(projectId: string, revisionId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  const revision = await prisma.revision.update({
    where: { id: revisionId },
    data: { status: "done" },
  });

  // 公開前修正なら「初稿提出済み」へ戻す
  if (revision.phase === "pre") {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "draft_submitted" },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 公開後修正の完了（→ 公開済みへ戻す）。管理のみ。
export async function completePostRevision(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") return { error: "権限がありません。" };

  await prisma.revision.updateMany({
    where: { projectId, phase: "post", status: "open" },
    data: { status: "done" },
  });

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "published" },
    select: { clientId: true },
  });

  await prisma.notification.create({
    data: {
      recipientId: project.clientId,
      projectId,
      type: "revision_completed",
      message: "修正が完了しました。",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}