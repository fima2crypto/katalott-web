"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sql from "@/app/lib/db";
import { KenoTrxForm, KenoTrxStatus } from "./definitions";
import { generateNextId, parseSoChon, fetchKenoTrxById } from "./data";

const TICKETS = ["a", "b", "c", "d", "e", "f"] as const;

// ==================== CREATE ====================
export async function createKenoTrx(form: KenoTrxForm) {
  const id = await generateNextId();
  const now = new Date();

  await sql`
    INSERT INTO public.kenotrx (
      id, ngay, tu_ky, so_ky,
      so_chon_a, gia_a,
      so_chon_b, gia_b,
      so_chon_c, gia_c,
      so_chon_d, gia_d,
      so_chon_e, gia_e,
      so_chon_f, gia_f,
      status, last_update
    ) VALUES (
      ${id}, ${now.toISOString().slice(0, 10)}, ${form.tu_ky}, ${form.so_ky},
      ${form.so_chon_a || null}, ${form.gia_a || null},
      ${form.so_chon_b || null}, ${form.gia_b || null},
      ${form.so_chon_c || null}, ${form.gia_c || null},
      ${form.so_chon_d || null}, ${form.gia_d || null},
      ${form.so_chon_e || null}, ${form.gia_e || null},
      ${form.so_chon_f || null}, ${form.gia_f || null},
      'buy', ${now}
    )
  `;

  revalidatePath("/keno/trx");
  redirect("/keno/trx");
}

// ==================== UPDATE ====================
export async function updateKenoTrx(id: string, form: KenoTrxForm) {
  const now = new Date();

  await sql`
    UPDATE public.kenotrx SET
      tu_ky = ${form.tu_ky},
      so_ky = ${form.so_ky},
      so_chon_a = ${form.so_chon_a || null},
      gia_a = ${form.gia_a || null},
      so_chon_b = ${form.so_chon_b || null},
      gia_b = ${form.gia_b || null},
      so_chon_c = ${form.so_chon_c || null},
      gia_c = ${form.gia_c || null},
      so_chon_d = ${form.so_chon_d || null},
      gia_d = ${form.gia_d || null},
      so_chon_e = ${form.so_chon_e || null},
      gia_e = ${form.gia_e || null},
      so_chon_f = ${form.so_chon_f || null},
      gia_f = ${form.gia_f || null},
      status = ${form.status},
      last_update = ${now}
    WHERE id = ${id}
  `;

  // Xoa kenotrxkq cu de user do lai KQ
  await sql`
    DELETE FROM public.kenotrxkq WHERE id = ${id}
  `;

  revalidatePath("/keno/trx");
  redirect("/keno/trx");
}

// ==================== UPDATE STATUS ====================
export async function updateKenoTrxStatus(id: string, status: KenoTrxStatus) {
  await sql`
    UPDATE public.kenotrx
    SET status = ${status}, last_update = ${new Date()}
    WHERE id = ${id}
  `;
  revalidatePath("/keno/trx");
}

// ==================== DO KET QUA ====================
export async function doKenoTrxKq(id: string) {
  const trx = await fetchKenoTrxById(id);
  if (!trx) throw new Error(`Không tìm thấy vé ${id}`);

  const tuKy = parseInt(trx.tu_ky.trim(), 10);
  const soKy = trx.so_ky;

  const kyList = Array.from({ length: soKy }, (_, i) =>
    String(tuKy + i).padStart(7, "0"),
  );

  // FIX: query tu bang kenokq lay n20
  const kqRows = await sql<{ ky: string; n20: string }[]>`
    SELECT ky, n20 FROM public.kenokq
    WHERE ky = ANY(${kyList})
    ORDER BY ky ASC
  `;

  const PRIMES = new Set([
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79,
  ]);

  const insertRows: {
    id: string;
    ky: string;
    ticket: string;
    so_chon: string;
    gia: number;
    so_trung: string;
    so_cnt: number;
  }[] = [];

  for (const kqRow of kqRows) {
    const ky = kqRow.ky.trim();
    const n20 = kqRow.n20.trim().split(/\s+/).map(Number);
    const n20Set = new Set(n20);

    for (const t of TICKETS) {
      const soChon = trx[`so_chon_${t}` as keyof typeof trx] as string;
      const gia = trx[`gia_${t}` as keyof typeof trx] as number;
      if (!soChon || !soChon.trim()) continue;

      const nums = parseSoChon(soChon);
      const soTrung = nums.filter((n) => n20Set.has(n));
      const soCnt = soTrung.length;

      insertRows.push({
        id,
        ky,
        ticket: t.toUpperCase(),
        so_chon: soChon,
        gia: gia || 0,
        so_trung: soTrung.map((n) => String(n).padStart(2, "0")).join(" "),
        so_cnt: soCnt,
      });
    }
  }

  // Lay bang gtkeno de tinh thuong
  const gtkeno = await sql<
    {
      trung: string;
      b01: number;
      b02: number;
      b03: number;
      b04: number;
      b05: number;
      b06: number;
      b07: number;
      b08: number;
      b09: number;
      b10: number;
    }[]
  >`
    SELECT * FROM public.kenogt
  `;

  const gtkMap: Record<string, Record<string, number>> = {};
  for (const g of gtkeno) {
    gtkMap[g.trung.trim()] = {
      b01: g.b01,
      b02: g.b02,
      b03: g.b03,
      b04: g.b04,
      b05: g.b05,
      b06: g.b06,
      b07: g.b07,
      b08: g.b08,
      b09: g.b09,
      b10: g.b10,
    };
  }

  // Upsert vao kenotrxkq
  for (const r of insertRows) {
    const nums = (r.so_chon || "").trim().split(/\s+/).filter(Boolean);
    const bac = nums.length;
    const bacKey = "b" + String(bac).padStart(2, "0");
    const trungKey = "T" + String(r.so_cnt).padStart(2, "0");
    const donGia = gtkMap[trungKey]?.[bacKey] ?? 0;
    const thuong = donGia * (r.gia || 0);

    await sql`
      INSERT INTO public.kenotrxkq (id, ky, ticket, so_chon, gia, so_trung, so_cnt, thuong)
      VALUES (${r.id}, ${r.ky}, ${r.ticket}, ${r.so_chon}, ${r.gia}, ${r.so_trung}, ${r.so_cnt}, ${thuong})
      ON CONFLICT (id, ky, ticket) DO UPDATE SET
        so_chon = EXCLUDED.so_chon,
        gia = EXCLUDED.gia,
        so_trung = EXCLUDED.so_trung,
        so_cnt = EXCLUDED.so_cnt,
        thuong = EXCLUDED.thuong
    `;
  }

  revalidatePath("/keno/trx");
  revalidatePath(`/keno/trx/${id}/kq`);
  redirect(`/keno/trx/${id}/kq`);
}
