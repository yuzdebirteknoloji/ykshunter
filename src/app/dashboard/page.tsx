'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load tabs for faster initial load
const BulkImportTab = dynamic(() => import('@/components/admin/bulk-import-tab').then(m => ({ default: m.BulkImportTab })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="text-muted-foreground">Yükleniyor...</div></div>
})
const AnnouncementsTab = dynamic(() => import('@/components/admin/announcements-tab').then(m => ({ default: m.AnnouncementsTab })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="text-muted-foreground">Yükleniyor...</div></div>
})
const ManagementTab = dynamic(() => import('@/components/admin/management-tab').then(m => ({ default: m.ManagementTab })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="text-muted-foreground">Yükleniyor...</div></div>
})
const ImageGameTab = dynamic(() => import('@/components/admin/image-game-tab').then(m => ({ default: m.ImageGameTab })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="text-muted-foreground">Yükleniyor...</div></div>
})

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'bulk-import' | 'announcements' | 'management' | 'image-game'>('bulk-import')
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['bulk-import']))

  const handleTabChange = (tab: 'bulk-import' | 'announcements' | 'management' | 'image-game') => {
    setActiveTab(tab)
    setLoadedTabs(prev => new Set([...prev, tab]))
  }

  const handleTabHover = (tab: 'bulk-import' | 'announcements' | 'management' | 'image-game') => {
    // Prefetch tab data on hover for instant loading
    setLoadedTabs(prev => new Set([...prev, tab]))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-sm md:text-base text-muted-foreground">İçerik ve duyuru yönetimi</p>
        </div>

        <div className="flex gap-2 mb-6 md:mb-8 border-b border-border overflow-x-auto pb-2">
          <button
            onClick={() => handleTabChange('bulk-import')}
            onMouseEnter={() => handleTabHover('bulk-import')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'bulk-import'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            ⚡ Toplu İçe Aktar
          </button>
          <button
            onClick={() => handleTabChange('image-game')}
            onMouseEnter={() => handleTabHover('image-game')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'image-game'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            🖼️ Görsel Oyun
          </button>
          <button
            onClick={() => handleTabChange('management')}
            onMouseEnter={() => handleTabHover('management')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'management'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            🗂️ İçerik Yönetimi
          </button>
          <button
            onClick={() => handleTabChange('announcements')}
            onMouseEnter={() => handleTabHover('announcements')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            📢 Duyurular
          </button>
        </div>

        {loadedTabs.has('bulk-import') && (
          <div style={{ display: activeTab === 'bulk-import' ? 'block' : 'none' }}>
            <BulkImportTab />
          </div>
        )}
        {loadedTabs.has('image-game') && (
          <div style={{ display: activeTab === 'image-game' ? 'block' : 'none' }}>
            <ImageGameTab />
          </div>
        )}
        {loadedTabs.has('management') && (
          <div style={{ display: activeTab === 'management' ? 'block' : 'none' }}>
            <ManagementTab />
          </div>
        )}
        {loadedTabs.has('announcements') && (
          <div style={{ display: activeTab === 'announcements' ? 'block' : 'none' }}>
            <AnnouncementsTab />
          </div>
        )}
      </div>
    </div>
  )
}
