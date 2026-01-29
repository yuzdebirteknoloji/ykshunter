'use client'

import { useState } from 'react'
import { BulkImportTab } from '@/components/admin/bulk-import-tab'
import { AnnouncementsTab } from '@/components/admin/announcements-tab'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'bulk-import' | 'announcements'>('bulk-import')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-sm md:text-base text-muted-foreground">İçerik ve duyuru yönetimi</p>
        </div>

        <div className="flex gap-2 mb-6 md:mb-8 border-b border-border overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'bulk-import'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            ⚡ Toplu İçe Aktar
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            📢 Duyurular
          </button>
        </div>

        {activeTab === 'bulk-import' && <BulkImportTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
      </div>
    </div>
  )
}
