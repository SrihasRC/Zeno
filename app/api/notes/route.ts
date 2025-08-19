import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log('Auth error or no user:', userError)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('Fetching notes for user:', user.id)

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.log('Database error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('Found notes:', notes?.length || 0)
  return NextResponse.json(notes)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log('Auth error in POST:', userError)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, category, mood, tags } = body

    console.log('Creating note for user:', user.id, 'with data:', { title, content, category, tags })

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        category: category || 'other',
        mood,
        tags: tags || [],
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.log('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Note created successfully:', note)
    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    console.log('POST request error:', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
