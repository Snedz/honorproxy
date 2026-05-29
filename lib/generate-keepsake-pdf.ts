import jsPDF from 'jspdf'

interface KeepsakePdfData {
  deceasedName: string
  cemeteryName: string
  visitDate: string
  reflection: string
  tributeLeft?: string | null
  photoUrls: string[] // array of public URLs
  qrUrl?: string // optional QR code URL
  graveLocation?: string
}

export async function downloadKeepsakePdf(data: KeepsakePdfData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 50
  let y = 60

  // Header
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text('HONORPROXY', pageWidth / 2, y, { align: 'center' })
  y += 20

  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 30

  // Title
  doc.setFontSize(18)
  doc.setTextColor(28, 37, 47)
  doc.text('A Visit Made in Remembrance', pageWidth / 2, y, { align: 'center' })
  y += 35

  // For
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('FOR', margin, y)
  y += 16
  doc.setFontSize(16)
  doc.setTextColor(28, 37, 47)
  doc.text(data.deceasedName, margin, y)
  y += 28

  // Location & Date
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('AT', margin, y)
  y += 16
  doc.setFontSize(13)
  doc.setTextColor(42, 49, 56)
  doc.text(data.cemeteryName, margin, y)
  y += 20

  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('ON', margin, y)
  y += 16
  doc.setFontSize(13)
  doc.setTextColor(42, 49, 56)
  doc.text(data.visitDate, margin, y)
  y += 20

  if (data.graveLocation) {
    doc.setFontSize(11)
    doc.setTextColor(90)
    doc.text('GRAVE LOCATION', margin, y)
    y += 16
    doc.setFontSize(13)
    doc.setTextColor(42, 49, 56)
    doc.text(data.graveLocation, margin, y)
    y += 24
  }

  // Tribute
  if (data.tributeLeft) {
    doc.setFontSize(11)
    doc.setTextColor(90)
    doc.text('TRIBUTE LEFT', margin, y)
    y += 16
    doc.setFontSize(13)
    doc.setTextColor(42, 49, 56)
    doc.text(data.tributeLeft, margin, y)
    y += 24
  }

  // Reflection
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('WHAT THE VISITOR WROTE', margin, y)
  y += 18

  doc.setFontSize(12)
  doc.setTextColor(42, 49, 56)

  const splitReflection = doc.splitTextToSize(data.reflection, pageWidth - margin * 2)
  doc.text(splitReflection, margin, y)
  y += splitReflection.length * 16 + 20

  // Photos
  if (data.photoUrls && data.photoUrls.length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(90)
    doc.text('PHOTOS FROM THE VISIT', margin, y)
    y += 20

    const maxPhotos = Math.min(data.photoUrls.length, 4)
    const photoWidth = 200
    const photoHeight = 150
    const gap = 20
    let x = margin

    for (let i = 0; i < maxPhotos; i++) {
      try {
        const imgData = await loadImageAsBase64(data.photoUrls[i])
        if (imgData) {
          doc.addImage(imgData, 'JPEG', x, y, photoWidth, photoHeight)
        }
      } catch (e) {
        // skip broken image
      }

      x += photoWidth + gap
      if (x + photoWidth > pageWidth - margin) {
        x = margin
        y += photoHeight + gap
      }
    }

    y += photoHeight + 30
  }

  // QR Code at bottom
  if (data.qrUrl) {
    try {
      const qrData = await loadImageAsBase64(data.qrUrl)
      if (qrData) {
        const qrSize = 90
        const qrX = (pageWidth - qrSize) / 2
        doc.addImage(qrData, 'PNG', qrX, y, qrSize, qrSize)
        y += qrSize + 15

        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('SCAN TO VIEW THE FULL KEEPSAKE ONLINE', pageWidth / 2, y, { align: 'center' })
      }
    } catch (e) {
      // QR failed to load — skip
    }
  }

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('HonorProxy — A quiet act of remembrance', pageWidth / 2, 780, { align: 'center' })

  // Save
  const safeName = data.deceasedName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`honorproxy-keepsake-${safeName}.pdf`)
}

function loadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } else {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}
