'use client'

import { useRef, useState } from 'react'
import { HardDriveDownload, HardDriveUpload, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'

/** APK'da (yerel mod) veriler sadece telefonda durduğu için yedekleme şart. */
export function LocalDataSection() {
  const restoreInput = useRef<HTMLInputElement>(null)
  const contentInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const readJsonFile = async (file: File) => JSON.parse(await file.text())

  const handleExport = async () => {
    setBusy(true)
    try {
      const { exportBackupFile } = await import('@/lib/local/backup')
      const name = await exportBackupFile()
      toast.success(`Yedek hazır: ${name}`)
    } catch (e: any) {
      if (!/cancel/i.test(e?.message || '')) toast.error('Yedek alınamadı: ' + (e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async (file?: File) => {
    if (!file) return
    if (!confirm('Telefondaki TÜM veriler bu yedekteki verilerle değiştirilecek. Devam edilsin mi?')) return
    setBusy(true)
    try {
      const { restoreBackup } = await import('@/lib/local/backup')
      await restoreBackup(await readJsonFile(file))
      toast.success('Yedek geri yüklendi')
      setTimeout(() => window.location.replace('/'), 600)
    } catch (e: any) {
      toast.error(e?.message || 'Yedek yüklenemedi')
    } finally {
      setBusy(false)
    }
  }

  const handleContentImport = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      const { importContent } = await import('@/lib/local/seed')
      const c = await importContent(await readJsonFile(file))
      toast.success(
        `İçe aktarıldı: ${c.subjects} ders, ${c.topics} konu, ${c.question_sets} soru seti, ${c.image_games} görsel oyun`
      )
      setTimeout(() => window.location.replace('/'), 900)
    } catch (e: any) {
      toast.error(e?.message || 'İçerik okunamadı')
    } finally {
      setBusy(false)
    }
  }

  const btn =
    'flex items-center gap-3 w-full p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left disabled:opacity-50'

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-1">Verilerim</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Tüm verilerin sadece bu telefonda saklanıyor. Uygulamayı silersen veya telefonu sıfırlarsan kaybolur. Ara
        sıra yedek al.
      </p>
      <div className="space-y-2">
        <button onClick={handleExport} disabled={busy} className={btn}>
          <HardDriveDownload className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Yedek al</div>
            <div className="text-xs text-muted-foreground">Drive, WhatsApp vb. yere kaydet</div>
          </div>
        </button>
        <button onClick={() => restoreInput.current?.click()} disabled={busy} className={btn}>
          <HardDriveUpload className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Yedekten geri yükle</div>
            <div className="text-xs text-muted-foreground">Daha önce aldığın yedek dosyasını seç</div>
          </div>
        </button>
        <button onClick={() => contentInput.current?.click()} disabled={busy} className={btn}>
          <PackagePlus className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">İçerik dosyası ekle</div>
            <div className="text-xs text-muted-foreground">Ders/konu/soru seti içeren JSON dosyası</div>
          </div>
        </button>
      </div>
      <input
        ref={restoreInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          handleRestore(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <input
        ref={contentInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          handleContentImport(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
