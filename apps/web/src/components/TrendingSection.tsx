import { listTrending, type TrendingCard } from "@/lib/api";
import { TrendingSectionHeader } from "./TrendingSectionHeader";

const fmt = (n: number) => n.toLocaleString("en-US");

function CardImage({ card }: { card: TrendingCard }) {
  if (card.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
    );
  }
  const fallback =
    card.kind === "PRODUCT"
      ? { grad: "from-yellow-300 via-amber-400 to-orange-500", icon: "fa-seedling" }
      : card.kind === "TOUR"
      ? { grad: "from-cyan-400 via-teal-500 to-blue-700",       icon: "fa-water-ladder" }
      : { grad: "from-cyan-400 via-blue-500 to-blue-700",       icon: "fa-mountain-sun" };
  return (
    <div className={`w-full h-full bg-gradient-to-br ${fallback.grad} flex items-center justify-center`}>
      <i className={`fa-solid ${fallback.icon} text-white/40 text-6xl`}></i>
    </div>
  );
}

export default async function TrendingSection() {
  const cards = await listTrending();
  if (cards.length === 0) return null;

  return (
    <section id="promotions" className="py-10 md:py-16 bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <TrendingSectionHeader />
        </div>

        {/* Promo banner grid */}
        <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0">
          {cards.map((card) => {
            const isProduct = card.kind === "PRODUCT";
            return (
              <a
                key={card.id}
                href={card.link}
                className="min-w-[75vw] sm:min-w-[300px] md:min-w-0 snap-center block relative rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 active:scale-[0.98]"
              >
                {/* Image / gradient fill */}
                <div className="h-52 md:h-60 relative">
                  <CardImage card={card} />

                  {/* Gradient overlay for text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badge top-right */}
                  {card.badge && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
                      <i className="fa-solid fa-star text-yellow-300 mr-1"></i>{card.badge}
                    </div>
                  )}

                  {/* Content bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {(card.location || card.deliveryNote) && (
                      <div className="flex items-center gap-2 mb-2 text-[11px]">
                        {card.location && (
                          <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                            <i className="fa-solid fa-location-dot text-red-400 mr-1"></i>{card.location}
                          </span>
                        )}
                        {card.deliveryNote && (
                          <span className="text-green-300 font-medium">
                            <i className="fa-solid fa-truck-fast mr-1"></i>{card.deliveryNote}
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-2 group-hover:text-yellow-300 transition-colors">
                      {card.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {card.oldPrice && (
                          <span className="text-white/50 text-xs line-through block leading-none">
                            {fmt(card.oldPrice)}.-
                          </span>
                        )}
                        <span className="text-[#f59e0b] font-bold text-xl leading-none">
                          {fmt(card.price)}.-{" "}
                          {card.unitLabel && (
                            <span className="text-xs text-white/60 font-normal">{card.unitLabel}</span>
                          )}
                        </span>
                      </div>
                      <span
                        className={
                          isProduct
                            ? "bg-[#2563eb] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
                            : "bg-white text-[#2563eb] px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
                        }
                      >
                        {card.ctaLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
