interface Asset {
    id: number;
    name: string;
    asset_tag: string;
    serial: string;
    model: {
        id: number;
        name: string;
    };
    byod: boolean;
    model_number: string | null;
    eol: string | null;
    asset_eol_date: string | null;
    status_label: {
        id: number;
        name: string;
        status_type: string;
        status_meta: string;
    };
    category: {
        id: number;
        name: string;
    };
    manufacturer: {
        id: number;
        name: string;
    };
    supplier: {
        id: number;
        name: string;
    } | null;
    notes: string;
    order_number: string | null;
    company: {
        id: number;
        name: string;
    };
    location: {
        id: number;
        name: string;
    };
    rtd_location: {
        id: number;
        name: string;
    };
    image: string | null;
    qr: string | null;
    alt_barcode: string;
    assigned_to: any | null;
    warranty_months: number | null;
    warranty_expires: string | null;
    created_at: {
        datetime: string;
        formatted: string;
    };
    updated_at: {
        datetime: string;
        formatted: string;
    };
    last_audit_date: string | null;
    next_audit_date: string | null;
    deleted_at: string | null;
    purchase_date: string | null;
    age: string;
    last_checkout: string | null;
    expected_checkin: string | null;
    purchase_cost: number | null;
    checkin_counter: number;
    checkout_counter: number;
    requests_counter: number;
    user_can_checkout: boolean;
    book_value: number | null;
    custom_fields: Record<string, any>;
    available_actions: {
        checkout: boolean;
        checkin: boolean;
        clone: boolean;
        restore: boolean;
        update: boolean;
        delete: boolean;
    };
}