import NumberBall from "./NumberBall";

export default function Row655({ r }: any) {
  const nums = [r.n1, r.n2, r.n3, r.n4, r.n5, r.n6];

  const decades = r.decade.split("-");

  const colorThu = {
    T3: "bg-orange-600",
    T5: "bg-yellow-600",
    T7: "bg-green-600",
  };

  const getBgColor05x = (d: string) => {
    const num = parseInt(d);
    if (num === 0) return "bg-gray-500";
    if (num >= 3) return "bg-orange-500";
    return "";
  };

  const BgColorDD = {
    CC: "bg-orange-600",
    CL: "bg-yellow-600",
    LC: "bg-cyan-600",
    LL: "bg-green-600",
  };

  return (
    <tr className="hover:bg-[#1e293b] text-center">
      <td className="border p-2">{r.stt}</td>
      <td className={`border p-2 ${colorThu[r.thu] ?? ""}`}>{r.thu}</td>
      <td className="border p-2">{r.ngay}</td>
      <td className="border p-2 text-yellow-300">{r.ky}</td>

      {/* Numbers */}
      <td className="border p-2">
        <div className="flex justify-center gap-2">
          {nums.map((n, i) => (
            <NumberBall key={i} value={n} />
          ))}
          <NumberBall value={r.n7} type="special" />
        </div>
      </td>

      {/* 0x-5x */}
      {decades.map((d: string, i: number) => (
        <td key={i} className={`border ${getBgColor05x(d)}`}>
          {d}
        </td>
      ))}

      {/* DD */}
      <td className={`border font-bold" ${BgColorDD[r.dd] ?? ""}`}>{r.dd}</td>

      {/* SC */}
      <td className="border text-white">{r.sc}</td>

      {/* CAM */}
      <td className="border text-yellow-400">{r.cam}</td>

      {/* SNT */}
      <td className="border text-green-400">{r.snt}</td>

      {/* XX */}
      <td className="border text-pink-400">{r.xx}</td>

      {/* KE */}
      <td className="border">{r.ke}</td>

      {/* T1 G0 P1 */}
      <td
        className={` bg-orange-500 font-bold ${r.t1 === 0 ? "text-white" : "text-black"}`}
      >
        {r.t1}
      </td>
      <td
        className={` bg-yellow-500 font-bold ${r.g0 === 0 ? "text-white" : "text-black"}`}
      >
        {r.g0}
      </td>
      <td
        className={` bg-green-500 font-bold ${r.p1 === 0 ? "text-white" : "text-black"}`}
      >
        {r.p1}
      </td>

      {/* MOD */}
      <td className="border text-purple-400">{r.mod}</td>

      {/* SUM */}
      <td className="border font-bold text-yellow-300">{r.sum}</td>
    </tr>
  );
}
