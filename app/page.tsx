import Card from "./components/Card";

export default function Home(){
  return(
    <main>
      <Card title="React" text="UIを作るライブラリ" />
      <Card title="Next.js" text="Reactのフレームワーク" />
    </main>
  );
}