import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const { password } = await request.json()

  const { data, error } = await supabase
    .from('courses_auth')
    .select('course_name')
    .eq('password', password)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, course: data.course_name })
  
  // Session cookie — tarayıcı kapanınca sıfırlanır
  response.cookies.set('auth_session', password, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // maxAge yok → tarayıcı kapanınca silinir
  })

  return response
}