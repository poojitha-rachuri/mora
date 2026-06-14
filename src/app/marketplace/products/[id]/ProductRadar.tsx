'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface Props {
  data: { dim: string; value: number }[]
}

export default function ProductRadar({ data }: Props) {
  if (data.every(d => d.value === 0)) {
    return <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Data pending</div>
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
