import { X } from 'lucide-react'

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-soft relative max-h-[90vh] overflow-y-auto scrollbar-soft">
        <button onClick={onClose} className="absolute right-5 top-5 h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-black text-slate-900 pr-12">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
