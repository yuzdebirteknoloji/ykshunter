'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Upload, CheckSquare, Square, Trash2, Camera, Image as ImageIcon, ChevronRight, ChevronDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMindmapAnalyses, createMindmapAnalysis, deleteMindmapAnalysis, toggleMindmapAnalysisSolved, MindmapAnalysis } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'

// ==========================================
// TREE DATA STRUCTURE
// ==========================================
type NodeBase = { id: string; label: string }
type LeafNode = NodeBase & { type: 'leaf'; examType: string; courseName: string; unitName: string | null }
type BranchNode = NodeBase & { type: 'branch'; children: TreeNode[] }
export type TreeNode = LeafNode | BranchNode

export const YKS_TREE: TreeNode[] = [
  {
    id: 'tyt', label: 'TYT', type: 'branch', children: [
        { id: 'tyt-mat', label: 'Matematik', type: 'leaf', examType: 'TYT', courseName: 'Matematik', unitName: null },
        { id: 'tyt-fiz', label: 'Fizik', type: 'branch', children: [
            { id: 'tf1', label: 'Fizik Bilimine Giriş', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Fizik Bilimine Giriş' },
            { id: 'tf2', label: 'Madde ve Özellikleri', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Madde ve Özellikleri' },
            { id: 'tf3', label: 'Hareket ve Kuvvet', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Hareket ve Kuvvet' },
            { id: 'tf4', label: 'Isı ve Sıcaklık', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Isı ve Sıcaklık' },
            { id: 'tf5', label: 'Elektrik ve Manyetizma', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Elektrik ve Manyetizma' },
            { id: 'tf6', label: 'Optik', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Optik' },
            { id: 'tf7', label: 'Dalgalar', type: 'leaf', examType: 'TYT', courseName: 'Fizik', unitName: 'Dalgalar' },
        ]},
        { id: 'tyt-kim', label: 'Kimya', type: 'branch', children: [
            { id: 'tk1', label: 'Kimya Bilimi', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Kimya Bilimi' },
            { id: 'tk2', label: 'Atom ve Periyodik Sistem', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Atom ve Periyodik Sistem' },
            { id: 'tk3', label: 'Etkileşimler', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Etkileşimler' },
            { id: 'tk4', label: 'Maddenin Halleri', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Maddenin Halleri' },
            { id: 'tk5', label: 'Karışımlar', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Karışımlar' },
            { id: 'tk6', label: 'Asitler Bazlar ve Tuzlar', type: 'leaf', examType: 'TYT', courseName: 'Kimya', unitName: 'Asitler Bazlar ve Tuzlar' },
        ]},
        { id: 'tyt-biy', label: 'Biyoloji', type: 'branch', children: [
            { id: 'tb1', label: 'Yaşam Bilimi Biyoloji', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Yaşam Bilimi' },
            { id: 'tb2', label: 'Hücre', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Hücre' },
            { id: 'tb3', label: 'Canlılar Dünyası', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Canlılar Dünyası' },
            { id: 'tb4', label: 'Hücre Bölünmeleri', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Hücre Bölünmeleri' },
            { id: 'tb5', label: 'Kalıtım', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Kalıtım' },
            { id: 'tb6', label: 'Ekosistem Ekolojisi', type: 'leaf', examType: 'TYT', courseName: 'Biyoloji', unitName: 'Ekosistem' },
        ]},
        { id: 'tyt-sos', label: 'Sosyal', type: 'branch', children: [
            { id: 'ts1', label: 'Tarih', type: 'leaf', examType: 'TYT', courseName: 'Tarih', unitName: null },
            { id: 'ts2', label: 'Coğrafya', type: 'leaf', examType: 'TYT', courseName: 'Coğrafya', unitName: null },
            { id: 'ts3', label: 'Felsefe', type: 'leaf', examType: 'TYT', courseName: 'Felsefe', unitName: null },
            { id: 'ts4', label: 'Din Kültürü', type: 'leaf', examType: 'TYT', courseName: 'Din', unitName: null },
        ]}
    ]
  },
  {
    id: 'ayt', label: 'AYT', type: 'branch', children: [
        { id: 'ayt-mat', label: 'Matematik', type: 'leaf', examType: 'AYT', courseName: 'Matematik', unitName: null },
        { id: 'ayt-fiz', label: 'Fizik', type: 'branch', children: [
            { id: 'af1', label: 'Kuvvet ve Hareket', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Kuvvet ve Hareket' },
            { id: 'af2', label: 'Çembersel Hareket', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Çembersel Hareket' },
            { id: 'af3', label: 'Basit Harmonik Hareket', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Basit Harmonik Hareket' },
            { id: 'af4', label: 'Dalga Mekaniği', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Dalga Mekaniği' },
            { id: 'af5', label: 'Atom Fiziği & Radyoaktivite', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Atom Fiziği & Radyoaktivite' },
            { id: 'af6', label: 'Modern Fizik', type: 'leaf', examType: 'AYT', courseName: 'Fizik', unitName: 'Modern Fizik' },
        ]},
        { id: 'ayt-kim', label: 'Kimya', type: 'branch', children: [
            { id: 'ak1', label: 'Modern Atom Teorisi', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Modern Atom Teorisi' },
            { id: 'ak2', label: 'Gazlar', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Gazlar' },
            { id: 'ak3', label: 'Sıvı Çözeltiler', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Sıvı Çözeltiler' },
            { id: 'ak4', label: 'Sistemlerde Entalpi ve Hız', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Entalpi ve Hız' },
            { id: 'ak5', label: 'Kimyasal Tepkimelerde Denge', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Denge' },
            { id: 'ak6', label: 'Kimya ve Elektrik', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Kimya ve Elektrik' },
            { id: 'ak7', label: 'Organik Kimya', type: 'leaf', examType: 'AYT', courseName: 'Kimya', unitName: 'Organik Kimya' },
        ]},
        { id: 'ayt-biy', label: 'Biyoloji', type: 'branch', children: [
            { id: 'ab1', label: 'İnsan Fizyolojisi', type: 'leaf', examType: 'AYT', courseName: 'Biyoloji', unitName: 'İnsan Fizyolojisi' },
            { id: 'ab2', label: 'Komünite ve Popülasyon Ekolojisi', type: 'leaf', examType: 'AYT', courseName: 'Biyoloji', unitName: 'Ekoloji' },
            { id: 'ab3', label: 'Genden Proteine', type: 'leaf', examType: 'AYT', courseName: 'Biyoloji', unitName: 'Genden Proteine' },
            { id: 'ab4', label: 'Canlılarda Enerji Dönüşümleri', type: 'leaf', examType: 'AYT', courseName: 'Biyoloji', unitName: 'Enerji Dönüşümleri' },
            { id: 'ab5', label: 'Bitki Biyolojisi', type: 'leaf', examType: 'AYT', courseName: 'Biyoloji', unitName: 'Bitki Biyolojisi' },
        ]},
    ]
  },
  {
    id: 'geo', label: 'Geometri', type: 'branch', children: [
        { id: 'g1', label: 'Doğruda ve Üçgende Açılar', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Açılar' },
        { id: 'g2', label: 'Üçgenler', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Üçgenler' },
        { id: 'g3', label: 'Çokgenler ve Dörtgenler', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Çokgenler Dörtgenler' },
        { id: 'g4', label: 'Çember ve Daire', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Çember Daire' },
        { id: 'g5', label: 'Katı Cisimler', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Katı Cisimler' },
        { id: 'g6', label: 'Analitik Geometri', type: 'leaf', examType: 'Geometri', courseName: 'Geometri', unitName: 'Analitik Geometri' },
    ]
  }
]

// Finds leaf node recursively from current ID
const findLeafById = (nodes: TreeNode[], id: string): LeafNode | null => {
  for (const node of nodes) {
    if (node.id === id && node.type === 'leaf') return node as LeafNode;
    if (node.type === 'branch') {
        const found = findLeafById(node.children, id);
        if (found) return found;
    }
  }
  return null;
}

const findPathToNode = (nodes: TreeNode[], targetId: string, path: string[] = []): string[] | null => {
    for (const node of nodes) {
        if (node.id === targetId) return [...path, node.id];
        if (node.type === 'branch') {
            const res = findPathToNode(node.children, targetId, [...path, node.id]);
            if (res) return res;
        }
    }
    return null;
}

export default function MindmapAnalysisPage() {
    // We enforce a pure black dark mode context specifically for this page.
    useEffect(() => {
        document.documentElement.classList.add('dark')
    }, [])

    const [activePath, setActivePath] = useState<string[]>([])
    const [selectedLeaf, setSelectedLeaf] = useState<LeafNode | null>(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState<MindmapAnalysis | null>(null)

    // Handle clicking a node in the tree
    const handleNodeClick = (node: TreeNode, depth: number) => {
        if (node.type === 'leaf') {
            const path = findPathToNode(YKS_TREE, node.id) || [node.id]
            setActivePath(path)
            setSelectedLeaf(node)
        } else {
            // It's a branch. Toggle or set path
            const pathIndex = activePath.indexOf(node.id);
            if (pathIndex > -1 && pathIndex === activePath.length - 1) {
                // Clicking the already open branch closes it (collapses back to parent)
                setActivePath(activePath.slice(0, pathIndex))
                setSelectedLeaf(null)
            } else {
                // Expanding new branch
                const path = findPathToNode(YKS_TREE, node.id) || [node.id]
                setActivePath(path)
                setSelectedLeaf(null)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#000000] text-gray-200 font-sans p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-5xl mb-12 text-center md:text-left mt-6 border-b border-white/10 pb-6 flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-light tracking-wider text-white">
                        Ağaç <span className="font-semibold">Analizi</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm tracking-wide">
                        Odak Modu ile hiyerarşik deneme ve hata takibi. Minimalist siyah.
                    </p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left side: Mindmap Tree */}
                <div className="w-full lg:w-1/3 shrink-0 relative">
                    <div className="sticky top-8">
                        <MindmapLevel 
                            nodes={YKS_TREE} 
                            activePath={activePath} 
                            onNodeClick={handleNodeClick} 
                            depth={0} 
                        />
                    </div>
                </div>

                {/* Right side: Questions List for Selected Node */}
                <div className="w-full lg:w-2/3 flex-1 pb-32">
                    <AnimatePresence mode="wait">
                        {selectedLeaf ? (
                            <motion.div 
                                key={selectedLeaf.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                <QuestionsList 
                                    leaf={selectedLeaf} 
                                    onImageClick={setPreviewImage} 
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]"
                            >
                                <div className="p-5 bg-white/5 rounded-full mb-4">
                                    <ImageIcon className="w-8 h-8 text-white/30" />
                                </div>
                                <h3 className="text-xl text-white/70 font-light mb-2">Düğüm Seçilmedi</h3>
                                <p className="text-gray-500 text-sm max-w-[250px]">
                                    Sorularınızı listelemek için soldaki ağaçtan bir ünite seçin.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile-Friendly FAB */}
            <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* Modals */}
            <UploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                defaultLeaf={selectedLeaf} 
            />

            <AnimatePresence>
                {previewImage && (
                    <ImagePreviewModal analysis={previewImage} onClose={() => setPreviewImage(null)} />
                )}
            </AnimatePresence>
        </div>
    )
}

// ==========================================
// TREE COMPONENTS
// ==========================================
function MindmapLevel({ nodes, activePath, onNodeClick, depth }: { nodes: TreeNode[], activePath: string[], onNodeClick: (n: TreeNode, d: number) => void, depth: number }) {
    return (
        <div className="flex flex-col space-y-1">
            {nodes.map(node => {
                const isActiveOrAncestor = activePath.includes(node.id);
                const isSelected = activePath[activePath.length - 1] === node.id;
                
                // Odak Modu: If depth > 0, we hide non-active siblings. (Focus constraint requested)
                // Actually, hiding siblings completely might prevent navigation. 
                // Let's just dim them heavily or collapse their children.
                const isSibling = !isActiveOrAncestor && activePath.length > depth && activePath[depth-1] === findParentId(activePath, depth);
                
                return (
                    <div key={node.id} className="relative">
                        <button
                            onClick={() => onNodeClick(node, depth)}
                            className={`
                                flex items-center justify-between w-full text-left py-2 px-3 rounded-lg transition-all duration-300
                                ${isSelected ? 'bg-white/10 text-white font-medium' : isActiveOrAncestor ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                            `}
                            style={{ paddingLeft: `${(depth * 1) + 0.75}rem` }}
                        >
                            <span className="flex items-center gap-2">
                                {depth > 0 && <span className="w-[1px] h-4 bg-white/20 absolute left-[calc(0.75rem-1px)] top-1/2 -translate-y-1/2" />}
                                {node.label}
                            </span>
                            {node.type === 'branch' && (
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActiveOrAncestor ? 'rotate-90' : ''}`} />
                            )}
                        </button>
                        
                        {/* Recursive Children render */}
                        <AnimatePresence>
                            {node.type === 'branch' && isActiveOrAncestor && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden border-l border-white/10 ml-3 my-1"
                                >
                                    <MindmapLevel nodes={node.children} activePath={activePath} onNodeClick={onNodeClick} depth={depth + 1} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}

function findParentId(path: string[], depth: number) {
    if (depth === 0) return null;
    return path[depth - 1];
}

// ==========================================
// QUESTION GRID COMPONENT
// ==========================================
function QuestionsList({ leaf, onImageClick }: { leaf: LeafNode, onImageClick: (a: MindmapAnalysis) => void }) {
    const queryClient = useQueryClient()
    
    const { data: analyses = [], isLoading } = useQuery({
        queryKey: ['mindmap-analyses', leaf.examType, leaf.courseName, leaf.unitName],
        queryFn: () => getMindmapAnalyses(leaf.examType, leaf.courseName, leaf.unitName)
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, isSolved }: { id: string, isSolved: boolean }) => toggleMindmapAnalysisSolved(id, isSolved),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mindmap-analyses'] }) },
        onError: () => { toast.error('Durum güncellenirken hata oluştu') }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteMindmapAnalysis,
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['mindmap-analyses'] })
            toast.success('Analiz silindi')
        }
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />)}
            </div>
        )
    }

    if (analyses.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full min-h-[300px] border border-white/5 rounded-2xl bg-white/[0.02]">
                <p className="text-white/40 text-sm">Buraya henüz soru eklenmemiş.</p>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl text-white mb-6 font-light border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                    <span className="text-gray-500 text-sm mr-2">{leaf.examType} / {leaf.courseName}</span>
                    <br/>
                    {leaf.unitName || 'Genel Sorular'}
                </div>
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-white/70">{analyses.length} Soru</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {analyses.map(analysis => (
                    <div key={analysis.id} className="group relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-colors">
                        
                        {/* Thumbnail Image */}
                        <div 
                            className="aspect-square bg-black overflow-hidden cursor-pointer"
                            onClick={() => onImageClick(analysis)}
                        >
                            <img src={analysis.image_url} alt="q" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Bottom Bar: Action & Mini Note */}
                        <div className="p-3 bg-[#0a0a0a] flex items-start gap-2">
                            <button 
                                onClick={() => toggleMutation.mutate({ id: analysis.id, isSolved: !analysis.is_solved })}
                                className="mt-[2px] shrink-0 text-white/50 hover:text-white transition-colors"
                            >
                                {analysis.is_solved ? <CheckSquare className="w-5 h-5 text-green-400" /> : <Square className="w-5 h-5" />}
                            </button>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-tight flex-1" title={analysis.note || ''}>
                                {analysis.note || <span className="italic opacity-50">Not yok</span>}
                            </p>
                            <button 
                                onClick={() => { if(confirm('Silmek istediğinize emin misiniz?')) deleteMutation.mutate(analysis.id) }} 
                                className="shrink-0 text-white/20 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}


// ==========================================
// UPLOAD MODAL
// ==========================================
function UploadModal({ isOpen, onClose, defaultLeaf }: { isOpen: boolean, onClose: () => void, defaultLeaf: LeafNode | null }) {
    const queryClient = useQueryClient()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [note, setNote] = useState('')
    const [selectedLeaf, setSelectedLeaf] = useState<LeafNode | null>(defaultLeaf)

    useEffect(() => {
        if (isOpen) setSelectedLeaf(defaultLeaf);
        if (!isOpen) { setFile(null); setPreview(null); setNote(''); }
    }, [isOpen, defaultLeaf])

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFile(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!file || !selectedLeaf) throw new Error('Eksik bilgi')
            const url = await uploadToCloudinary(file)
            await createMindmapAnalysis({
                exam_type: selectedLeaf.examType,
                course_name: selectedLeaf.courseName,
                unit_name: selectedLeaf.unitName,
                image_url: url,
                note: note.trim()
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mindmap-analyses'] })
            toast.success('Eklendi')
            onClose()
        },
        onError: (err: any) => toast.error(err.message)
    })

    // To allow picking directly from Camera (Mobile Priority), user just clicks upload space
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-[#111] border border-white/10 w-full max-w-lg rounded-t-3xl md:rounded-2xl p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-medium text-white">Soru Ekle</h3>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
                        </div>

                        {!selectedLeaf ? (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                Lütfen önce arka plandaki ağaçtan bir ünite/ders seçin. (Veya menüden tıklayıp gelin).
                            </div>
                        ) : (
                            <div className="mb-6 text-sm text-gray-400">
                                Hedef: <span className="text-white font-medium bg-white/10 px-2 py-1 rounded">{selectedLeaf.examType} ➔ {selectedLeaf.courseName} {selectedLeaf.unitName ? `➔ ${selectedLeaf.unitName}` : ''}</span>
                            </div>
                        )}

                        <div className="grid gap-6">
                            {/* Upload Area */}
                            <div className={`relative border-2 border-dashed ${preview ? 'border-white/20 bg-black' : 'border-white/10 bg-white/5 hover:border-white/30'} rounded-2xl p-2 transition-all`}>
                                {preview ? (
                                    <div className="relative group rounded-xl overflow-hidden">
                                        <img src={preview} alt="preview" className="w-full max-h-[30vh] object-contain bg-black" />
                                        <button onClick={() => { setFile(null); setPreview(null) }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-8 cursor-pointer h-[20vh] text-center">
                                        <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
                                        <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-3">
                                            <Camera className="w-6 h-6" />
                                        </div>
                                        <p className="text-white font-medium mb-1">Fotoğraf Çek / Seç</p>
                                        <p className="text-xs text-gray-400">Mobil kameranızla doğrudan çekebilirsiniz</p>
                                    </label>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <textarea 
                                    value={note} 
                                    onChange={e => setNote(e.target.value)} 
                                    rows={3}
                                    placeholder="Tek cümlelik hata analizi veya not (Opsiyonel)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <button 
                                onClick={() => uploadMutation.mutate()}
                                disabled={!file || !selectedLeaf || uploadMutation.isPending}
                                className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {uploadMutation.isPending ? 'Sisteme Yükleniyor...' : 'Ağaca Ekle'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

// ==========================================
// IMAGE PREVIEW MODAL (FULL SCREEN)
// ==========================================
function ImagePreviewModal({ analysis, onClose }: { analysis: MindmapAnalysis, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50">
                <div className="text-gray-400 text-sm">
                    {analysis.exam_type} &bull; {analysis.course_name} {analysis.unit_name ? `• ${analysis.unit_name}` : ''}
                </div>
                <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-hidden p-4 flex justify-center items-center">
                <img src={analysis.image_url} alt="Question Full" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>

            {analysis.note && (
                <div className="p-6 bg-black/80 border-t border-white/10 text-center">
                    <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">{analysis.note}</p>
                </div>
            )}
        </div>
    )
}
