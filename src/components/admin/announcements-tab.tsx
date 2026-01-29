'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, Trash2, Info, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'update',
    priority: 1,
    isActive: true
  })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      const { data } = await response.json()
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      setFormData({ title: '', message: '', type: 'info', priority: 1, isActive: true })
      setShowForm(false)
      loadAnnouncements()
      toast.success('Duyuru oluşturuldu!')
    } catch (error) {
      toast.error('Duyuru oluşturulamadı')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
      loadAnnouncements()
      toast.success('Duyuru silindi')
    } catch (error) {
      toast.error('Duyuru silinemedi')
    }
  }

  const typeIcons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    update: <Sparkles className="w-5 h-5 text-purple-500" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">📢 Duyurular</h2>
          <p className="text-sm text-muted-foreground">Kullanıcılara gösterilecek duyuruları yönet</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Yeni Duyuru
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-6 border mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">Yeni Duyuru Oluştur</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-muted border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Örn: Yeni Özellik Eklendi!"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Mesaj</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full h-24 bg-muted border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Duyuru mesajınızı yazın..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-muted border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="info">ℹ️ Bilgi</option>
                  <option value="warning">⚠️ Uyarı</option>
                  <option value="success">✅ Başarı</option>
                  <option value="update">✨ Güncelleme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Öncelik</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full bg-muted border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="1">Düşük</option>
                  <option value="2">Orta</option>
                  <option value="3">Yüksek</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm">Aktif (Kullanıcılara göster)</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90"
              >
                İptal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Henüz duyuru yok. Yeni duyuru ekle!
          </div>
        ) : (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg p-4 border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {typeIcons[announcement.type as keyof typeof typeIcons]}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Öncelik: {announcement.priority}</span>
                      <span>•</span>
                      <span>{announcement.is_active ? '✅ Aktif' : '❌ Pasif'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
