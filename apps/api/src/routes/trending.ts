import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";

const router = Router();

function mainImage(images: { url: string; isMain: boolean }[] | undefined): string | null {
  if (!images?.length) return null;
  return (images.find((i) => i.isMain) ?? images[0]).url;
}

// GET /api/trending — resolved cards for the website (public)
router.get("/", async (_req, res) => {
  const items = await prisma.trending.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      room: { include: { images: { where: { isMain: true } }, types: { orderBy: { order: "asc" } } } },
      tour: { include: { images: { where: { isMain: true } } } },
      product: { include: { images: { where: { isMain: true } } } },
    },
  });

  const cards = items
    .map((t) => {
      if (t.targetType === "PRODUCT" && t.product?.isActive) {
        const p = t.product;
        return {
          id: t.id,
          kind: "PRODUCT" as const,
          title: p.nameTh,
          description: p.descriptionTh,
          imageUrl: mainImage(p.images),
          price: p.price,
          oldPrice: t.oldPrice ?? p.oldPrice ?? null,
          location: t.locationLabel ?? p.location ?? null,
          badge: t.badge ?? p.badge ?? null,
          unitLabel: p.unitLabel ?? null,
          deliveryNote: p.deliveryNote ?? null,
          ctaLabel: t.ctaLabel ?? "สั่งซื้อเลย",
          link: `/products/${p.slug}`,
        };
      }
      if (t.targetType === "ROOM" && t.room?.isActive) {
        const r = t.room;
        const price = r.types.length ? Math.min(...r.types.map((ty) => ty.pricePerNight)) : 0;
        return {
          id: t.id,
          kind: "ROOM" as const,
          title: r.nameTh,
          description: r.descriptionTh,
          imageUrl: mainImage(r.images),
          price,
          oldPrice: t.oldPrice ?? null,
          location: t.locationLabel ?? null,
          badge: t.badge ?? null,
          unitLabel: null,
          deliveryNote: null,
          ctaLabel: t.ctaLabel ?? "ดูห้องพัก",
          link: `/rooms/${r.slug}`,
        };
      }
      if (t.targetType === "TOUR" && t.tour?.isActive) {
        const tr = t.tour;
        return {
          id: t.id,
          kind: "TOUR" as const,
          title: tr.nameTh,
          description: tr.descriptionTh,
          imageUrl: mainImage(tr.images),
          price: tr.pricePerPerson,
          oldPrice: t.oldPrice ?? null,
          location: t.locationLabel ?? null,
          badge: t.badge ?? null,
          unitLabel: "/ท่าน",
          deliveryNote: null,
          ctaLabel: t.ctaLabel ?? "จองทัวร์",
          link: `/tours/${tr.slug}`,
        };
      }
      return null;
    })
    .filter(Boolean);

  res.json(cards);
});

// GET /api/trending/admin/list — all entries with source summary (admin)
router.get("/admin/list", requireOperator, async (_req, res) => {
  const items = await prisma.trending.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      room: { select: { id: true, slug: true, nameTh: true, isActive: true, images: { where: { isMain: true } } } },
      tour: { select: { id: true, slug: true, nameTh: true, isActive: true, images: { where: { isMain: true } } } },
      product: { select: { id: true, slug: true, nameTh: true, isActive: true, images: { where: { isMain: true } } } },
    },
  });
  res.json(items);
});

interface TrendingInput {
  targetType?: "ROOM" | "TOUR" | "PRODUCT";
  roomId?: string | null;
  tourId?: string | null;
  productId?: string | null;
  order?: number | string;
  isActive?: boolean;
  badge?: string | null;
  oldPrice?: number | string | null;
  locationLabel?: string | null;
  ctaLabel?: string | null;
}

function buildData(body: TrendingInput) {
  const data: Record<string, unknown> = {};
  if (body.order !== undefined) data.order = Number(body.order);
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  for (const k of ["badge", "locationLabel", "ctaLabel"] as const) {
    if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
  }
  if (body.oldPrice !== undefined) {
    data.oldPrice = body.oldPrice === "" || body.oldPrice === null ? null : Number(body.oldPrice);
  }
  return data;
}

// POST /api/trending (admin)
router.post("/", requireOperator, async (req, res) => {
  try {
    const body = req.body as TrendingInput;
    if (body.targetType !== "ROOM" && body.targetType !== "TOUR" && body.targetType !== "PRODUCT") {
      res.status(400).json({ error: "targetType ต้องเป็น ROOM, TOUR หรือ PRODUCT" });
      return;
    }
    const roomId = body.targetType === "ROOM" ? body.roomId : null;
    const tourId = body.targetType === "TOUR" ? body.tourId : null;
    const productId = body.targetType === "PRODUCT" ? body.productId : null;
    if (body.targetType === "ROOM" && !roomId) { res.status(400).json({ error: "กรุณาเลือกที่พัก" }); return; }
    if (body.targetType === "TOUR" && !tourId) { res.status(400).json({ error: "กรุณาเลือกทัวร์" }); return; }
    if (body.targetType === "PRODUCT" && !productId) { res.status(400).json({ error: "กรุณาเลือกสินค้า" }); return; }

    const item = await prisma.trending.create({
      data: { targetType: body.targetType, roomId: roomId ?? null, tourId: tourId ?? null, productId: productId ?? null, ...buildData(body) },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error("[trending/create]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "สร้างล้มเหลว" });
  }
});

// PATCH /api/trending/:id (admin)
router.patch("/:id", requireOperator, async (req, res) => {
  try {
    const item = await prisma.trending.update({ where: { id: String(req.params.id) }, data: buildData(req.body) });
    res.json(item);
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") { res.status(404).json({ error: "ไม่พบรายการ" }); return; }
    console.error("[trending/update]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "อัปเดตล้มเหลว" });
  }
});

// DELETE /api/trending/:id (admin)
router.delete("/:id", requireOperator, async (req, res) => {
  try {
    await prisma.trending.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") { res.status(404).json({ error: "ไม่พบรายการ" }); return; }
    console.error("[trending/delete]", err);
    res.status(500).json({ error: "ลบไม่สำเร็จ" });
  }
});

export default router;
