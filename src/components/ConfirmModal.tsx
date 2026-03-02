interface Props {
  title: string;
  message: string
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300" onClick={onCancel}>Відмінити</button>
          <button className="px-4 py-2 bg-red-600 text-white" onClick={onConfirm}>Підтвердити</button>
        </div>
      </div>
    </div>
  );
}