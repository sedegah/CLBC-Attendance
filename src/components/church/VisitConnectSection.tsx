import { MapPin, Phone, Mail, Navigation } from "lucide-react";

const CHURCH_ADDRESS = "Ashongman Estate, Accra, Ghana";
const PHONE_NUMBER = "+233 (0) 24 123 4567";
const PHONE_HREF = "tel:+233241234567";
const EMAIL = "info@changedlifebaptist.org";
const DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  "Changed Life Baptist Church, " + CHURCH_ADDRESS,
)}`;
const MAP_EMBED_HREF = `https://www.google.com/maps?q=${encodeURIComponent(
  "Changed Life Baptist Church, " + CHURCH_ADDRESS,
)}&z=14&output=embed`;

const serviceTimes = [
  { label: "Sunday First Service", time: "8:00 AM – 10:00 AM" },
  { label: "Sunday Second Service", time: "10:30 AM – 12:30 PM" },
  { label: "Wednesday Bible Study", time: "6:30 PM – 8:00 PM" },
];

export const VisitConnectSection = () => {
  return (
    <section id="visit" className="bg-white px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Intro & contact details */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C62828]">
              Visit and connect
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.08] text-[#0F3E6B] sm:text-5xl lg:text-[54px]">
              We&apos;d love to
              <br className="hidden sm:block" /> welcome you
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#4A5565] sm:text-base">
              Whether visiting for the first time or returning, our doors and hearts are open.
              Reach out to our pastoral team or join us this Sunday.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={PHONE_HREF}
                className="group flex items-center gap-4 rounded-xl border border-[#E6E9EE] bg-[#F4F7FB] px-4 py-3.5 transition-colors hover:border-[#C62828]/30 hover:bg-white"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#C62828] text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#0F3E6B]">
                    Call or WhatsApp our pastoral team
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600 sm:text-sm">
                    {PHONE_NUMBER}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="group flex items-center gap-4 rounded-xl border border-[#E6E9EE] bg-[#F4F7FB] px-4 py-3.5 transition-colors hover:border-[#1F6FB5]/30 hover:bg-white"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#1F6FB5] text-white">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#0F3E6B]">
                    Send us an email
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-600 sm:text-sm">
                    {EMAIL}
                  </span>
                </span>
              </a>
            </div>
          </div>

          {/* Service times card */}
          <div className="rounded-2xl bg-[#0F3E6B] p-6 text-white shadow-[0_18px_40px_rgba(15,62,107,0.18)] sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-white">Service times</h2>
            <div className="mt-3 h-px bg-white/80" />
            <dl className="mt-1">
              {serviceTimes.map((service, index) => (
                <div
                  key={service.label}
                  className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-4 ${
                    index < serviceTimes.length - 1 ? "border-b border-white/15" : ""
                  }`}
                >
                  <dt className="text-sm text-[#C9D9EC]">{service.label}</dt>
                  <dd className="text-sm font-semibold text-white sm:text-base">
                    {service.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Find us */}
        <div className="overflow-hidden rounded-2xl border border-[#DCE8F4] bg-[#EAF2F9]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#0F3E6B] text-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#0F3E6B]">Find us</h2>
              </div>

              <div className="mt-5">
                <p className="font-bold text-[#0F3E6B]">Changed Life Baptist Church Campus</p>
                <p className="mt-1 text-sm text-slate-600">{CHURCH_ADDRESS}</p>
              </div>

              <a
                href={DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#C62828] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B71C1C]"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
            </div>

            <div className="relative min-h-[260px] sm:min-h-[320px]">
              <iframe
                title="Map showing the location of Changed Life Baptist Church"
                src={MAP_EMBED_HREF}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
