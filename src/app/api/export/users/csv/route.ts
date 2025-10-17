import { verifyToken, secretKeyFetch } from '@/lib/token/token'
import { ApiDict } from '@/data/snipe_it_api/ApiDict'
import { NextRequest } from 'next/server'
import { utils } from 'xlsx'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value
  if (!token) return new Response('No token found', { status: 401 })

  const validation = verifyToken(token)
  if (!validation) return new Response('Invalid token', { status: 403 })

  const userData = await secretKeyFetch(token)
  if (!userData || typeof userData !== 'object' || !userData.secret) {
    return new Response('User data not found', { status: 403 })
  }

  const result = await ApiDict.listOfUsers(userData.secret, (userData.locationId ?? 0) as number)
  if (!result.success) return new Response(`API Error: ${result.error}`, { status: 500 })

  const extractRows = (payload: unknown): unknown[] => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    const p = payload as Record<string, unknown>
    if (p.success && Array.isArray(p.data)) return p.data as unknown[]
    if (p.data && typeof p.data === 'object' && Array.isArray((p.data as Record<string, unknown>).rows)) return (p.data as Record<string, unknown>).rows as unknown[]
    if (Array.isArray(p.rows)) return p.rows as unknown[]
    return []
  }

  const data = extractRows(result.data)

  const normalized = data.map((u) => {
    const user = u as Record<string, unknown>
    const location = user.location as Record<string, unknown> | undefined
    const department = user.department as Record<string, unknown> | undefined
    const company = user.company as Record<string, unknown> | undefined
    const manager = user.manager as Record<string, unknown> | undefined

    return {
      id: (user.id ?? '') as string | number,
      name: (user.name ?? '') as string,
      first_name: (user.first_name ?? '') as string,
      last_name: (user.last_name ?? '') as string,
      username: (user.username ?? '') as string,
      email: (user.email ?? '') as string,
      employee_num: (user.employee_num ?? '') as string,
      avatar: (user.avatar ?? '') as string,
      jobtitle: (user.jobtitle ?? '') as string,
      phone: (user.phone ?? '') as string,
      location_id: (location?.id ?? '') as string | number,
      location_name: (location?.name ?? '') as string,
      department_id: (department?.id ?? '') as string | number,
      department_name: (department?.name ?? '') as string,
      company_id: (company?.id ?? '') as string | number,
      company_name: (company?.name ?? '') as string,
      manager_id: (manager?.id ?? '') as string | number,
      manager_name: (manager?.name ?? '') as string,
      assets_count: (user.assets_count ?? '') as string | number,
      licenses_count: (user.licenses_count ?? '') as string | number,
      accessories_count: (user.accessories_count ?? '') as string | number,
      consumables_count: (user.consumables_count ?? '') as string | number,
      created_at: ((user.created_at as Record<string, unknown>)?.formatted ?? user.created_at ?? '') as string,
    }
  })

  const worksheet = utils.json_to_sheet(normalized)
  const csv = utils.sheet_to_csv(worksheet)

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `users-${ts}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
