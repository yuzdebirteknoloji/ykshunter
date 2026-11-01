/**
 * Toplu içe aktarma için oyun şablonları ve NotebookLM'e yapıştırılacak hazır promptlar.
 * Admin paneli ve ilk açılış rehberi bu dosyayı kullanır.
 */

export type ImportMode = 'sequence' | 'matching' | 'grouping'

export interface GameTemplate {
  mode: ImportMode
  label: string
  emoji: string
  description: string
  rule: string
  example: object
}

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    mode: 'sequence',
    label: 'Sıralama',
    emoji: '📊',
    description: 'Adımları doğru sıraya diz',
    rule:
      '"data" doğru sırayla yazılmış 4-8 adımdan oluşan bir metin dizisi olsun. Uygulama sırayı karıştırıp öğrenciye yeniden sıralatacak, bu yüzden adımları KESİNLİKLE doğru sırada yaz.',
    example: {
      subject: 'AYT Biyoloji',
      topic: 'Duyu Organları',
      games: [
        {
          id: 'sequence_gorme_01',
          title: 'Görme Olayının Gerçekleşme Sırası',
          mode: 'sequence',
          data: [
            'Işığın korneada ilk kez kırılması',
            'Göz bebeğinden geçip göz merceğinde ikinci kez kırılması',
            'Camsı sıvıdan geçerek retinadaki sarı benek üzerine ters düşmesi',
            'Fotoreseptörlerin (koni ve çubuk) uyarılıp impuls oluşturması',
            'İmpulsların talamusa uğradıktan sonra beyin kabuğundaki görme merkezine ulaşması',
          ],
        },
      ],
    },
  },
  {
    mode: 'matching',
    label: 'Eşleştirme',
    emoji: '🔗',
    description: 'Kavramı tanımıyla eşleştir',
    rule:
      '"data" 4-8 adet {"key": ..., "value": ...} çiftinden oluşsun. "key" kısa bir kavram, "value" onun kısa ve net açıklaması olsun (en fazla ~20 kelime). Açıklamalar birbirine çok benzemesin ki eşleştirme anlamlı olsun.',
    example: {
      subject: 'AYT Biyoloji',
      topic: 'Dolaşım Sistemi',
      games: [
        {
          id: 'matching_dolasim_01',
          title: 'Kalbin Tabakaları ve İşlevleri',
          mode: 'matching',
          data: [
            {
              key: 'Perikard',
              value: 'Kalbi dıştan saran, arasında sürtünmeyi azaltan sıvı bulunan iki katlı koruyucu zar',
            },
            {
              key: 'Miyokard',
              value: 'Kalp kasının bulunduğu, kalbi besleyen koroner damarları içeren orta tabaka',
            },
            {
              key: 'Endokard',
              value: 'Kalbin iç yüzeyini kaplayan, kan damarı içermeyen tek katlı yassı epitel tabakası',
            },
            {
              key: 'Sinoatriyal Düğüm (SA)',
              value: 'Sağ kulakçık duvarında bulunan ve kalbin ritmik kasılma uyarısını başlatan ana merkez',
            },
          ],
        },
      ],
    },
  },
  {
    mode: 'grouping',
    label: 'Gruplama',
    emoji: '📦',
    description: 'Öğeleri doğru kategoriye ayır',
    rule:
      '"data" 6-12 adet {"item": ..., "category": ...} öğesinden oluşsun. Toplam 2-4 farklı kategori olsun ve aynı kategorinin adı her öğede BİREBİR aynı yazılsın (büyük/küçük harf ve parantezler dahil).',
    example: {
      subject: 'AYT Biyoloji',
      topic: 'Sindirim Sistemi',
      games: [
        {
          id: 'grouping_sindirim_01',
          title: 'Besin Monomerlerinin İnce Bağırsaktan Emilim Yolları',
          mode: 'grouping',
          data: [
            { item: 'Glikoz', category: 'Kan Kılcalları (Kapı Toplardamarı Yolu)' },
            { item: 'Amino Asitler', category: 'Kan Kılcalları (Kapı Toplardamarı Yolu)' },
            { item: 'B ve C Vitaminleri', category: 'Kan Kılcalları (Kapı Toplardamarı Yolu)' },
            { item: 'Yağ Asitleri ve Gliserol (Şilomikron)', category: 'Lenf Kılcalları (Peke Sarnıcı Yolu)' },
            { item: 'A, D, E, K Vitaminleri', category: 'Lenf Kılcalları (Peke Sarnıcı Yolu)' },
          ],
        },
      ],
    },
  },
]

