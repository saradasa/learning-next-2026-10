"use client";

import { useEffect, useState } from "react";
import type { Todo } from "../lib/api";

// パターン2: Client Component からブラウザが直接 Go API を叩く
// 別オリジン (3000 → 8080) へのリクエストなので、Go 側で CORS の許可が必要

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_URL}/api/todos`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}

export default function GoTodoClientPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setTodos(await fetchTodos());
      setError(null);
    } catch (e) {
      setError(`取得に失敗しました: ${(e as Error).message}`);
    }
  };

  // 初回表示時に一覧を取得（アンマウント後に state を更新しないよう ignore フラグを使う）
  useEffect(() => {
    let ignore = false;
    fetchTodos()
      .then((data) => {
        if (!ignore) setTodos(data);
      })
      .catch((e: Error) => {
        if (!ignore) setError(`取得に失敗しました: ${e.message}`);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    await fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    load();
  };

  const toggle = async (id: number) => {
    await fetch(`${API_URL}/api/todos/${id}`, { method: "PATCH" });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`${API_URL}/api/todos/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <main>
      <h1>Go Todo（Client Component 版）</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="やること" />
      <button onClick={add}>追加</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.title}
            </span>
            <button onClick={() => toggle(todo.id)}>{todo.done ? "未完了に戻す" : "完了"}</button>
            <button onClick={() => remove(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
