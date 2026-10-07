export function ScreenHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5 space-y-1.5">
      <h2 className="font-heading text-xl leading-tight font-semibold sm:text-2xl">{title}</h2>
      {description ? (
        <p className="max-w-[58ch] text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
