import { P655Row } from "@/app/lib/p655/definitions";

const DEC_COLORS: Record<number, string> = {
  0: "bg-red-400 text-white",
  1: "bg-orange-400 text-white",
  2: "bg-yellow-400 text-black",
  3: "bg-green-500 text-white",
  4: "bg-blue-500 text-white",
  5: "bg-purple-500 text-white",
};

function numBg(n: number): string {
  const dec = Math.floor(n / 10);
  return DEC_COLORS[dec] ?? "bg-gray-200 text-black";
}

interface SeqEntry {
  lech: number;
  nums: number[];
}

export function computeSoSEQ(allData: P655Row[]): SeqEntry[] {
  // allData sort DESC (moi nhat truoc)
  const found = new Map<number, number>(); // so -> lech

  for (let i = 0; i < allData.length; i++) {
    for (const n of allData[i].n16) {
      if (!found.has(n)) found.set(n, i);
    }
    if (found.size === 55) break;
  }

  // Nhom theo lech, sort so tang dan
  const groups = new Map<number, number[]>();
  for (const [num, lech] of found.entries()) {
    if (!groups.has(lech)) groups.set(lech, []);
    groups.get(lech)!.push(num);
  }
  for (const arr of groups.values()) arr.sort((a, b) => a - b);

  return Array.from(groups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([lech, nums]) => ({ lech, nums }));
}

export default function SoSEQTable({ allData }: { allData: P655Row[] }) {
  const entries = computeSoSEQ(allData);

  return (
    <div className="overflow-y-auto">
      <table className="border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Lệch</th>
            <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Số</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ lech, nums }) => (
            <tr key={lech} className={lech === 0 ? "bg-yellow-50" : "hover:bg-gray-50"}>
              <td className={`px-2 py-0.5 text-center text-xs font-bold border border-gray-200
                ${lech === 0 ? "text-red-600" : lech >= 20 ? "text-orange-600" : "text-gray-700"}`}>
                {lech}
              </td>
              <td className="px-1 py-0.5 border border-gray-200">
                <div className="flex flex-wrap gap-0.5 min-w-[100px]">
                  {nums.map(n => (
                    <span key={n}
                      className={`w-6 h-5 inline-flex items-center justify-center text-xs rounded font-bold ${numBg(n)}`}>
                      {String(n).padStart(2, "0")}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
