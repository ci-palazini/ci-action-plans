import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  onFile: (file: File) => void
}

export function DropZone({ onFile }: Props) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors',
        dragging
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40',
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        {dragging ? (
          <UploadCloud className="h-7 w-7 text-indigo-600" />
        ) : (
          <FileSpreadsheet className="h-7 w-7 text-indigo-500" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          {dragging ? t('upload.dropzoneActive') : t('upload.dropzone')}
        </p>
        <p className="mt-1 text-xs text-slate-400">.xlsx · .csv</p>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  )
}
