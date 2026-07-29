/**
 * Real customer reviews from Toro Movers Google Business Profile
 * (same set featured on toromovers.com · linked via GOOGLE_MAPS_REVIEWS_URL).
 */
export type GoogleReview = {
  name: string;
  /** Single letter for avatar monogram */
  initial: string;
  /** Avatar background tone — monochrome greys */
  tone: "a" | "b" | "c" | "d" | "e" | "f";
  /** Relative time label as shown on GBP when captured */
  when: string;
  rating: 5;
  text: string;
  /** Short context tag (move type / route) */
  context?: string;
};

export const reviewsHeading = "5-star reviews from real Toro customers";

export const googleReviews: GoogleReview[] = [
  {
    name: "Stael G.",
    initial: "S",
    tone: "a",
    when: "Google review",
    rating: 5,
    context: "Apartment move",
    text: "Great experience! The team was on time, professional, and handled everything with care. Very easy to work with and made my move stress-free, I highly recommend!",
  },
  {
    name: "Olivia H.",
    initial: "O",
    tone: "b",
    when: "Google review",
    rating: 5,
    context: "Full-service move",
    text: "Very communicative about timing and friendly throughout. They even hauled some large furniture to the dumpster for me — huge help, didn't have to hire a different service. So far everything made it to the new place without damage. Highly recommend!",
  },
  {
    name: "Kony C.",
    initial: "K",
    tone: "c",
    when: "Google review",
    rating: 5,
    context: "Kissimmee → Clermont",
    text: "Moved my mom from her apartment in Kissimmee to assisted living in Clermont. The crew was patient with her — she kept changing her mind about what was going and what was staying. Nobody complained. Took longer than expected but the hourly rate was upfront so no shock.",
  },
  {
    name: "Hector L.",
    initial: "H",
    tone: "d",
    when: "Google review",
    rating: 5,
    context: "Short notice · disassembly",
    text: "Obed and his team did a fantastic job on short notice — moved furniture from another house I'd purchased. Disassembled and reassembled everything quickly and efficiently!",
  },
  {
    name: "Great Creek Canines",
    initial: "G",
    tone: "e",
    when: "Google review",
    rating: 5,
    context: "Same-week storage move",
    text: "Last-minute move was super stressful, we'd run out of steam. Called Toro and explained — without hesitation, they worked us in, packed and moved everything to storage within our time limit. The guys were extremely nice. Saved the day!",
  },
  {
    name: "Giuseppe F. V.",
    initial: "G",
    tone: "f",
    when: "Google review",
    rating: 5,
    context: "Labor only",
    text: "Used their labor-only option since I already had a U-Haul. Two guys loaded everything in under 2 hours and unloaded in 45 minutes at the new place. They Tetris'd that truck like it was their job (because it is, lol).",
  },
];
