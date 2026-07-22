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
  "Winter Haven",
  "Winter Park",
  "Winter Springs",
  "Auburndale",
  "Bartow",
  "Lake Wales",
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
  {
    county: "Polk County",
    countyEs: "Condado de Polk",
    cities: ["Lakeland", "Winter Haven", "Haines City", "Davenport", "Auburndale", "Bartow", "Lake Wales"],
  },
] as const;

// Real reviews — order full-service / whole-move first so AEO/schema doesn't
// lead with labor-only as the brand identity. Text kept verbatim.
export const REVIEWS = [
  {
    body: "Great experience! The team was on time, professional, and handled everything with care. Very easy to work with and made my move stress-free, I highly recommend!",
    name: "Stael G.",
    meta: "Apartment move",
  },
  {
    body: "Very communicative about timing and friendly throughout. They even hauled some large furniture to the dumpster for me — huge help, didn't have to hire a different service. So far everything made it to the new place without damage. Highly recommend!",
    name: "Olivia H.",
    meta: "Full-service move",
  },
  {
    body: "Moved my mom from her apartment in Kissimmee to assisted living in Clermont. The crew was patient with her — she kept changing her mind about what was going and what was staying. Nobody complained. Took longer than expected but the hourly rate was upfront so no shock.",
    name: "Kony C.",
    meta: "Kissimmee → Clermont",
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
    body: "Used their labor-only option since I already had a U-Haul. Two guys loaded everything in under 2 hours and unloaded in 45 minutes at the new place. They Tetris'd that truck like it was their job (because it is, lol).",
    name: "Giuseppe F. V.",
    meta: "Labor only",
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
    textUs: string;
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
    privacy: string;
    dba: string;
    cookies: string;
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
      textUs: "Text us",
    },
    hero: {
      badge: "4.9★ on Google · Family-owned · Central Florida",
      h1Line1: "Central Florida movers.",
      h1Line2: "",
      h1Line3: "No hidden fees.",
      lede:
        "Our bilingual, family-owned crew serves Orlando and Central Florida with honest hourly pricing for apartment, home, and office moves.",
      ctaPrimary: "Get free quote",
      ctaSecondary: "Call now · (689) 600-2720",
      note: "Up-front hourly pricing · from a 2-hour minimum · Bilingual crew · Same-week dates",
    },
    trust: [
      "4.9★ on Google",
      "Family-owned · Central FL",
      "Background-checked crew",
      "Bilingual · Hablamos español",
      "Same-week scheduling",
      "No hidden fees · up-front pricing",
    ],
    services: {
      eyebrow: "What we do",
      head: "Full-service first.",
      headItalic: "Labor-only when you already have a truck.",
      sub: "We are a full-service Central Florida moving company — truck, crew, and materials. Labor-only loading help is available as a secondary option if you bring the truck.",
      tiers: [
        {
          tag: "Primary",
          title: "Full-service move",
          sub: "Truck + crew included — two movers and our 16′ or 26′ truck, materials, wrap, and careful placement. The main way we move families across Central Florida.",
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
          sub: "Three movers and our truck — larger homes or full-day full-service moves. Same up-front hourly pricing, more hands.",
          bullets: [
            "Three-mover crew",
            "16′ or 26′ truck included",
            "Furniture wrapping & protection",
            "Packing & unpacking add-on available",
          ],
          cta: "Get my quote",
        },
        {
          tag: "Secondary",
          title: "Labor-only help",
          sub: "You already have a U-Haul, POD, or rental — we bring the muscle only. Secondary option when you don’t need our truck.",
          bullets: [
            "Load or unload your U-Haul, PODS, rental truck",
            "Blankets, dollies, shrink wrap",
            "Furniture wrapping & protection",
            "Background-checked, bilingual crew",
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
        "Transparent hourly pricing — quote in 60 seconds. From a two-hour minimum. The clock stops when the job ends. No fuel surcharges, no stair fees, no weekend premiums.",
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
          q: "Is Toro Movers a full-service moving company?",
          a: "Yes. Toro Movers is a full-service moving company in Orlando and Central Florida. We bring the crew, truck, furniture protection, loading, transport, unloading, and placement. Labor-only help is available if you already have a truck or POD.",
        },
        {
          q: "Do you move evenings or weekends in Orlando?",
          a: "Yes — we run crews Monday through Saturday from 7:00 AM – 7:00 PM. Sunday moves are available on request when the schedule allows.",
        },
        {
          q: "Do you charge fuel, stair, or travel fees?",
          a: "No surprises. Hourly pricing from a two-hour minimum (three hours when a truck is included), quoted up-front in 60 seconds. No fuel surcharges, no stair fees, no travel fees inside Central Florida.",
        },
        {
          q: "How big a deposit do you take to lock in the date?",
          a: "A small refundable deposit holds your slot, applied to the final invoice. Balance is paid at the end of the move on the day, by card or transfer.",
        },
        {
          q: "How do you handle apartment & HOA move-in rules?",
          a: "Many Orlando complexes require a reserved elevator and a set arrival window. We coordinate those with your property manager or HOA and show up inside the window so move-in day isn't held up.",
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
      tagline: "Family-owned full-service movers across Central Florida.",
      serviceArea: "Service area",
      callNow: "Call now",
      legal: "Family-owned · Bilingual",
      privacy: "Privacy policy",
      dba: "Toro Movers is a DBA of Diler Dynamics Group LLC.",
      cookies:
        "We use cookies and similar technologies (including Meta) to measure ads and improve this site.",
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
      successTitle: "Quote request received",
      successBody:
        "A Toro Movers owner will call or text you today with your written quote. Need us now? Call (689) 600-2720.",
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
      textUs: "Escríbenos",
    },
    hero: {
      badge: "4.9★ en Google · Familiares · Florida Central",
      h1Line1: "Mudanceros de",
      h1Line2: "Florida Central.",
      h1Line3: "Sin tarifas ocultas.",
      lede:
        "Compañía de mudanzas familiar sirviendo a Orlando, Kissimmee, Lake Nona, Winter Garden, Clermont y 30+ ciudades de Florida Central. Carga, descarga, empaque y mudanzas completas con nuestro camión. Cotización en 60 segundos — sin tarifas ocultas.",
      ctaPrimary: "Cotización gratis",
      ctaSecondary: "Llamar · (689) 600-2720",
      note: "Precios claros por hora · desde un mínimo de 2 horas · Cuadrilla bilingüe · Fechas esta semana",
    },
    trust: [
      "4.9★ en Google",
      "Familia · Florida Central",
      "Cuadrilla verificada",
      "Bilingüe · Hablamos español",
      "Agenda en la misma semana",
      "Sin costos ocultos · precios claros",
    ],
    services: {
      eyebrow: "Lo que hacemos",
      head: "Servicio completo primero.",
      headItalic: "Solo carga si ya tienes camión.",
      sub: "Somos una compañía de mudanzas de servicio completo en Florida Central — camión, cuadrilla y materiales. La ayuda solo de carga es una opción secundaria si ya tienes el camión.",
      tiers: [
        {
          tag: "Principal",
          title: "Mudanza completa",
          sub: "Camión + cuadrilla incluidos — dos mudanceros y nuestro camión de 16′ o 26′, materiales y colocación cuidadosa. La forma principal en que movemos familias en Florida Central.",
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
          sub: "Tres mudanceros y nuestro camión — casas grandes o mudanzas de día completo de servicio completo. Misma tarifa por hora, más manos.",
          bullets: [
            "Cuadrilla de tres mudanceros",
            "Camión de 16′ o 26′ incluido",
            "Envoltura y protección de muebles",
            "Servicio adicional de empaque disponible",
          ],
          cta: "Mi cotización",
        },
        {
          tag: "Secundario",
          title: "Solo mano de obra",
          sub: "Ya tienes U-Haul, POD o alquiler — solo traemos la fuerza. Opción secundaria cuando no necesitas nuestro camión.",
          bullets: [
            "Cargamos o descargamos tu U-Haul, PODS, camión de alquiler",
            "Mantas, carretillas, envoltura plástica",
            "Envoltura y protección de muebles",
            "Cuadrilla verificada y bilingüe",
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
        "Tarifa por hora transparente — cotización en 60 segundos. Desde un mínimo de 2 horas. El reloj se detiene cuando termina el trabajo. Sin recargos por gasolina, sin tarifa por escaleras, sin recargos de fin de semana.",
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
          q: "¿Toro Movers es una compañía de mudanzas de servicio completo?",
          a: "Sí. Toro Movers es una compañía de mudanzas de servicio completo en Orlando y Florida Central. Llevamos cuadrilla, camión, protección de muebles, carga, transporte, descarga y colocación. También hay solo mano de obra si ya tienes camión o POD.",
        },
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
          q: "¿Cómo manejan las reglas de mudanza de apartamentos y HOA?",
          a: "Muchos complejos de Orlando requieren reservar el ascensor y una ventana de llegada. Coordinamos eso con tu administrador o HOA y llegamos dentro de la ventana para que la mudanza no se retrase.",
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
      tagline: "Mudanceros familiares de servicio completo en Florida Central.",
      serviceArea: "Área de servicio",
      callNow: "Llamar ahora",
      legal: "Familiares · Bilingües",
      privacy: "Política de privacidad",
      dba: "Toro Movers es un DBA de Diler Dynamics Group LLC.",
      cookies:
        "Usamos cookies y tecnologías similares (incluidas las de Meta) para medir anuncios y mejorar este sitio.",
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
      successTitle: "Solicitud de cotización recibida",
      successBody:
        "Un dueño de Toro Movers te llamará o te escribirá hoy con tu cotización por escrito. ¿Nos necesitas ahora? Llama al (689) 600-2720.",
      back: "Atrás",
      next: "Continuar",
      submit: "Enviar",
    },
  },
};