export function exampleJson(t: GameTemplate) {
  return JSON.stringify(t.example, null, 2)
}

/** NotebookLM sohbetine yapıştırılacak prompt */
export function buildPrompt(t: GameTemplate) {
  return `Yüklediğim kaynaklara dayanarak YKS'ye hazırlanan bir öğrenci için "${t.label}" (${t.mode}) türünde öğretici oyunlar hazırla.

KURALLAR:
1. Cevabını SADECE geçerli JSON olarak ver. Açıklama, yorum, markdown veya \`\`\` işareti EKLEME.
2. "subject": dersin adı (ör. "AYT Biyoloji", "TYT Tarih"). "topic": konunun adı.
3. "games" dizisine 3-5 farklı oyun koy. Her oyunun "id" değeri benzersiz olsun, "title" oyunun kısa başlığı olsun ve "mode" değeri mutlaka "${t.mode}" olsun.
4. ${t.rule}
5. Bilgiler kaynaklarla birebir uyumlu, doğru ve YKS seviyesinde olsun. Kaynakta olmayan bilgi uydurma.

TAM OLARAK BU FORMATTA CEVAP VER (örnek):
${exampleJson(t)}

Konu: [BURAYA KONU ADINI YAZ]`
}

/** Panoya kopyalar; eski WebView'larda yedek yöntem kullanır. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

// ------------------- doğrulama -------------------

export interface ImportPackage {
  subject: string
  topic: string
  games: { id?: string; title?: string; mode: ImportMode; data: any }[]
}

/**
 * NotebookLM'in cevabını okur: ```json bloklarını, baştaki/sondaki açıklamaları
 * temizler. Tek paket, paket dizisi veya art arda yapıştırılmış birden fazla paket olabilir.
 */
export function parseImportText(raw: string): ImportPackage[] {
  let text = raw.trim().replace(/```(?:json)?/gi, '').trim()
  // Baştaki/sondaki açıklama metinlerini at
  const first = text.search(/[[{]/)
  const last = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
  if (first === -1 || last === -1) throw new Error('Metinde JSON bulunamadı')
  text = text.slice(first, last + 1)

  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    // Art arda yapıştırılmış birden fazla paket: "}{" → "},{"
    try {
      parsed = JSON.parse('[' + text.replace(/}\s*{/g, '},{') + ']')
    } catch (e: any) {
      throw new Error('JSON okunamadı. Eksik parantez veya virgül olabilir. (' + e.message + ')')
    }
  }
  const packages: any[] = Array.isArray(parsed) ? parsed : [parsed]
  return packages.map((p, i) => validatePackage(p, packages.length > 1 ? i + 1 : null))
}

function validatePackage(p: any, index: number | null): ImportPackage {
  const where = index ? `${index}. pakette: ` : ''
  if (!p || typeof p !== 'object') throw new Error(`${where}JSON bir nesne olmalı`)
  if (!p.subject || typeof p.subject !== 'string') throw new Error(`${where}"subject" (ders adı) eksik`)
  if (!p.topic || typeof p.topic !== 'string') throw new Error(`${where}"topic" (konu adı) eksik`)
  if (!Array.isArray(p.games) || !p.games.length) throw new Error(`${where}"games" listesi boş veya eksik`)

  p.games.forEach((g: any, gi: number) => {
    const name = `${where}${gi + 1}. oyun${g?.title ? ` ("${g.title}")` : ''}`
    if (!['sequence', 'matching', 'grouping'].includes(g?.mode)) {
      throw new Error(`${name}: "mode" sequence, matching veya grouping olmalı`)
    }
    if (!Array.isArray(g.data) || g.data.length < 2) throw new Error(`${name}: "data" en az 2 öğe içermeli`)
    if (g.mode === 'sequence' && !g.data.every((x: any) => typeof x === 'string' && x.trim())) {
      throw new Error(`${name}: sıralama oyununda "data" metinlerden oluşmalı`)
    }
    if (g.mode === 'matching' && !g.data.every((x: any) => x?.key && x?.value)) {
      throw new Error(`${name}: eşleştirmede her öğede "key" ve "value" olmalı`)
    }
    if (g.mode === 'grouping') {
      if (!g.data.every((x: any) => x?.item && x?.category)) {
        throw new Error(`${name}: gruplamada her öğede "item" ve "category" olmalı`)
      }
      if (new Set(g.data.map((x: any) => String(x.category).trim())).size < 2) {
        throw new Error(`${name}: gruplamada en az 2 farklı kategori olmalı`)
      }
    }
  })
  return { subject: p.subject.trim(), topic: p.topic.trim(), games: p.games }
}
