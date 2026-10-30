"use client"
import { todo } from "node:test";
import { useState } from "react";

export default function Todo(){
    const [text, setText] = useState("");
    const [todos, setTodos] = useState<string[]>([]);
    const [done, setDone] = useState("");

    const add = () => {
        if(!text) return;
        setTodos([...todos, text]);
        setText("");
    };

    return (
        <main>
            <h1>Todo</h1>
            <input value={text} onChange={(e) =>
                setText(e.target.value)} />
            <button onClick={add}>追加</button>
            <ul>
                {todos.map((todo, i) => (
                    <li key={i}>
                        {todo}
                        <button onClick={() => setTodos(todos.filter((_, j) => j !== i))}>
                            削除
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    )
}
