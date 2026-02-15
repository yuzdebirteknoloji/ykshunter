'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronLeft, ChevronRight, X, Image as ImageIcon, Upload } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSubjects, getTrialAnalysesBySubject, createTrialAnalysis, deleteTrialAnalysis, createSubject, Subject } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'

export default function TrialAnalysisPage() {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    // Queries
    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: getSubjects
    })

    // Analysis Query
    const { data: analyses = [], isLoading: analysesLoading } = useQuery({
        queryKey: ['trial-analyses', selectedSubject],
        queryFn: () => selectedSubject ? getTrialAnalysesBySubject(selectedSubject) : Promise.resolve([]),
        enabled: !!selectedSubject
    })

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Deneme Analizi
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Yanlış yaptığın soruları ve notlarını buradan takip et.
                    </p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Yeni Ekle</span>
                </button>
            </div>

            {/* Subject Selection */}
            <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3 min-w-max">
                    {subjectsLoading ? (
                        // Skeleton Loading
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="w-32 h-12 bg-muted rounded-xl animate-pulse" />
                        ))
                    ) : (
                        subjects.map((subject: Subject) => (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedSubject(subject.id)}
                                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl transition-all border
                  ${selectedSubject === subject.id
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                        : 'bg-card hover:bg-muted border-border text-foreground hover:scale-105'
                                    }
                `}
                            >
                                <span className="text-xl">{subject.icon}</span>
                                <span className="font-medium whitespace-nowrap">{subject.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!selectedSubject ? (
                        <motion.div
                            key="empty-subject"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-muted-foreground/20 rounded-3xl bg-muted/50"
                        >
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Bir Ders Seçin</h3>
                                <p className="text-muted-foreground">Analizlerinizi görmek için yukarıdan bir ders seçin.</p>
                            </div>
                        </motion.div>
                    ) : analysesLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : analyses.length === 0 ? (
                        <motion.div
                            key="empty-data"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-muted-foreground/20 rounded-3xl bg-muted/50"
                        >
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <Upload className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Henüz Analiz Yok</h3>
                                <p className="text-muted-foreground mb-4">Bu derste henüz eklenmiş bir analiz bulunmuyor.</p>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 font-medium transition-colors"
                                >
                                    İlk Analizi Ekle
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <AnalysisCarousel key="carousel" analyses={analyses} />
                    )}
                </AnimatePresence>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                subjects={subjects}
                defaultSubjectId={selectedSubject}
            />
        </div>
    )
}

function AnalysisCarousel({ analyses }: { analyses: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const queryClient = useQueryClient()

    // Reset index when analyses change
    useEffect(() => {
        setCurrentIndex(0)
    }, [analyses.length])

    // Prevent index out of bounds
    const safeIndex = Math.min(currentIndex, analyses.length - 1)
    const currentItem = analyses[safeIndex]

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % analyses.length)
    }

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + analyses.length) % analyses.length)
    }

    const deleteMutation = useMutation({
        mutationFn: deleteTrialAnalysis,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trial-analyses'] })
            toast.success('Analiz silindi')
            // Adjust index if needed
            if (currentIndex >= analyses.length - 1) {
                setCurrentIndex(Math.max(0, analyses.length - 2))
            }
        },
        onError: () => {
            toast.error('Silinirken bir hata oluştu')
        }
    })

    if (!currentItem) return null

    return (
        <div className="relative group">
            {/* Navigation Buttons */}
            {analyses.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Pagination Dot Indicator */}
            {analyses.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="text-white text-xs font-medium">
                        {safeIndex + 1} / {analyses.length}
                    </span>
                </div>
            )}

            {/* Main Card */}
            <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-card border rounded-3xl overflow-hidden shadow-xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-black/5 dark:bg-black/40 flex items-center justify-center p-4">
                        <img
                            src={currentItem.image_url}
                            alt="Analysis"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                        />
                    </div>

                    {/* Note Section */}
                    <div className="flex flex-col p-6 lg:p-10 relative bg-gradient-to-br from-card to-muted/20">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                                <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium uppercase tracking-wider">
                                    {new Date(currentItem.created_at).toLocaleDateString('tr-TR')}
                                </span>
                                <span>•</span>
                                <span>{new Date(currentItem.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                📝 Analiz Notu
                            </h3>

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                    {currentItem.note || "Not eklenmemiş."}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t flex justify-end">
                            <button
                                onClick={() => {
                                    if (confirm('Bu analizi silmek istediğinize emin misiniz?')) {
                                        deleteMutation.mutate(currentItem.id)
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

function UploadModal({
    isOpen,
    onClose,
    subjects,
    defaultSubjectId
}: {
    isOpen: boolean
    onClose: () => void
    subjects: Subject[]
    defaultSubjectId: string | null
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [note, setNote] = useState('')
    const [subjectId, setSubjectId] = useState(defaultSubjectId || '')
    const [addingNewSubject, setAddingNewSubject] = useState(false)
    const [newSubjectName, setNewSubjectName] = useState('')
    const [newSubjectIcon, setNewSubjectIcon] = useState('📚')
    const [savingSubject, setSavingSubject] = useState(false)

    const queryClient = useQueryClient()

    const subjectIcons = ['📚', '📐', '🧪', '🌍', '📖', '🔢', '🧬', '🎨', '💻', '📝', '🏛️', '⚗️', '🧮', '🌿', '🔬']

    // Update subjectId when defaultSubjectId changes
    useEffect(() => {
        if (defaultSubjectId) setSubjectId(defaultSubjectId)
    }, [defaultSubjectId])

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null)
            setPreviewUrl(null)
            setNote('')
            setAddingNewSubject(false)
            setNewSubjectName('')
            setNewSubjectIcon('📚')
        }
    }, [isOpen])

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) {
            toast.error('Ders adı boş olamaz')
            return
        }
        setSavingSubject(true)
        try {
            const newSubject = await createSubject(newSubjectName.trim(), newSubjectIcon)
            queryClient.invalidateQueries({ queryKey: ['subjects'] })
            setSubjectId(newSubject.id)
            setAddingNewSubject(false)
            setNewSubjectName('')
            setNewSubjectIcon('📚')
            toast.success('Ders başarıyla eklendi')
        } catch (error) {
            console.error(error)
            toast.error('Ders eklenirken hata oluştu')
        } finally {
            setSavingSubject(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!selectedFile || !subjectId) throw new Error('Eksik bilgi')

            // Kullanıcı IDsini al
            const authRes = await fetch('/api/auth/me')
            const authData = await authRes.json()

            if (!authData.user?.id) {
                throw new Error('Kullanıcı oturumu bulunamadı')
            }

            const imageUrl = await uploadToCloudinary(selectedFile)
            try {
                await createTrialAnalysis({
                    subject_id: subjectId,
                    image_url: imageUrl,
                    note,
                    user_id: authData.user.id
                })
            } catch (err) {
                console.error('Save Error:', err)
                throw new Error('Veritabanına kaydedilemedi: ' + (err as Error).message)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trial-analyses'] })
            toast.success('Analiz başarıyla eklendi')
            onClose()
        },
        onError: (error) => {
            console.error(error)
            toast.error('Hata Detayı (V2): ' + (error as Error).message)
        }
    })

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto grid place-items-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border my-8"
                        >
                            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
                                <h2 className="text-xl font-bold">Yeni Analiz Ekle</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Subject Select */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ders Seçin</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                                        {subjects.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSubjectId(s.id)}
                                                className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all
                          ${subjectId === s.id
                                                        ? 'bg-primary/10 border-primary text-primary'
                                                        : 'border-border hover:bg-muted'
                                                    }
                        `}
                                            >
                                                <span>{s.icon}</span>
                                                <span className="text-sm truncate">{s.name}</span>
                                            </button>
                                        ))}

                                        {/* Yeni Ders Ekle Butonu */}
                                        {!addingNewSubject && (
                                            <button
                                                onClick={() => setAddingNewSubject(true)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm">Yeni Ders Ekle</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Yeni Ders Ekleme Formu */}
                                    {addingNewSubject && (
                                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1 flex-wrap">
                                                    {subjectIcons.map(icon => (
                                                        <button
                                                            key={icon}
                                                            onClick={() => setNewSubjectIcon(icon)}
                                                            className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-all ${
                                                                newSubjectIcon === icon
                                                                    ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                                                    : 'hover:bg-muted'
                                                            }`}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSubjectName}
                                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                                    placeholder="Ders adı yazın..."
                                                    className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddSubject()
                                                        if (e.key === 'Escape') setAddingNewSubject(false)
                                                    }}
                                                />
                                                <button
                                                    onClick={handleAddSubject}
                                                    disabled={savingSubject || !newSubjectName.trim()}
                                                    className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {savingSubject ? '...' : 'Ekle'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAddingNewSubject(false)
                                                        setNewSubjectName('')
                                                    }}
                                                    className="px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                                                >
                                                    İptal
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!subjectId && <p className="text-xs text-red-500 mt-1">Lütfen bir ders seçin</p>}
                                </div>


                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Görsel</label>
                                    <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${previewUrl ? 'border-primary/50' : 'border-muted-foreground/20 hover:border-primary/50'}
                    ${selectedFile ? 'bg-muted/30' : 'bg-muted/10'}
                  `}>
                                        {previewUrl ? (
                                            <div className="relative group">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="max-h-[300px] mx-auto rounded-lg shadow-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setSelectedFile(null)
                                                        setPreviewUrl(null)
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                                    <div className="p-4 bg-primary/10 rounded-full text-primary">
                                                        <Upload className="w-8 h-8" />
                                                    </div>
                                                    <p className="font-medium">Fotoğraf Yükle</p>
                                                    <p className="text-xs text-muted-foreground">veya sürükleyip bırakın</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notunuz</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Bu soru hakkında notlarınızı buraya yazın..."
                                        className="w-full h-32 px-4 py-3 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={() => uploadMutation.mutate()}
                                    disabled={!selectedFile || !subjectId || uploadMutation.isPending}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                                >
                                    {uploadMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Yükleniyor...
                                        </>
                                    ) : (
                                        'Kaydet'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
