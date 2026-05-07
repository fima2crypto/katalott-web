"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sql from "@/app/lib/db";
import { KenoTrxForm, KenoTrxStatus } from "./definitions";
import { generateNextId, fetchKenoTrxById } from "./data";

export async function createKenoTrx(form: KenoTrxForm) {
  const id = await generateNextId();
  const now = new Date();
  // Lay ngay theo gio Viet Nam (UTC+7)
  const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await sql`
    INSERT INTO public.kenotrx (
      id, ngay, tu_ky, so_ky,
      so_chon_a, gia_a, so_chon_b, gia_b,
      so_chon_c, gia_c, so_chon_d, gia_d,
      so_chon_e, gia_e, so_chon_f, gia_f,
      status, last_update
    ) VALUES (
      ${id}, ${vnDate}, ${form.tu_ky}, ${form.so_ky},
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

export async function updateKenoTrx(id: string, form: KenoTrxForm) {
  const now = new Date();

  await sql`
    UPDATE public.kenotrx SET
      tu_ky = ${form.tu_ky}, so_ky = ${form.so_ky},
      so_chon_a = ${form.so_chon_a || null}, gia_a = ${form.gia_a || null},
      so_chon_b = ${form.so_chon_b || null}, gia_b = ${form.gia_b || null},
      so_chon_c = ${form.so_chon_c || null}, gia_c = ${form.gia_c || null},
      so_chon_d = ${form.so_chon_d || null}, gia_d = ${form.gia_d || null},
      so_chon_e = ${form.so_chon_e || null}, gia_e = ${form.gia_e || null},
      so_chon_f = ${form.so_chon_f || null}, gia_f = ${form.gia_f || null},
      status = ${form.status}, last_update = ${now}
    WHERE id = ${id}
  `;

  revalidatePath("/keno/trx");
  redirect("/keno/trx");
}

export async function updateKenoTrxStatus(id: string, status: KenoTrxStatus) {
  await sql`
    UPDATE public.kenotrx
    SET status = ${status}, last_update = ${new Date()}
    WHERE id = ${id}
  `;
  revalidatePath("/keno/trx");
}