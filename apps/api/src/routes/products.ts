import { Router } from "express";
import multer from "multer";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";
import { uploadImageToStorage, deleteFromStorage, pathFromPublicUrl } from "../lib/upload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// GET /api/products/admin/list — all products (admin)
router.get("/admin/list", requireOperator, async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { images: { where: { isMain: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// GET /api/products — active products (public)
router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { where: { isMain: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// GET /api/products/:slug (public)
router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!product || !product.isActive) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(product);
});

const FIELDS = ["slug", "nameTh", "nameEn", "descriptionTh", "descriptionEn", "unitLabel", "location", "deliveryNote", "badge"] as const;

function buildData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of FIELDS) {
    if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
  }
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice === "" || body.oldPrice === null ? null : Number(body.oldPrice);
  return data;
}

// POST /api/products (admin)
router.post("/", requireOperator, async (req, res) => {
  try {
    const { nameTh, nameEn, slug, price } = req.body;
    if (!nameTh || !nameEn || !slug || !price) {
      res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ (ชื่อ + slug + ราคา)" });
      return;
    }
    const data = buildData(req.body);
    const product = await prisma.product.create({
      data: {
        slug: String(data.slug),
        nameTh: String(data.nameTh),
        nameEn: String(data.nameEn),
        descriptionTh: (data.descriptionTh as string) ?? "",
        descriptionEn: (data.descriptionEn as string) ?? "",
        price: data.price as number,
        oldPrice: (data.oldPrice as number | null) ?? null,
        unitLabel: (data.unitLabel as string | null) ?? null,
        location: (data.location as string | null) ?? null,
        deliveryNote: (data.deliveryNote as string | null) ?? null,
        badge: (data.badge as string | null) ?? null,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") { res.status(409).json({ error: "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" }); return; }
    console.error("[products/create]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "สร้างสินค้าล้มเหลว" });
  }
});

// PATCH /api/products/:id (admin)
router.patch("/:id", requireOperator, async (req, res) => {
  try {
    const id = String(req.params.id);
    if (typeof req.body.isActive === "boolean" && Object.keys(req.body).length === 1) {
      const product = await prisma.product.update({ where: { id }, data: { isActive: req.body.isActive } });
      res.json(product);
      return;
    }
    const data = buildData(req.body);
    if (typeof req.body.isActive === "boolean") data.isActive = req.body.isActive;
    const product = await prisma.product.update({ where: { id }, data });
    res.json(product);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") { res.status(409).json({ error: "Slug นี้ถูกใช้แล้ว" }); return; }
    if (code === "P2025") { res.status(404).json({ error: "ไม่พบสินค้า" }); return; }
    console.error("[products/update]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "อัปเดตล้มเหลว" });
  }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", requireOperator, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") { res.status(404).json({ error: "ไม่พบสินค้า" }); return; }
    console.error("[products/delete]", err);
    res.status(500).json({ error: "ลบไม่สำเร็จ" });
  }
});

// ─── Product Images (mirror rooms) ──────────────────────────────────────────

router.get("/:id/images", requireOperator, async (req, res) => {
  const images = await prisma.productImage.findMany({
    where: { productId: String(req.params.id) },
    orderBy: [{ isMain: "desc" }, { order: "asc" }],
  });
  res.json(images);
});

router.post("/:id/images", requireOperator, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "กรุณาแนบไฟล์รูป" }); return; }
    const productId = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { _count: { select: { images: true } } } });
    if (!product) { res.status(404).json({ error: "ไม่พบสินค้า" }); return; }
    if (product._count.images >= 10) { res.status(400).json({ error: "อัพโหลดได้สูงสุด 10 รูป" }); return; }

    const { url } = await uploadImageToStorage(req.file.buffer, `products/${productId}`);
    const isMain = product._count.images === 0;
    const image = await prisma.productImage.create({ data: { productId, url, isMain, order: product._count.images } });
    res.status(201).json(image);
  } catch (err) {
    console.error("[products/images]", err);
    const status = (err as { status?: number }).status ?? 500;
    res.status(status).json({ error: err instanceof Error ? err.message : "อัพโหลดล้มเหลว" });
  }
});

router.patch("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId: image.productId }, data: { isMain: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isMain: true } }),
  ]);
  res.json({ ok: true });
});

router.delete("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }
  const path = pathFromPublicUrl(image.url);
  if (path) await deleteFromStorage(path).catch(() => {});
  await prisma.productImage.delete({ where: { id: imageId } });
  res.json({ ok: true });
});

export default router;
