"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// 通知を1件既読にする
export async function markAsRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  // 自分宛の通知のみ既読化できる
  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}

// すべて既読にする
export async function markAllAsRead() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await prisma.notification.updateMany({
    where: { recipientId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}