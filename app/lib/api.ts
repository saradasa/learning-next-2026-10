// Go バックエンドとやり取りするための型と共通処理

export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

// サーバー側でのみ使う URL（NEXT_PUBLIC_ が付いていないのでブラウザには埋め込まれない）
export const API_URL = process.env.API_URL ?? "http://localhost:8080";

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_URL}/api/todos`);
  if (!res.ok) {
    throw new Error(`Failed to fetch todos: ${res.status}`);
  }
  return res.json();
}
