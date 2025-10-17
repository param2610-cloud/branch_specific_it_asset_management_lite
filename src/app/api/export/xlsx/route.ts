import { verifyToken, secretKeyFetch } from '@/lib/token/token'
import { ApiDict } from '@/data/snipe_it_api/ApiDict'
import { NextRequest } from 'next/server'
import { utils, write } from 'xlsx'

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

  // Flatten rows: pick common nested keys and convert them to readable columns
  const normalized = data.map((row) => {
    const r = row as Record<string, unknown>
    const out: Record<string, unknown> = {}

    out.id = r['id'] ?? ''
    out.name = r['name'] ?? ''
    out.asset_tag = r['asset_tag'] ?? ''
    out.serial = r['serial'] ?? ''

    const model = r['model'] as Record<string, unknown> | undefined
    out.model_id = model?.['id'] ?? ''
    out.model_name = model?.['name'] ?? ''

    out.byod = r['byod'] ?? ''
    out.model_number = r['model_number'] ?? ''
    out.eol = r['eol'] ?? ''
    out.asset_eol_date = (r['asset_eol_date'] as Record<string, unknown>)?.['formatted'] ?? r['asset_eol_date'] ?? ''

    const status = r['status_label'] as Record<string, unknown> | undefined
    out.status_id = status?.['id'] ?? ''
    out.status_name = status?.['name'] ?? ''
    out.status_meta = status?.['status_meta'] ?? ''

    const category = r['category'] as Record<string, unknown> | undefined
    out.category_id = category?.['id'] ?? ''
    out.category_name = category?.['name'] ?? ''

    const manufacturer = r['manufacturer'] as Record<string, unknown> | undefined
    out.manufacturer_id = manufacturer?.['id'] ?? ''
    out.manufacturer_name = manufacturer?.['name'] ?? ''

    const supplier = r['supplier'] as Record<string, unknown> | undefined
    out.supplier_id = supplier?.['id'] ?? ''
    out.supplier_name = supplier?.['name'] ?? ''

    out.notes = r['notes'] ?? ''
    out.order_number = r['order_number'] ?? ''

    const company = r['company'] as Record<string, unknown> | undefined
    out.company_id = company?.['id'] ?? ''
    out.company_name = company?.['name'] ?? ''

    const location = r['location'] as Record<string, unknown> | undefined
    out.location_id = location?.['id'] ?? ''
    out.location_name = location?.['name'] ?? ''

    const rtd_location = r['rtd_location'] as Record<string, unknown> | undefined
    out.rtd_location_id = rtd_location?.['id'] ?? ''
    out.rtd_location_name = rtd_location?.['name'] ?? ''

    out.image = r['image'] ?? ''
    out.qr = r['qr'] ?? ''
    out.alt_barcode = r['alt_barcode'] ?? ''

    const assigned = r['assigned_to'] as Record<string, unknown> | undefined
    if (assigned) {
      out.assigned_to_id = assigned['id'] ?? ''
      out.assigned_to_name = assigned['name'] ?? ''
    } else {
      out.assigned_to_id = r['assigned_to'] ?? ''
      out.assigned_to_name = ''
    }

    out.warranty_months = r['warranty_months'] ?? ''
    out.warranty_expires = (r['warranty_expires'] as Record<string, unknown>)?.['formatted'] ?? r['warranty_expires'] ?? ''

    out.created_at = (r['created_at'] as Record<string, unknown>)?.['formatted'] ?? r['created_at'] ?? ''
    out.updated_at = (r['updated_at'] as Record<string, unknown>)?.['formatted'] ?? r['updated_at'] ?? ''
    out.last_audit_date = (r['last_audit_date'] as Record<string, unknown>)?.['formatted'] ?? r['last_audit_date'] ?? ''
    out.next_audit_date = (r['next_audit_date'] as Record<string, unknown>)?.['formatted'] ?? r['next_audit_date'] ?? ''
    out.deleted_at = r['deleted_at'] ?? ''

    out.purchase_date = (r['purchase_date'] as Record<string, unknown>)?.['formatted'] ?? r['purchase_date'] ?? ''
    out.age = r['age'] ?? ''
    out.last_checkout = r['last_checkout'] ?? ''
    out.expected_checkin = r['expected_checkin'] ?? ''
    out.purchase_cost = r['purchase_cost'] ?? ''

    out.checkin_counter = r['checkin_counter'] ?? ''
    out.checkout_counter = r['checkout_counter'] ?? ''
    out.requests_counter = r['requests_counter'] ?? ''

    out.user_can_checkout = r['user_can_checkout'] ?? ''
    out.book_value = r['book_value'] ?? ''
    out.custom_fields = r['custom_fields'] ? JSON.stringify(r['custom_fields']) : ''
    out.available_actions = r['available_actions'] ? JSON.stringify(r['available_actions']) : ''

    return out
  })

  const worksheet = utils.json_to_sheet(normalized)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Assets')

  const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `assets-${ts}.xlsx`

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
