import { fetchLatestKy } from '@/app/lib/kenotrx/data';
import { createKenoTrx } from '@/app/lib/kenotrx/actions';
import KenoTrxFormComponent from '@/app/(products)/keno/ui/KenoTrxForm';

export default async function CreateKenoTrxPage() {
  const defaultKy = await fetchLatestKy();

  return (
    <div className="min-h-screen bg-gray-50 font-mono p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <a href="/keno/trx" className="text-gray-400 hover:text-gray-600 text-sm">← Danh sách</a>
          <h1 className="text-lg font-bold text-blue-800">🎟 Tạo vé mới</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <KenoTrxFormComponent
            defaultValues={{}}
            defaultKy={defaultKy}
            onSubmit={createKenoTrx}
            isEdit={false}
          />
        </div>
      </div>
    </div>
  );
}
