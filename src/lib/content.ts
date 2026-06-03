// Toro Movers — bilingual content (English-first, Spanish mirrors).
// Real business content sourced from toromovers.net. NO invented details.

export type Lang = "en" | "es";

export const SERVICE_CITIES = [
  "Orlando",
  "Altamonte Springs",
  "Apopka",
  "Avalon Park",
  "Casselberry",
  "Celebration",
  "Clermont",
  "Davenport",
  "DeBary",
  "DeLand",
  "Deltona",
  "Dr. Phillips",
  "Groveland",
  "Haines City",
  "Hunters Creek",
  "Kissimmee",
  "Lake Mary",
  "Lake Nona",
  "Lakeland",
  "Leesburg",
  "Longwood",
  "Maitland",
  "Minneola",
  "Mount Dora",
  "Ocala",
  "Ocoee",
  "Oviedo",
  "Poinciana",
  "Sanford",
  "South Apopka",
  "St. Cloud",
  "Tavares",
  "The Villages",
  "Windermere",
  "Winter Garden",
  "Winter Park",
  "Winter Springs",
] as const;

export const AREAS_BY_COUNTY = [
  {
    county: "Orange County",
    countyEs: "Condado de Orange",
    cities: ["Orlando", "Apopka", "Winter Park", "Ocoee", "Winter Garden", "Maitland"],
  },
  {
    county: "Seminole County",
    countyEs: "Condado de Seminole",
    cities: ["Sanford", "Lake Mary", "Casselberry", "Altamonte Springs", "Oviedo", "Longwood"],
  },
  {
    county: "Osceola County",
    countyEs: "Condado de Osceola",
    cities: ["Kissimmee", "St. Cloud", "Celebration", "Poinciana"],
  },
  {
    county: "Lake County",
    countyEs: "Condado de Lake",
    cities: ["Clermont", "Mount Dora", "Leesburg", "Tavares", "Minneola"],
  },
] as const;

// Real reviews from toromovers.net — kept verbatim.
export const REVIEWS = [
  {
    body: "Used their labor-only option since I already had a U-Haul. Two guys loaded everything in under 2 hours and unloaded in 45 minutes at the new place. They Tetris'd that truck like it was their job (because it is, lol).",
    name: "Giuseppe F. V.",
    meta: "Labor only",
  },
  {
    body: "Moved my mom from her apartment in Kissimmee to assisted living in Clermont. The crew was patient with her — she kept changing her mind about what was going and what was staying. Nobody complained. Took longer than expected but the hourly rate was upfront so no shock.",
    name: "Kony C.",
    meta: "Kissimmee → Clermont",
  },
  {
    body: "Very communicative about timing and friendly throughout. They even hauled some large furniture to the dumpster for me — huge help, didn't have to hire a different service. So far everything made it to the new place without damage. Highly recommend!",
    name: "Olivia H.",
    meta: "Full-service move",
  },
  {
    body: "Obed and his team did a fantastic job on short notice — moved furniture from another house I'd purchased. Disassembled and reassembled everything quickly and efficiently!",
    name: "Hector L.",
    meta: "Short notice · disassembly",
  },
  {
    body: "Last-minute move was super stressful, we'd run out of steam. Called Toro and explained — without hesitation, they worked us in, packed and moved everything to storage within our time limit. The guys were extremely nice. Saved the day!",
    name: "Great Creek Canines",
    meta: "Same-week storage move",
  },
  {
    body: "Great experience! The team was on time, professional, and handled everything with care. Very easy to work with and made my move stress-free, I highly recommend!",
    name: "Stael G.",
    meta: "Apartment move",
  },
] as const;

