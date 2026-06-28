import { NextResponse } from 'next/server'

/**
 * POST /api/seed
 * Seeds the database with demo data using the service role key.
 * Protected by a secret token — never call this in production without auth.
 *
 * Usage:
 *   curl -X POST /api/seed \
 *     -H "Authorization: Bearer $SEED_SECRET" \
 *     -H "Content-Type: application/json"
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SEED_SECRET || 'titan-seed-dev'

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const COMPANY_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

    // Upsert company
    await supabase.from('companies').upsert({
      id: COMPANY_ID,
      name: 'Titan Locksmith Demo',
      phone: '(555) 800-1234',
      email: 'ops@titanlocksmith.com',
      website: 'https://titanlocksmith.com',
      address: '4521 Commerce Dr, Houston, TX 77002',
      timezone: 'America/Chicago',
    })

    // Service types
    const serviceTypes = [
      { id: 'st-0001-0000-0000-0000-000000000001', name: 'House Lockout', default_price: 95 },
      { id: 'st-0002-0000-0000-0000-000000000001', name: 'Car Lockout', default_price: 75 },
      { id: 'st-0003-0000-0000-0000-000000000001', name: 'Rekey', default_price: 120 },
      { id: 'st-0004-0000-0000-0000-000000000001', name: 'Lock Replacement', default_price: 220 },
      { id: 'st-0005-0000-0000-0000-000000000001', name: 'Smart Lock Install', default_price: 375 },
      { id: 'st-0006-0000-0000-0000-000000000001', name: 'Safe Opening', default_price: 300 },
      { id: 'st-0007-0000-0000-0000-000000000001', name: 'Emergency Locksmith', default_price: 175 },
      { id: 'st-0008-0000-0000-0000-000000000001', name: 'Commercial Lock Repair', default_price: 295 },
      { id: 'st-0009-0000-0000-0000-000000000001', name: 'Key Duplication', default_price: 35 },
      { id: 'st-0010-0000-0000-0000-000000000001', name: 'Ignition Repair', default_price: 200 },
    ]
    await supabase.from('service_types').upsert(
      serviceTypes.map(s => ({ ...s, company_id: COMPANY_ID }))
    )

    // Technicians
    const technicians = [
      { id: 'tc-0001-0000-0000-0000-000000000001', name: 'Marcus Reed', phone: '(555) 201-0001', email: 'marcus@titanlocksmith.com' },
      { id: 'tc-0002-0000-0000-0000-000000000001', name: 'Elena Cruz', phone: '(555) 201-0002', email: 'elena@titanlocksmith.com' },
      { id: 'tc-0003-0000-0000-0000-000000000001', name: 'Andre Thompson', phone: '(555) 201-0003', email: 'andre@titanlocksmith.com' },
      { id: 'tc-0004-0000-0000-0000-000000000001', name: 'Victor Nguyen', phone: '(555) 201-0004', email: 'victor@titanlocksmith.com' },
    ]
    await supabase.from('technicians').upsert(
      technicians.map(t => ({ ...t, company_id: COMPANY_ID, active: true }))
    )

    // Customers
    const customers = [
      { id: 'cu-0001-0000-0000-0000-000000000001', name: 'Sarah Mitchell', phone: '(555) 300-1001', email: 'sarah.mitchell@email.com', address: '1204 Oak Lane, Houston, TX 77001' },
      { id: 'cu-0002-0000-0000-0000-000000000001', name: 'James Okafor', phone: '(555) 300-1002', email: 'james.okafor@email.com', address: '8820 Westheimer Rd, Houston, TX 77063' },
      { id: 'cu-0003-0000-0000-0000-000000000001', name: 'Priya Sharma', phone: '(555) 300-1003', email: 'priya.sharma@email.com', address: '3301 Kirby Dr, Houston, TX 77098' },
      { id: 'cu-0004-0000-0000-0000-000000000001', name: 'David Hernandez', phone: '(555) 300-1004', email: 'david.h@email.com', address: '5502 Main St, Houston, TX 77002' },
      { id: 'cu-0005-0000-0000-0000-000000000001', name: 'Lisa Nguyen', phone: '(555) 300-1005', email: 'lisa.nguyen@email.com', address: '714 Heights Blvd, Houston, TX 77007' },
      { id: 'cu-0006-0000-0000-0000-000000000001', name: 'Robert Chen', phone: '(555) 300-1006', email: 'r.chen@email.com', address: '2200 Montrose Blvd, Houston, TX 77006' },
      { id: 'cu-0007-0000-0000-0000-000000000001', name: 'Angela Williams', phone: '(555) 300-1007', email: 'angela.w@email.com', address: '9900 Bellaire Blvd, Bellaire, TX 77401' },
      { id: 'cu-0008-0000-0000-0000-000000000001', name: 'Kevin Patel', phone: '(555) 300-1008', email: 'kpatel@email.com', address: '330 W Alabama St, Houston, TX 77006' },
      { id: 'cu-0009-0000-0000-0000-000000000001', name: 'Monica Torres', phone: '(555) 300-1009', email: 'monica.t@email.com', address: '6400 Richmond Ave, Houston, TX 77057' },
      { id: 'cu-0010-0000-0000-0000-000000000001', name: 'Brian Jackson', phone: '(555) 300-1010', email: 'bjackson@email.com', address: '1100 Louisiana St, Houston, TX 77002' },
      { id: 'cu-0011-0000-0000-0000-000000000001', name: 'Rachel Kim', phone: '(555) 300-1011', email: 'rachel.kim@email.com', address: '4455 Shepherd Dr, Houston, TX 77019' },
      { id: 'cu-0012-0000-0000-0000-000000000001', name: 'Thomas Brown', phone: '(555) 300-1012', email: 'tbrown@email.com', address: '7801 Westpark Dr, Houston, TX 77063' },
      { id: 'cu-0013-0000-0000-0000-000000000001', name: 'Natasha Foster', phone: '(555) 300-1013', email: 'nfoster@email.com', address: '2910 Buffalo Speedway, Houston, TX 77098' },
      { id: 'cu-0014-0000-0000-0000-000000000001', name: 'Carlos Rivera', phone: '(555) 300-1014', email: 'c.rivera@email.com', address: '500 Crawford St, Houston, TX 77002' },
      { id: 'cu-0015-0000-0000-0000-000000000001', name: 'Jennifer Walsh', phone: '(555) 300-1015', email: 'j.walsh@email.com', address: '3800 Greenbriar Dr, Houston, TX 77098' },
    ]
    await supabase.from('customers').upsert(
      customers.map(c => ({ ...c, company_id: COMPANY_ID, tags: [] }))
    )

    // Expenses
    const expenseData = [
      { category: 'Payroll', amount: 12000, notes: 'Monthly technician payroll', recurring: true },
      { category: 'Vehicle', amount: 1800, notes: '4 trucks fuel + maintenance', recurring: true },
      { category: 'Insurance', amount: 850, notes: 'General liability + commercial auto', recurring: true },
      { category: 'Marketing', amount: 600, notes: 'Google Ads + Yelp', recurring: true },
      { category: 'Tools/Equipment', amount: 350, notes: 'Monthly supply restocking', recurring: true },
      { category: 'Misc', amount: 200, notes: 'Office + admin misc', recurring: false },
    ]
    // Delete existing, re-insert
    await supabase.from('expenses').delete().eq('company_id', COMPANY_ID)
    await supabase.from('expenses').insert(
      expenseData.map(e => ({ ...e, company_id: COMPANY_ID, date: new Date().toISOString().split('T')[0] }))
    )

    return NextResponse.json({ success: true, message: 'Demo data seeded successfully' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Seed failed', details: String(err) }, { status: 500 })
  }
}
