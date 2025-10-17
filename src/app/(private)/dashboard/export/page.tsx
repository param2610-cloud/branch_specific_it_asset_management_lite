"use client"
import React, { useState } from 'react'
import { DocumentIcon, ArrowDownTrayIcon, UsersIcon } from '@heroicons/react/24/outline'

const Page = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const downloadFromServer = async (path: string) => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(path)
            if (!res.ok) throw new Error(`Server responded with ${res.status}`)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const cd = res.headers.get('Content-Disposition')
            a.download = cd?.split('filename=')?.[1]?.replace(/\"/g, '') ?? path.split('/').pop() ?? 'export'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (err: unknown) {
            console.error('Server export failed', err)
            const message = err instanceof Error ? err.message : String(err)
            setError(message ?? 'Export failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {error && <div className="col-span-2 text-red-600">{error}</div>}

            <div className="bg-gray-850 p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded">
                        <DocumentIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Assets export</h2>
                        <p className="text-sm text-gray-300 mt-1">Download the assets list as XLSX or CSV. Generated on the server.</p>
                        <div className="mt-4 flex gap-2">
                            <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                                onClick={() => downloadFromServer('/api/export/xlsx')}
                                disabled={loading}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                {loading ? 'Exporting...' : 'Download XLSX'}
                            </button>

                            <button
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded flex items-center gap-2"
                                onClick={() => downloadFromServer('/api/export/csv')}
                                disabled={loading}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                {loading ? 'Exporting...' : 'Download CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-850 p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-600 rounded">
                        <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Users export</h2>
                        <p className="text-sm text-gray-300 mt-1">Download the users list as XLSX or CSV. Generated on the server.</p>
                        <div className="mt-4 flex gap-2">
                            <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                                onClick={() => downloadFromServer('/api/export/users/xlsx')}
                                disabled={loading}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                {loading ? 'Exporting...' : 'Download XLSX'}
                            </button>

                            <button
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded flex items-center gap-2"
                                onClick={() => downloadFromServer('/api/export/users/csv')}
                                disabled={loading}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                {loading ? 'Exporting...' : 'Download CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page