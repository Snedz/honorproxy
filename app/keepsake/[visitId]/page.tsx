import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import KeepsakeViewer from './KeepsakeViewer'

export async function generateMetadata({ params }: { params: Promise<{ visitId: string }> }): Promise<Metadata> {
  const { visitId } = await params

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data } = await supabase
      .from('visit_reports')
      .select(`
        visit_date,
        reflection_text,
        photo_urls,
        visits!inner (
          grave_requests (
            deceased_full_name,
            cemeteries (name)
          )
        )
      `)
      .eq('visit_id', visitId)
      .eq('is_public', true)
      .single()

    if (!data) {
      return {
        title: 'Keepsake • HonorProxy',
        description: 'A quiet act of remembrance.',
      }
    }

    const name = (data as any).visits?.grave_requests?.deceased_full_name || 'A loved one'
    const cemetery = (data as any).visits?.grave_requests?.cemeteries?.name || 'a national cemetery'

    let images: { url: string }[] = [{ url: '/og-keepsake.jpg' }]

    if (data.photo_urls && data.photo_urls.length > 0) {
      const { data: urlData } = supabase.storage
        .from('visit-photos')
        .getPublicUrl(data.photo_urls[0])

      if (urlData?.publicUrl) {
        images = [{ url: urlData.publicUrl }]
      }
    }

    const shortReflection = data.reflection_text.length > 110 
      ? data.reflection_text.substring(0, 110) + '…' 
      : data.reflection_text

    return {
      title: `A Visit for ${name} • HonorProxy`,
      description: `A respectful visit was made at ${cemetery}. "${shortReflection}"`,
      openGraph: {
        title: `A Visit for ${name}`,
        description: `A quiet act of remembrance at ${cemetery}.`,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: `A Visit for ${name}`,
        description: `A quiet act of remembrance at ${cemetery}.`,
      },
    }
  } catch (e) {
    return {
      title: 'Keepsake • HonorProxy',
      description: 'A quiet act of remembrance.',
    }
  }
}

export default function PublicKeepsakePage() {
  return <KeepsakeViewer />
}
