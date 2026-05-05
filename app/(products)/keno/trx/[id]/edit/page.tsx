import { fetchKenoTrxById, fetchLatestKy } from "@/app/lib/kenotrx/data";
import { updateKenoTrx } from "@/app/lib/kenotrx/actions";
import KenoTrxFormComponent from "@/app/(products)/keno/ui/KenoTrxForm";
import { notFound } from "next/navigation";

export default async function EditKenoTrxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trx, defaultKy] = await Promise.all([
    fetchKenoTrxById(id),
    fetchLatestKy(),
  ]);
  
  if (!trx) notFound();

  const updateWithId = updateKenoTrx.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 font-mono p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <a
            href="/keno/trx"
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Danh sách
          </a>
          <h1 className="text-lg font-bold text-blue-800">✏️ Sửa vé</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <KenoTrxFormComponent
            defaultValues={trx}
            defaultKy={defaultKy}
            onSubmit={updateWithId}
            isEdit={true}
            id={id.trim()}
          />
        </div>
      </div>
    </div>
  );
}
