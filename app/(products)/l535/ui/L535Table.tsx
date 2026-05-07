"use client";
import { L535Row } from "@/app/lib/l535/definitions";
import { tensColor, DD_COLOR, BG_COT, BG_GRAY, BG_BROWN } from "@/app/lib/l535/utils";

function fmtAmt(v: number): string {
  if (!v) return "";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)}M`;
  return v.toLocaleString();
}

function fmtNgay(d: string): string {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}

function Ball({ n }: { n: number }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:22, height:22, borderRadius:"50%",
      background:tensColor(n), color:"#fff", fontSize:10, fontWeight:700,
    }}>
      {String(n).padStart(2,"0")}
    </span>
  );
}

function BallDB({ n }: { n: number }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:22, height:22, borderRadius:"50%",
      background:BG_GRAY, color:"#333", fontSize:10, fontWeight:700,
    }}>
      {String(n).padStart(2,"0")}
    </span>
  );
}

function Td({ children, bg, color, bold, center, cotStyle, p="2px 4px", style={} }: {
  children?: React.ReactNode; bg?: string; color?: string;
  bold?: boolean; center?: boolean; cotStyle?: boolean;
  p?: string; style?: React.CSSProperties;
}) {
  return (
    <td style={{
      padding:p, background:cotStyle ? BG_COT : bg,
      color, fontWeight:bold ? 700 : undefined,
      textAlign:center ? "center" : undefined,
      whiteSpace:"nowrap", fontSize:11,
      borderRight:"1px solid #e5e7eb", verticalAlign:"middle",
      ...style,
    }}>
      {children}
    </td>
  );
}

export default function L535Table({ data, qhKy }: { data: L535Row[]; qhKy: number }) {
  if (!data.length) return (
    <div className="p-8 text-center text-gray-400">Không có dữ liệu</div>
  );

  const TH: React.CSSProperties = {
    padding:"4px 4px", background:"#1e3a5f", color:"#fff",
    fontSize:11, fontWeight:700, textAlign:"center",
    whiteSpace:"nowrap", borderRight:"1px solid #2d4f7f",
    position:"sticky", top:0, zIndex:10,
  };
  const TH_COT: React.CSSProperties = { ...TH, background:"#b8860b" };
  const TH_GRAY: React.CSSProperties = { ...TH, background:"#607d8b" };

  return (
    <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:"calc(100vh - 56px)" }}>
      <table style={{ borderCollapse:"collapse", fontSize:11, fontFamily:"monospace", width:"max-content" }}>
        <thead>
          <tr>
            <th style={TH}>#</th>
            <th style={TH}>Thứ</th>
            <th style={TH}>Ngày</th>
            <th style={TH}>Đợt</th>
            <th style={TH}>Kỳ</th>
            <th style={TH}>N1</th><th style={TH}>N2</th><th style={TH}>N3</th>
            <th style={TH}>N4</th><th style={TH}>N5</th>
            <th style={TH_GRAY}>DB</th>
            <th style={TH}>0x</th><th style={TH}>1x</th>
            <th style={TH}>2x</th><th style={TH}>3x</th>
            <th style={TH_GRAY}>DBx</th>
            <th style={TH}>DD</th>
            <th style={TH_GRAY}>DBDD</th>
            <th style={TH}>SC</th>
            <th style={TH_COT}>CAM</th>
            <th style={TH_COT}>SNT</th>
            <th style={TH_COT}>cnt</th>
            <th style={TH}>XX</th>
            <th style={TH}>KE</th>
            <th style={TH}>T1</th>
            <th style={TH_COT}>G0</th>
            <th style={TH}>P1</th>
            <th style={TH_COT}>MOD</th>
            <th style={TH}>SUM</th>
            <th style={TH_COT}>Level</th>
            <th style={TH_COT}>cnt</th>
            <th style={TH_COT}>5CL</th>
            <th style={TH_COT}>cnt</th>
            <th style={TH}>JPP</th>
            <th style={TH}>JPMatch</th>
            <th style={TH}>cnt</th>
            <th style={TH}>&gt;</th>
            <th style={TH_COT}>QHL</th>
            <th style={TH_COT}>QHC</th>
            <th style={TH}>JPCK</th>
            <th style={TH}>DDAmt</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const rowBg = idx % 2 === 1 ? "#f8f9fa" : "#ffffff";

            let ngayColor = "#111";
            if (row.dd_cnt > 0 && row.g1_cnt > 0) ngayColor = "#7b1fa2";
            else if (row.dd_cnt > 0)               ngayColor = "#c0392b";
            else if (row.g1_cnt > 0)               ngayColor = "#27ae60";

            const kyColor = row.isNo ? "#c0392b" : row.isChi ? "#27ae60" : "#111";
            const dbxBg   = row.dbx === "X" ? "#f39c12" : row.dbx === "Y" ? "#2ecc71" : "#00bcd4";
            const decVals = [row.dec0, row.dec1, row.dec2, row.dec3];

            return (
              <tr key={row.ky} style={{ background:rowBg }}>
                <Td center>{idx+1}</Td>
                <Td center>{row.thu}</Td>

                <Td color={ngayColor} bold={ngayColor !== "#111"} center>
                  {fmtNgay(row.ngay)}
                </Td>

                {/* Đợt */}
                <Td center>{row.dot}</Td>

                <Td color={kyColor} bold={row.isNo || row.isChi} center>{row.ky}</Td>

                {row.n15.map((n, ni) => (
                  <Td key={ni} center p="2px 3px"><Ball n={n} /></Td>
                ))}

                <Td center bg={BG_GRAY} p="2px 3px"><BallDB n={row.n6} /></Td>

                {decVals.map((v, di) => (
                  <Td key={di} center
                    bg={v === 0 ? BG_GRAY : v >= 3 ? BG_BROWN : undefined}
                    color={(v === 0 || v >= 3) ? "#fff" : undefined}>
                    {v}
                  </Td>
                ))}

                <Td center bg={dbxBg} color="#fff" bold>{row.dbx}</Td>
                <Td center bg={DD_COLOR[row.dd]} color="#fff" bold>{row.dd}</Td>
                <Td center
                  bg={row.dbdd === "C" ? "#1565c0" : undefined}
                  color={row.dbdd === "C" ? "#fff" : "#333"} bold>
                  {row.dbdd}
                </Td>

                <Td center>{row.sc}</Td>
                <Td cotStyle center>{row.cam || "—"}</Td>

                {/* SNT | cnt */}
                <Td cotStyle center>{row.snt.join("-") || "—"}</Td>
                <Td cotStyle center>{row.snt_cnt}</Td>

                <Td center>{row.xx.length > 0 ? row.xx.join("-") : "—"}</Td>
                <Td center>{row.ke || "—"}</Td>
                <Td center>{row.t1 || "—"}</Td>
                <Td cotStyle center>{row.g0 || "—"}</Td>
                <Td center>{row.p1 || "—"}</Td>
                <Td cotStyle center>{row.mod || "—"}</Td>
                <Td center>{row.sum}</Td>

                {/* Level | cnt */}
                <Td cotStyle center style={{fontWeight:700}}>{row.level}</Td>
                <Td cotStyle center style={{color:"#666"}}>{row.level_cnt ?? "—"}</Td>

                {/* 5CL | cnt */}
                <Td cotStyle center style={{fontWeight:700}}>{row.cl5}</Td>
                <Td cotStyle center style={{color:"#666"}}>{row.cl5_cnt ?? "—"}</Td>

                <Td center>{row.jpp ?? "—"}</Td>

                {/* JPMatch | cnt */}
                <Td center style={{fontSize:10}}>{row.jpm_info || "—"}</Td>
                <Td center style={{color:"#c0392b", fontWeight:700}}>{row.jpm_cnt || "—"}</Td>

                <Td center>{row.qh_hit.length > 0 ? row.qh_hit.join(",") : "—"}</Td>

                <Td cotStyle style={{maxWidth:160,whiteSpace:"normal",fontSize:10}}>
                  {row.qhl.join(",")}
                </Td>

                <Td cotStyle center>{row.qhc}</Td>

                <Td center
                  bg={row.isNo ? "#c0392b" : undefined}
                  color={row.isNo ? "#fff" : undefined}>
                  {row.jpck}
                </Td>

                <Td center>{fmtAmt(row.dd_amt)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
