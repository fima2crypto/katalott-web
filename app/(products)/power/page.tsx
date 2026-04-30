"use client";

import Row655 from "@/app/components/Row655";
import { useEffect, useState } from "react";

export default function Page655() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        "http://localhost:8000/api/power655?so_ky=20&so_ky_tc=10",
      );
      const json = await res.json();
      setData(json.data || []);
    };

    load();
  }, []);

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white">
      <h1 className="text-xl font-bold mb-4 text-yellow-400">POWER 6/55</h1>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-white text-black">
          <tr>
            <th className="border p-2">STT</th>
            <th className="border p-2">THỨ</th>
            <th className="border p-2">NGÀY</th>
            <th className="border p-2">KỲ</th>
            <th className="border p-2">N1-N7</th>

            <th className="border p-2">0x</th>
            <th className="border p-2">1x</th>
            <th className="border p-2">2x</th>
            <th className="border p-2">3x</th>
            <th className="border p-2">4x</th>
            <th className="border p-2">5x</th>

            <th className="border p-2">DD</th>
            <th className="border p-2">SC</th>
            <th className="border p-2">CAM</th>
            <th className="border p-2">SNT</th>
            <th className="border p-2">XX</th>
            <th className="border p-2">KE</th>
            <th className="border p-2">T1</th>
            <th className="border p-2">G0</th>
            <th className="border p-2">P1</th>
            <th className="border p-2">MOD</th>
            <th className="border p-2">SUM</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r) => (
            <Row655 key={r.ky} r={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
