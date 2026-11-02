"use server";

import { refresh } from "next/cache";
import { API_URL } from "../lib/api";

// Server Action: ブラウザ → Next.js サーバー → Go API の順でリクエストが流れる

export async function createTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await fetch(`${API_URL}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  refresh(); // 画面を最新のデータで再描画
}

export async function toggleTodo(id: number) {
  await fetch(`${API_URL}/api/todos/${id}`, { method: "PATCH" });
  refresh();
}

export async function deleteTodo(id: number) {
  await fetch(`${API_URL}/api/todos/${id}`, { method: "DELETE" });
  refresh();
}
