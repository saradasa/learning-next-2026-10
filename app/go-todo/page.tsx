import { Suspense } from "react";
import { getTodos } from "../lib/api";
import { createTodo, deleteTodo, toggleTodo } from "./actions";

// パターン1: Server Component で取得 + Server Action で更新
// Go API へのリクエストは Next.js サーバーから送られる（ブラウザからは見えない）

export default function GoTodoPage() {
  return (
    <main>
      <h1>Go Todo（Server Component 版）</h1>

      <form action={createTodo}>
        <input name="title" placeholder="やること" />
        <button type="submit">追加</button>
      </form>

      {/* cacheComponents 有効時は、キャッシュしない fetch を Suspense で囲む */}
      <Suspense fallback={<p>読み込み中...</p>}>
        <TodoList />
      </Suspense>
    </main>
  );
}

async function TodoList() {
  const todos = await getTodos();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            {todo.title}
          </span>
          {/* bind で id を引数に渡した Server Action を作る */}
          <form action={toggleTodo.bind(null, todo.id)} style={{ display: "inline" }}>
            <button type="submit">{todo.done ? "未完了に戻す" : "完了"}</button>
          </form>
          <form action={deleteTodo.bind(null, todo.id)} style={{ display: "inline" }}>
            <button type="submit">削除</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
