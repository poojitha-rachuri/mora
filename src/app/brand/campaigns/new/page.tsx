'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Upload, Play, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

const CATEGORY_TIMING: Record<string, string> = {
  serum: '14-21 days post-purchase',
  moisturizer: '21-30 days post-purchase',
  cleanser: '7-14 days post-purchase',
  sunscreen: '7-14 days post-purchase',
  shampoo: '14-21 days post-purchase',
  conditioner: '14-21 days post-purchase',
  'hair mask': '21-28 days post-purchase',
  toner: '14-21 days post-purchase',
  'face wash': '7-14 days post-purchase',
  default: '14-21 days post-purchase',
}

function detectCategory(productName: string): string {
  const lower = productName.toLowerCase()
  for (const [key] of Object.entries(CATEGORY_TIMING)) {
    if (lower.includes(key)) return key
  }
  if (lower.includes('niacinamide') || lower.includes('vitamin c') || lower.includes('retinol')) return 'serum'
  if (lower.includes('acne') || lower.includes('wash')) return 'face wash'
  if (lower.includes('hair')) return 'shampoo'
  return 'serum'
}

interface ParsedRow {
  phone: string
  name?: string
  product_name?: string
  purchase_date?: string
  [key: string]: string | undefined
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'preview' | 'launching' | 'done'>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [campaignName, setCampaignName] = useState('')
  const [productName, setProductName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [detectedCategory, setDetectedCategory] = useState('')
  const [error, setError] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV is empty')
          return
        }
        const cols = results.meta.fields || []
        setHeaders(cols)

        // Map columns flexibly
        const mapped: ParsedRow[] = results.data.map((row) => {
          const phoneCol = cols.find(c => /phone|mobile|number/i.test(c))
          const nameCol = cols.find(c => /name|customer/i.test(c))
          const productCol = cols.find(c => /product/i.test(c))
          const dateCol = cols.find(c => /date|purchase/i.test(c))

          return {
            phone: phoneCol ? row[phoneCol] : '',
            name: nameCol ? row[nameCol] : undefined,
            product_name: productCol ? row[productCol] : undefined,
            purchase_date: dateCol ? row[dateCol] : undefined,
            ...row,
          }
        }).filter(r => r.phone)

        setRows(mapped)

        // Auto-detect product name
        const firstProductName = mapped[0]?.product_name || ''
        if (firstProductName && !productName) {
          setProductName(firstProductName)
          setDetectedCategory(detectCategory(firstProductName))
        }
        setStep('preview')
      },
      error: () => setError('Failed to parse CSV'),
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) processFile(file)
    else setError('Please upload a CSV file')
  }, [])

  const handleProductNameChange = (val: string) => {
    setProductName(val)
    setDetectedCategory(detectCategory(val))
  }

  const launch = async () => {
    if (!campaignName || !productName || !brandName) {
      setError('Please fill in all fields')
      return
    }
    setStep('launching')
    setError('')

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          product_name: productName,
          product_category: detectedCategory,
          brand_name: brandName,
          contacts: rows,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Launch failed')
      }

      const data = await res.json()
      setCampaignId(data.campaign.id)
      setStep('done')
    } catch (e) {
      setError((e as Error).message)
      setStep('preview')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-xl font-bold text-rose-500">TrueGlow</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">New Campaign</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {step === 'upload' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Launch Voice Feedback Campaign</h1>
              <p className="mt-1 text-gray-500">Upload your buyer CSV to start Ava calling your customers.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors ${
                isDragging ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50/30'
              }`}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={40} />
              <p className="text-gray-700 font-medium mb-2">Drop your buyer CSV here</p>
              <p className="text-sm text-gray-500 mb-6">Needs: phone column. Optional: name, product_name, purchase_date</p>
              <label className="px-5 py-2.5 bg-rose-500 text-white rounded-lg cursor-pointer hover:bg-rose-600 transition-colors font-medium">
                Browse File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>CSV format:</strong> phone, name, product_name, purchase_date — headers are auto-detected
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Preview & Configure</h1>
                <p className="text-gray-500">{rows.length} contacts ready for voice outreach</p>
              </div>
              <button onClick={() => { setStep('upload'); setRows([]); setHeaders([]) }} className="text-sm text-gray-500 hover:text-gray-700">
                Change file
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder="e.g. Minimalist Q2 Feedback"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  value={productName}
                  onChange={e => handleProductNameChange(e.target.value)}
                  placeholder="e.g. Minimalist 10% Niacinamide"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Minimalist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            {detectedCategory && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={16} className="text-green-600" />
                <div className="text-sm">
                  <span className="font-medium text-green-800">Category detected: {detectedCategory}</span>
                  <span className="text-green-600 ml-2">— Recommended callback: {CATEGORY_TIMING[detectedCategory] || CATEGORY_TIMING.default}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                Contact Preview ({Math.min(rows.length, 5)} of {rows.length})
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {headers.slice(0, 5).map(h => (
                      <th key={h} className="px-4 py-2 text-left text-gray-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      {headers.slice(0, 5).map(h => (
                        <td key={h} className="px-4 py-2 text-gray-700">{String(row[h] || '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={launch}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors shadow-md shadow-rose-200"
            >
              <Play size={16} />
              Launch Campaign ({rows.length} calls)
            </button>
          </div>
        )}

        {step === 'launching' && (
          <div className="text-center py-24">
            <Loader2 className="mx-auto mb-4 text-rose-500 animate-spin" size={48} />
            <h2 className="text-xl font-semibold text-gray-800">Launching campaign…</h2>
            <p className="text-gray-500 mt-2">Creating Ringg.ai campaign and registering webhook</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-24">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-800">Campaign launched!</h2>
            <p className="text-gray-500 mt-2 mb-8">Ava is calling your buyers. Analytics will populate as calls complete.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/brand/campaigns/${campaignId}/analytics`)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                View Analytics <ArrowRight size={16} />
              </button>
              <button
                onClick={() => router.push(`/brand/campaigns/${campaignId}/calls`)}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                View Call Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
