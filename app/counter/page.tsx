"use client"
import {useState} from "react";

export default function Counter(){
    const [count, setCount] = useState(0);
    return (
        <main>
            <h1>カウント(1~10)：{count}</h1>
            <button onClick={() => setCount(Math.min(10, count + 1))}>+1</button>
            <button onClick={() => setCount(Math.max(0, count - 1))}
                disabled={count === 0 }>-1</button>
            <button onClick={() => setCount(0)}>リセット</button>
        </main>
    );
}