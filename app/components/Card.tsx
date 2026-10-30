type Props = { title: string; text: string };

export default function Card({ title, text }: Props){
    return(
        <div style={{ border: "1px solid gray", padding: 16,
            margin: 8 }}>
                <h2>{title}</h2>
                <p>{text}</p>
            </div>
    );
}