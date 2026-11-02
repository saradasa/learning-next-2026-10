# 開発用: ソースはボリュームでマウントし、go run で起動する
FROM golang:1.25-alpine

WORKDIR /app

# 依存関係のキャッシュ（外部パッケージを追加したとき用）
COPY go.mod ./
RUN go mod download

COPY . .

EXPOSE 8080
CMD ["go", "run", "."]
