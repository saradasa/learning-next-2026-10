package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
)

// Todo は API でやり取りするデータの形
type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

// store はメモリ上に Todo を保存する（コンテナを再起動すると消える）
type store struct {
	mu     sync.Mutex
	nextID int
	todos  []Todo
}

func newStore() *store {
	return &store{
		nextID: 3,
		todos: []Todo{
			{ID: 1, Title: "Go の API を立ち上げる", Done: true},
			{ID: 2, Title: "Next.js から fetch する", Done: false},
		},
	}
}

func main() {
	s := newStore()
	mux := http.NewServeMux()

	// Go 1.22 以降は "メソッド パス" の形でルーティングできる
	mux.HandleFunc("GET /api/hello", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"message": "Hello from Go!"})
	})

	mux.HandleFunc("GET /api/todos", func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		defer s.mu.Unlock()
		writeJSON(w, http.StatusOK, s.todos)
	})

	mux.HandleFunc("POST /api/todos", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Title string `json:"title"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Title == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"})
			return
		}
		s.mu.Lock()
		t := Todo{ID: s.nextID, Title: body.Title}
		s.nextID++
		s.todos = append(s.todos, t)
		s.mu.Unlock()
		writeJSON(w, http.StatusCreated, t)
	})

	mux.HandleFunc("PATCH /api/todos/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		for i := range s.todos {
			if s.todos[i].ID == id {
				s.todos[i].Done = !s.todos[i].Done
				writeJSON(w, http.StatusOK, s.todos[i])
				return
			}
		}
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
	})

	mux.HandleFunc("DELETE /api/todos/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		for i, t := range s.todos {
			if t.ID == id {
				s.todos = append(s.todos[:i], s.todos[i+1:]...)
				w.WriteHeader(http.StatusNoContent)
				return
			}
		}
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
	})

	addr := ":8080"
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, logging(cors(mux))))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// cors はブラウザ (localhost:3000) から直接叩けるようにするためのミドルウェア。
// Server Component / Server Action からのリクエストはサーバー間通信なので CORS は関係ない。
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s (origin=%q)", r.Method, r.URL.Path, r.Header.Get("Origin"))
		next.ServeHTTP(w, r)
	})
}
