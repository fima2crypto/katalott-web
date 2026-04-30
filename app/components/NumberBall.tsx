type Props = {
  value: number;
  type?: "normal" | "special";
};

export default function NumberBall({ value, type = "normal" }: Props) {
  const getColor = () => {
    if (type === "special") return "bg-red-600";

    if (value < 10) return "bg-orange-600";
    if (value < 20) return "bg-yellow-600 text-black";
    if (value < 30) return "bg-green-600";
    if (value < 40) return "bg-cyan-600";
    if (value < 50) return "bg-blue-600";
    return "bg-pink-600";
  };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${getColor()}`}
    >
      {value.toString().padStart(2, "0")}
    </div>
  );
}
