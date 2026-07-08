import { ContentImage } from '@/components/shared/content-image'

export function TaskImageCarousel({ images }: { images: string[] }) {
  const safeImages = images.length ? images : ['/placeholder.svg?height=900&width=1400']
  const [featured, ...rest] = safeImages

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-muted">
        <ContentImage
          src={featured}
          alt="Post featured image"
          fill
          sizes="(max-width: 768px) 94vw, 900px"
          className="object-cover"
          intrinsicWidth={1400}
          intrinsicHeight={900}
        />
      </div>
      {rest.length ? (
        <div className="grid grid-cols-3 gap-3">
          {rest.slice(0, 3).map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
              <ContentImage
                src={image}
                alt={`Post image ${index + 2}`}
                fill
                sizes="180px"
                className="object-cover"
                intrinsicWidth={640}
                intrinsicHeight={480}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
