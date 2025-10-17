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
  if (!userData || typeof userData !== 'object' || !userData.secret || !userData.locationId) {
    return new Response('User data not found', { status: 403 })
  }

  const result = await ApiDict.allAssetFetch(userData.secret, userData.locationId)
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

    const normalized = data.map((row) => {
      const r = row as Record<string, unknown>
      const out: Record<string, unknown> = {}

    const rr = r as Record<string, unknown>

    out.id = rr['id'] ?? ''
    out.name = rr['name'] ?? ''
    out.asset_tag = rr['asset_tag'] ?? ''
    out.serial = rr['serial'] ?? ''

    const model = rr['model'] as Record<string, unknown> | undefined
    out.model_id = model?.['id'] ?? ''
    out.model_name = model?.['name'] ?? ''

    out.byod = rr['byod'] ?? ''
    out.model_number = rr['model_number'] ?? ''
    out.eol = rr['eol'] ?? ''
    out.asset_eol_date = (rr['asset_eol_date'] as Record<string, unknown>)?.['formatted'] ?? rr['asset_eol_date'] ?? ''

    const status = rr['status_label'] as Record<string, unknown> | undefined
    out.status_id = status?.['id'] ?? ''
    out.status_name = status?.['name'] ?? ''
    out.status_meta = status?.['status_meta'] ?? ''

    const category = rr['category'] as Record<string, unknown> | undefined
    out.category_id = category?.['id'] ?? ''
    out.category_name = category?.['name'] ?? ''

    const manufacturer = rr['manufacturer'] as Record<string, unknown> | undefined
    out.manufacturer_id = manufacturer?.['id'] ?? ''
    out.manufacturer_name = manufacturer?.['name'] ?? ''

    const supplier = rr['supplier'] as Record<string, unknown> | undefined
    out.supplier_id = supplier?.['id'] ?? ''
    out.supplier_name = supplier?.['name'] ?? ''

    out.notes = rr['notes'] ?? ''
    out.order_number = rr['order_number'] ?? ''

    const company = rr['company'] as Record<string, unknown> | undefined
    out.company_id = company?.['id'] ?? ''
    out.company_name = company?.['name'] ?? ''

    const location = rr['location'] as Record<string, unknown> | undefined
    out.location_id = location?.['id'] ?? ''
    out.location_name = location?.['name'] ?? ''

    const rtd_location = rr['rtd_location'] as Record<string, unknown> | undefined
    out.rtd_location_id = rtd_location?.['id'] ?? ''
    out.rtd_location_name = rtd_location?.['name'] ?? ''

    out.image = rr['image'] ?? ''
    out.qr = rr['qr'] ?? ''
    out.alt_barcode = rr['alt_barcode'] ?? ''

    const assigned = rr['assigned_to'] as Record<string, unknown> | undefined
    if (assigned) {
      out.assigned_to_id = assigned['id'] ?? ''
      out.assigned_to_name = assigned['name'] ?? ''
    } else {
      out.assigned_to_id = rr['assigned_to'] ?? ''
      out.assigned_to_name = ''
    }

    out.warranty_months = rr['warranty_months'] ?? ''
    out.warranty_expires = (rr['warranty_expires'] as Record<string, unknown>)?.['formatted'] ?? rr['warranty_expires'] ?? ''

    out.created_at = (rr['created_at'] as Record<string, unknown>)?.['formatted'] ?? rr['created_at'] ?? ''
    out.updated_at = (rr['updated_at'] as Record<string, unknown>)?.['formatted'] ?? rr['updated_at'] ?? ''
    out.last_audit_date = (rr['last_audit_date'] as Record<string, unknown>)?.['formatted'] ?? rr['last_audit_date'] ?? ''
    out.next_audit_date = (rr['next_audit_date'] as Record<string, unknown>)?.['formatted'] ?? rr['next_audit_date'] ?? ''
    out.deleted_at = rr['deleted_at'] ?? ''

    out.purchase_date = (rr['purchase_date'] as Record<string, unknown>)?.['formatted'] ?? rr['purchase_date'] ?? ''
    out.age = rr['age'] ?? ''
    out.last_checkout = rr['last_checkout'] ?? ''
    out.expected_checkin = rr['expected_checkin'] ?? ''
    out.purchase_cost = rr['purchase_cost'] ?? ''

    out.checkin_counter = rr['checkin_counter'] ?? ''
    out.checkout_counter = rr['checkout_counter'] ?? ''
    out.requests_counter = rr['requests_counter'] ?? ''

    out.user_can_checkout = rr['user_can_checkout'] ?? ''
    out.book_value = rr['book_value'] ?? ''
    out.custom_fields = rr['custom_fields'] ? JSON.stringify(rr['custom_fields']) : ''
    out.available_actions = rr['available_actions'] ? JSON.stringify(rr['available_actions']) : ''

    return out
  })

  const worksheet = utils.json_to_sheet(normalized)
  const csv = utils.sheet_to_csv(worksheet)

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `assets-${ts}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