type ContentShape = {
  nav: {
    services: string;
    process: string;
    areas: string;
    reviews: string;
    faq: string;
    callNow: string;
    quote: string;
  };
  hero: {
    badge: string;
    h1Line1: string;
    h1Line2: string;
    h1Line3: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  trust: readonly string[];
  services: {
    eyebrow: string;
    head: string;
    headItalic: string;
    sub: string;
    tiers: readonly {
      tag?: string;
      title: string;
      sub: string;
      bullets: readonly string[];
      cta: string;
    }[];
  };
  about: {
    eyebrow: string;
    head: string;
    headItalic: string;
    body: readonly string[];
    bullets: readonly string[];
  };
  process: {
    eyebrow: string;
    head: string;
    headItalic: string;
    steps: readonly { num: string; title: string; body: string }[];
  };
  areas: {
    eyebrow: string;
    head: string;
    headItalic: string;
    intro: string;
    fallback: string;
  };
  reviews: {
    eyebrow: string;
    head: string;
    headItalic: string;
    rating: string;
  };
  faq: {
    eyebrow: string;
    head: string;
    headItalic: string;
    items: readonly { q: string; a: string }[];
  };
  closing: {
    eyebrow: string;
    head: string;
    headItalic: string;
    sub: string;
    primary: string;
    secondary: string;
  };
  footer: {
    tagline: string;
    serviceArea: string;
    callNow: string;
    legal: string;
  };
  quote: {
    title: string;
    sub: string;
    stepLabels: readonly string[];
    helpQ: string;
    fromQ: string;
    toQ: string;
    fromPh: string;
    toPh: string;
    fromAddrLabel: string;
    toAddrLabel: string;
    residenceQ: string;
    floorQ: string;
    sizeQ: string;
    dateQ: string;
    specialQ: string;
    specialPh: string;
    contactQ: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    review: string;
    confirm: string;
    successTitle: string;
    successBody: string;
    back: string;
    next: string;
    submit: string;
  };
};

export const content: { en: ContentShape; es: ContentShape } = {
  // ═══════════════════════════ ENGLISH ═══════════════════════════
  en: {
    nav: {
      services: "Services",
      process: "How it works",
      areas: "Areas",
      reviews: "Reviews",
      faq: "FAQ",
      callNow: "Call now",
      quote: "Free quote",
    },
    hero: {
      badge: "4.9★ on Google · Insured, family-owned · Central Florida",
      h1Line1: "Central Florida",
      h1Line2: "movers.",
      h1Line3: "No hidden fees.",
      lede:
        "Family-owned moving company serving Orlando, Kissimmee, Lake Nona, Winter Garden, Clermont and 30+ Central Florida cities. Loading, unloading, packing, and full-service moves with our truck. Quote in 60 seconds — no hidden fees.",
      ctaPrimary: "Get free quote",
      ctaSecondary: "Call now · (689) 600-2720",
      note: "Up-front hourly pricing · 2-hour minimum · Bilingual crew · Same-week dates",
    },
    trust: [
      "4.9★ on Google",
      "Family-owned · Central FL",
      "Background-checked crew",
      "Bilingual · Hablamos español",
      "Same-week scheduling",
      "Insured · Cargo + liability",
    ],
    services: {
      eyebrow: "What we do",
      head: "Three ways we move you.",
      headItalic: "Up-front pricing on every one.",
      sub: "Hourly rates · 2-hour minimum · clock stops when the job ends · no fuel surcharges, no stair fees, no weekend premiums.",
      tiers: [
        {
          title: "Loading help",
          sub: "Two movers, two-hour minimum. You bring the truck — we bring the muscle.",
          bullets: [
            "Load or unload your U-Haul, PODS, rental truck",
            "Blankets, dollies, shrink wrap",
            "Furniture wrapping & protection",
            "Background-checked, bilingual crew",
          ],
          cta: "Get my quote",
        },
        {
          tag: "Most booked",
          title: "In-town move",
          sub: "Truck included. Two movers and our 16′ or 26′ truck for apartments, condos, and family homes inside Central Florida.",
          bullets: [
            "16′ or 26′ truck included",
            "Blankets, dollies, shrink wrap",
            "Furniture wrapping & protection",
            "Same crew that quotes shows up",
          ],
          cta: "Get my quote",
        },
        {
          title: "Big-day move",
          sub: "Three movers and our truck for larger homes or full-day moves. Same up-front hourly rate — just more hands and more hours.",
          bullets: [
            "Three-mover crew",
            "16′ or 26′ truck included",
            "Furniture wrapping & protection",
            "Packing & unpacking add-on available",
          ],
          cta: "Get my quote",
        },
      ],
    },
    about: {
      eyebrow: "About Toro Movers",
      head: "Family-owned.",
      headItalic: "Central Florida born.",
      body: [
        "Toro Movers is a family-owned moving company based in Orlando. Every booking is handled directly by the owners — no call centers, no franchise hand-offs.",
        "Transparent hourly pricing — quote in 60 seconds. Two-hour minimum. The clock stops when the job ends. No fuel surcharges, no stair fees, no weekend premiums.",
      ],
      bullets: [
        "Same crew that quotes shows up",
        "Background-checked crew",
        "Bilingual · Hablamos español",
        "Same-week scheduling",
      ],
    },
    process: {
      eyebrow: "How it works",
      head: "Quote in 60 seconds.",
      headItalic: "Same crew, same standard, every move.",
      steps: [
        {
          num: "01",
          title: "Tell us about your move",
          body: "60-second form: what kind of help, from where to where, size, date. We get back the same day with a written quote.",
        },
        {
          num: "02",
          title: "Lock the date",
          body: "Small refundable deposit holds your slot. Same crew that quotes will be on your doorstep — no contractor hand-offs.",
        },
        {
          num: "03",
          title: "We move you forward",
          body: "Wrap, load, drive, unload, place. The clock stops when the job ends. Balance paid on the day, by card or transfer.",
        },
      ],
    },
    areas: {
      eyebrow: "Where we help",
      head: "Crews across",
      headItalic: "Central Florida.",
      intro: "We serve Orange, Seminole, Osceola, and Lake counties — 35+ cities across the Orlando metro and Central Florida.",
      fallback: "Don't see your city? Send your ZIP — we likely cover it.",
    },
    reviews: {
      eyebrow: "What customers say",
      head: "Trusted by Central Florida",
      headItalic: "homeowners.",
      rating: "4.9★ on Google",
    },
    faq: {
      eyebrow: "Common questions",
      head: "Moving questions,",
      headItalic: "answered.",
      items: [
        {
          q: "Do you move evenings or weekends in Orlando?",
          a: "Yes — we run crews Monday through Saturday from 7:00 AM – 7:00 PM. Sunday moves are available on request when the schedule allows.",
        },
        {
          q: "Do you charge fuel, stair, or travel fees?",
          a: "No surprises. Hourly pricing with a two-hour minimum, quoted up-front in 60 seconds. No fuel surcharges, no stair fees, no travel fees inside Central Florida.",
        },
        {
          q: "How big a deposit do you take to lock in the date?",
          a: "A small refundable deposit holds your slot, applied to the final invoice. Balance is paid at the end of the move on the day, by card or transfer.",
        },
        {
          q: "Are you insured?",
          a: "Yes — Toro Movers carries general liability and cargo insurance. We can email a Certificate of Insurance to your building or HOA on request.",
        },
        {
          q: "What cities in Central Florida do you serve?",
          a: "We serve the full Orlando metro and Central Florida — including Kissimmee, Lake Nona, Oviedo, Lake Mary, Sanford, Clermont, Apopka, and 30+ surrounding cities.",
        },
        {
          q: "¿Hablan español?",
          a: "Sí — our entire crew is bilingual (English / Spanish). We can quote, schedule, and run your full move in Spanish if that is what you prefer.",
        },
      ],
    },
    closing: {
      eyebrow: "Ready when you are",
      head: "Quote in 60 seconds.",
      headItalic: "No hidden fees.",
      sub: "Same up-front hourly rate, same crew on the day, same family-owned business behind it.",
      primary: "Get free quote",
      secondary: "Call (689) 600-2720",
    },
    footer: {
      tagline: "Family-owned movers across Central Florida.",
      serviceArea: "Service area",
      callNow: "Call now",
      legal: "Toro Movers LLC · Insured · Bilingual",
    },
    quote: {
      title: "Free quote",
      sub: "60-second form. We respond the same day.",
      stepLabels: ["Help", "From", "To", "Date", "You"],
      helpQ: "What kind of help do you need?",
      fromQ: "Where are you moving from?",
      toQ: "Where are you moving to?",
      fromPh: "Street address, city, FL",
      toPh: "Street address, city, FL",
      fromAddrLabel: "Pickup address",
      toAddrLabel: "Drop-off address",
      residenceQ: "What type of place?",
      floorQ: "Which floor?",
      sizeQ: "How big is the move?",
      dateQ: "Preferred move date",
      specialQ: "Anything special we should know? (piano, art, narrow stairs, etc.)",
      specialPh: "Optional · helps us send a more accurate quote",
      contactQ: "Where do we send the quote?",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      review: "Review your request",
      confirm: "Send my quote request",
      successTitle: "Got it.",
      successBody: "We'll review your details and send a written quote the same day. For anything urgent, call (689) 600-2720.",
      back: "Back",
      next: "Continue",
      submit: "Send",
    },
  },

  // ═══════════════════════════ ESPAÑOL ═══════════════════════════
  es: {
    nav: {
      services: "Servicios",
      process: "Cómo funciona",
      areas: "Áreas",
      reviews: "Reseñas",
      faq: "Preguntas",
      callNow: "Llamar",
      quote: "Cotización gratis",
    },
    hero: {
      badge: "4.9★ en Google · Asegurados y familiares · Florida Central",
      h1Line1: "Mudanceros de",
      h1Line2: "Florida Central.",
      h1Line3: "Sin tarifas ocultas.",
      lede:
        "Compañía de mudanzas familiar sirviendo a Orlando, Kissimmee, Lake Nona, Winter Garden, Clermont y 30+ ciudades de Florida Central. Carga, descarga, empaque y mudanzas completas con nuestro camión. Cotización en 60 segundos — sin tarifas ocultas.",
      ctaPrimary: "Cotización gratis",
      ctaSecondary: "Llamar · (689) 600-2720",
      note: "Precios claros por hora · Mínimo 2 horas · Cuadrilla bilingüe · Fechas esta semana",
    },
    trust: [
      "4.9★ en Google",
      "Familia · Florida Central",
      "Cuadrilla verificada",
      "Bilingüe · Hablamos español",
      "Agenda en la misma semana",
      "Asegurados · Carga + responsabilidad",
    ],
    services: {
      eyebrow: "Lo que hacemos",
      head: "Tres formas en que te movemos.",
      headItalic: "Precios claros en cada una.",
      sub: "Tarifa por hora · Mínimo 2 horas · El reloj se detiene cuando termina el trabajo · Sin recargos por gasolina, sin tarifa por escaleras, sin recargos de fin de semana.",
      tiers: [
        {
          title: "Solo mano de obra",
          sub: "Dos mudanceros, mínimo 2 horas. Tú pones el camión — nosotros ponemos la fuerza.",
          bullets: [
            "Cargamos o descargamos tu U-Haul, PODS, camión de alquiler",
            "Mantas, carretillas, envoltura plástica",
            "Envoltura y protección de muebles",
            "Cuadrilla verificada y bilingüe",
          ],
          cta: "Mi cotización",
        },
        {
          tag: "Más reservado",
          title: "Mudanza local",
          sub: "Camión incluido. Dos mudanceros y nuestro camión de 16′ o 26′ para apartamentos, condos y casas familiares en Florida Central.",
          bullets: [
            "Camión de 16′ o 26′ incluido",
            "Mantas, carretillas, envoltura plástica",
            "Envoltura y protección de muebles",
            "La misma cuadrilla que cotiza llega a tu puerta",
          ],
          cta: "Mi cotización",
        },
        {
          title: "Mudanza grande",
          sub: "Tres mudanceros y nuestro camión para casas grandes o mudanzas de día completo. Misma tarifa por hora — solo más manos y más horas.",
          bullets: [
            "Cuadrilla de tres mudanceros",
            "Camión de 16′ o 26′ incluido",
            "Envoltura y protección de muebles",
            "Servicio adicional de empaque disponible",
          ],
          cta: "Mi cotización",
        },
      ],
    },
    about: {
      eyebrow: "Sobre Toro Movers",
      head: "Familia.",
      headItalic: "Nacidos en Florida Central.",
      body: [
        "Toro Movers es una compañía de mudanzas familiar con base en Orlando. Cada reserva la atienden directamente los dueños — sin centros de llamadas, sin traspasos de franquicia.",
        "Tarifa por hora transparente — cotización en 60 segundos. Mínimo 2 horas. El reloj se detiene cuando termina el trabajo. Sin recargos por gasolina, sin tarifa por escaleras, sin recargos de fin de semana.",
      ],
      bullets: [
        "La misma cuadrilla que cotiza llega a tu puerta",
        "Cuadrilla con verificación de antecedentes",
        "Bilingüe · Hablamos español",
        "Agenda en la misma semana",
      ],
    },
    process: {
      eyebrow: "Cómo funciona",
      head: "Cotización en 60 segundos.",
      headItalic: "Misma cuadrilla, mismo estándar, cada mudanza.",
      steps: [
        {
          num: "01",
          title: "Cuéntanos sobre tu mudanza",
          body: "Formulario de 60 segundos: qué tipo de ayuda necesitas, de dónde a dónde, tamaño, fecha. Respondemos el mismo día con una cotización por escrito.",
        },
        {
          num: "02",
          title: "Asegura la fecha",
          body: "Un pequeño depósito reembolsable reserva tu día. La misma cuadrilla que cotiza llega a tu puerta — sin traspasos de contratistas.",
        },
        {
          num: "03",
          title: "Te movemos hacia adelante",
          body: "Envolvemos, cargamos, conducimos, descargamos, colocamos. El reloj se detiene cuando termina el trabajo. Pago final el mismo día — tarjeta o transferencia.",
        },
      ],
    },
    areas: {
      eyebrow: "Dónde ayudamos",
      head: "Cuadrillas en toda",
      headItalic: "Florida Central.",
      intro: "Servimos los condados de Orange, Seminole, Osceola y Lake — 35+ ciudades del área metro de Orlando y Florida Central.",
      fallback: "¿No ves tu ciudad? Mándanos tu ZIP — probablemente la cubrimos.",
    },
    reviews: {
      eyebrow: "Lo que dicen los clientes",
      head: "La confianza de los",
      headItalic: "vecinos de Florida Central.",
      rating: "4.9★ en Google",
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      head: "Tus preguntas,",
      headItalic: "respondidas.",
      items: [
        {
          q: "¿Hacen mudanzas en la noche o en fin de semana en Orlando?",
          a: "Sí — trabajamos de lunes a sábado, de 7:00 AM a 7:00 PM. Mudanzas de domingo bajo solicitud cuando la agenda lo permite.",
        },
        {
          q: "¿Cobran tarifas por gasolina, escaleras o desplazamiento?",
          a: "Sin sorpresas. Tarifa por hora con mínimo de 2 horas, cotizada por adelantado en 60 segundos. Sin recargo por gasolina, sin tarifa por escaleras, sin tarifa por desplazamiento dentro de Florida Central.",
        },
        {
          q: "¿Qué tan grande es el depósito para apartar la fecha?",
          a: "Un pequeño depósito reembolsable reserva tu día y se aplica al pago final. El resto se paga el día de la mudanza por tarjeta o transferencia.",
        },
        {
          q: "¿Están asegurados?",
          a: "Sí — Toro Movers tiene seguro general de responsabilidad y de carga. Podemos enviar el Certificado de Seguro a tu edificio u HOA bajo solicitud.",
        },
        {
          q: "¿Qué ciudades de Florida Central cubren?",
          a: "Servimos toda el área metro de Orlando y Florida Central — incluyendo Kissimmee, Lake Nona, Oviedo, Lake Mary, Sanford, Clermont, Apopka, y 30+ ciudades alrededor.",
        },
        {
          q: "¿Hablan español?",
          a: "Sí — toda nuestra cuadrilla es bilingüe (inglés / español). Podemos cotizar, agendar y manejar tu mudanza completa en español si así lo prefieres.",
        },
      ],
    },
    closing: {
      eyebrow: "Cuando estés listo",
      head: "Cotización en 60 segundos.",
      headItalic: "Sin tarifas ocultas.",
      sub: "La misma tarifa por hora, la misma cuadrilla el día de la mudanza, el mismo negocio familiar detrás.",
      primary: "Cotización gratis",
      secondary: "Llamar (689) 600-2720",
    },
    footer: {
      tagline: "Mudanceros familiares en toda Florida Central.",
      serviceArea: "Área de servicio",
      callNow: "Llamar ahora",
      legal: "Toro Movers LLC · Asegurados · Bilingües",
    },
    quote: {
      title: "Cotización gratis",
      sub: "Formulario de 60 segundos. Respondemos el mismo día.",
      stepLabels: ["Ayuda", "Desde", "Hasta", "Fecha", "Tú"],
      helpQ: "¿Qué tipo de ayuda necesitas?",
      fromQ: "¿Desde dónde te mudas?",
      toQ: "¿A dónde te mudas?",
      fromPh: "Calle, ciudad, FL",
      toPh: "Calle, ciudad, FL",
      fromAddrLabel: "Dirección de origen",
      toAddrLabel: "Dirección de destino",
      residenceQ: "¿Qué tipo de lugar?",
      floorQ: "¿Qué piso?",
      sizeQ: "¿Qué tamaño tiene la mudanza?",
      dateQ: "Fecha preferida",
      specialQ: "¿Algo especial que debamos saber? (piano, arte, escaleras estrechas, etc.)",
      specialPh: "Opcional · nos ayuda a cotizar mejor",
      contactQ: "¿A dónde te enviamos la cotización?",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Email",
      phone: "Teléfono",
      review: "Revisa tu solicitud",
      confirm: "Enviar mi solicitud",
      successTitle: "Recibido.",
      successBody: "Revisaremos tus detalles y enviaremos una cotización por escrito el mismo día. Para algo urgente, llama al (689) 600-2720.",
      back: "Atrás",
      next: "Continuar",
      submit: "Enviar",
    },
  },
};
