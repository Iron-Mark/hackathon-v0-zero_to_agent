import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildProductEventsCsv, getUserFromSessionToken, listProductEvents } from '@/lib/auth-store'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const csv = buildProductEventsCsv(await listProductEvents())
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hireproof-product-events-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
