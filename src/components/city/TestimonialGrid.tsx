import { GOOGLE_RATING } from "@/lib/contact";

export type Testimonial = {
  name: string;
  meta?: string;
  body: string;
  rating?: number;
};

export function TestimonialGrid({
  kicker = "Customer stories",
  title = "Honest reviews from real local moves",
  summary,
  reviews,
}: {
  kicker?: string;
  title?: string;
  summary?: string;
  reviews: Testimonial[];
}) {
  return (
    <>
      <p className="city-sec-kicker">{kicker}</p>
      <h2 className="city-sec-title">{title}</h2>
      <p className="city-sec-lead">
        {summary ??
          `${GOOGLE_RATING}★ average from Orlando & Central Florida customers who booked transparent hourly moves.`}
      </p>
      <div className="city-t-grid">
        {reviews.map((r) => (
          <article key={`${r.name}-${r.meta ?? ""}`} className="city-t-card">
            <div className="city-t-stars" aria-label={`${r.rating ?? 5} out of 5 stars`}>
              {"★".repeat(r.rating ?? 5)}
            </div>
            <p className="city-t-quote">&ldquo;{r.body}&rdquo;</p>
            <div className="city-t-name">{r.name}</div>
            {r.meta ? <div className="city-t-meta">{r.meta}</div> : null}
          </article>
        ))}
      </div>
    </>
  );
}
