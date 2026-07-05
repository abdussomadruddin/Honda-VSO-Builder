const TEMPLATE_URL = "public/honda-vso-template.pdf";
let embeddedTemplateBytesCache = null;

const FIELD_IDS = [
  "bookingDate",
  "customerName",
  "nric",
  "mobilePhone",
  "homePhone",
  "officePhone",
  "address",
  "model",
  "salesType",
  "variant",
  "colour",
  "estimatedDelivery",
  "referenceDealer",
  "chassisNo",
  "engineNo",
  "sellingPrice",
  "discount",
  "numberPlate",
  "roadTax",
  "registrationFee",
  "ownershipFee",
  "accessories",
  "miscSales",
  "insurance",
  "ncd",
  "totalAmount",
  "bookingFeePaid",
  "totalOutstanding",
  "paymentRef",
  "salesAdvisorName",
  "salesAdvisorNric",
  "salesManagerName",
  "salesManagerNric",
  "clearCustomerSignature",
];

const PRICE_COMPONENT_FIELDS = [
  "sellingPrice",
  "discount",
  "numberPlate",
  "roadTax",
  "registrationFee",
  "ownershipFee",
  "accessories",
  "miscSales",
  "insurance",
];

const SAMPLE_DATA = {
  bookingDate: "2026-01-08",
  customerName: "AZIZAN BIN ISMAIL @ ARIFFIN",
  nric: "770510-02-6149",
  mobilePhone: "012-3456789",
  homePhone: "",
  officePhone: "",
  address: "LORONG ROS, SG TENGI KANAN\n145500 TANJONG KARANG, SELANGOR",
  model: "HONDA HR-V",
  salesType: "NON-PANEL HIRE PURCHASE",
  variant: "1.5L S- SPECIAL COLORS",
  colour: "METEOROID GRAY METALLIC",
  estimatedDelivery: "2026",
  referenceDealer: "",
  chassisNo: "",
  engineNo: "",
  sellingPrice: "115560",
  discount: "0",
  numberPlate: "50",
  roadTax: "120",
  registrationFee: "150",
  ownershipFee: "50",
  accessories: "2000",
  miscSales: "0",
  insurance: "4100",
  ncd: "0",
  totalAmount: "122000",
  bookingFeePaid: "0",
  totalOutstanding: "109300",
  paymentRef: "",
  salesAdvisorName: "MUIZZUDDIN NAZMI BIN BAKRI",
  salesAdvisorNric: "990217027833",
  salesManagerName: "NAVINDER KAUR A/P",
  salesManagerNric: "710501086970",
  clearCustomerSignature: false,
};

const EMPTY_DATA = {
  bookingDate: todayIso(),
  customerName: "",
  nric: "",
  mobilePhone: "",
  homePhone: "",
  officePhone: "",
  address: "",
  model: "",
  salesType: "NON-PANEL HIRE PURCHASE",
  variant: "",
  colour: "",
  estimatedDelivery: new Date().getFullYear().toString(),
  referenceDealer: "",
  chassisNo: "",
  engineNo: "",
  sellingPrice: "",
  discount: "",
  numberPlate: "50",
  roadTax: "",
  registrationFee: "150",
  ownershipFee: "50",
  accessories: "",
  miscSales: "",
  insurance: "",
  ncd: "0",
  totalAmount: "",
  bookingFeePaid: "0",
  totalOutstanding: "",
  paymentRef: "",
  salesAdvisorName: "MUIZZUDDIN NAZMI BIN BAKRI",
  salesAdvisorNric: "990217027833",
  salesManagerName: "NAVINDER KAUR A/P",
  salesManagerNric: "710501086970",
  clearCustomerSignature: false,
};

const pdfTextZones = [
  { x: 512, y: 727, w: 44, h: 11 },
  { x: 118, y: 697, w: 134, h: 12 },
  { x: 118, y: 681, w: 67, h: 12 },
  { x: 118, y: 666, w: 122, h: 11 },
  { x: 117, y: 654, w: 146, h: 11 },
  { x: 118, y: 593, w: 58, h: 12 },
  { x: 118, y: 580, w: 112, h: 12 },
  { x: 118, y: 569, w: 131, h: 12 },
  { x: 118, y: 556, w: 22, h: 12 },
  { x: 437, y: 593, w: 131, h: 12 },
  { x: 294, y: 518, w: 48, h: 12 },
  { x: 320, y: 506, w: 20, h: 12 },
  { x: 294, y: 493, w: 48, h: 12 },
  { x: 315, y: 481, w: 25, h: 12 },
  { x: 311, y: 469, w: 30, h: 12 },
  { x: 310, y: 457, w: 30, h: 12 },
  { x: 315, y: 445, w: 25, h: 12 },
  { x: 305, y: 433, w: 36, h: 12 },
  { x: 314, y: 421, w: 25, h: 12 },
  { x: 303, y: 409, w: 37, h: 12 },
  { x: 108, y: 397, w: 16, h: 12 },
  { x: 292, y: 384, w: 48, h: 12 },
  { x: 320, y: 371, w: 20, h: 12 },
  { x: 295, y: 360, w: 47, h: 12 },
  { x: 128, y: 288, w: 18, h: 11 },
  { x: 277, y: 153, w: 106, h: 10 },
  { x: 278, y: 137, w: 48, h: 10 },
  { x: 466, y: 153, w: 73, h: 10 },
  { x: 467, y: 137, w: 48, h: 10 },
];

const priceRows = {
  sellingPrice: { y: 523.8 },
  discount: { y: 511.1 },
  subtotal: { y: 498.3 },
  numberPlate: { y: 485.7 },
  roadTax: { y: 472.9 },
  registrationFee: { y: 460.2 },
  ownershipFee: { y: 447.5 },
  accessories: { y: 434.8 },
  miscSales: { y: 422.1 },
  insurance: { y: 409.4 },
  totalAmount: { y: 385.4 },
  bookingFeePaid: { y: 372.6 },
  totalOutstanding: { y: 359.9 },
};

const fillLineSegments = [
  { x1: 493.75, x2: 575.75, y: 727.5, kind: "rectDash" },
  { x1: 493.75, x2: 575.75, y: 698.0, kind: "rectDash" },
  { x1: 493.7, x2: 575.7, y: 686.5, kind: "rectDash" },
  { x1: 493.7, x2: 575.7, y: 674.5, kind: "rectDash" },
  { x1: 119.75, x2: 417.75, y: 666.5, kind: "rectDash" },
  { x1: 118.75, x2: 417.75, y: 653.1, kind: "rectDash" },
  { x1: 118.0, x2: 417.0, y: 640.9, kind: "rectDash" },
  { x1: 118.75, x2: 417.75, y: 623.7, kind: "rectDash" },
  { x1: 118.8, x2: 417.0, y: 699.8, kind: "vectorDash" },
  { x1: 118.8, x2: 417.0, y: 684.2, kind: "vectorDash" },
  { x1: 118.9, x2: 337.9, y: 595.4, kind: "vectorDash" },
  { x1: 437.6, x2: 570.45, y: 595.4, kind: "vectorDash" },
  { x1: 118.65, x2: 307.3, y: 583.4, kind: "vectorDash" },
  { x1: 118.65, x2: 337.9, y: 572.0, kind: "vectorDash" },
  { x1: 437.85, x2: 577.2, y: 582.2, kind: "vectorDash" },
  { x1: 437.85, x2: 577.2, y: 570.2, kind: "vectorDash" },
  { x1: 118.65, x2: 337.9, y: 558.8, kind: "vectorDash" },
  { x1: 440.6, x2: 580.2, y: 556.8, kind: "vectorDash" },
  { x1: 79.9, x2: 150.95, y: 400.4, kind: "vectorDash" },
  { x1: 217.65, x2: 339.95, y: 521.0, kind: "vectorDash" },
  { x1: 219.7, x2: 337.9, y: 509.0, kind: "vectorDash" },
  { x1: 217.9, x2: 339.7, y: 496.2, kind: "vectorDash" },
  { x1: 219.6, x2: 338.0, y: 484.65, kind: "vectorDash" },
  { x1: 218.5, x2: 339.0, y: 472.2, kind: "vectorDash" },
  { x1: 219.45, x2: 338.15, y: 460.2, kind: "vectorDash" },
  { x1: 219.6, x2: 338.0, y: 448.2, kind: "vectorDash" },
  { x1: 219.1, x2: 338.5, y: 436.2, kind: "vectorDash" },
  { x1: 222.7, x2: 336.8, y: 424.05, kind: "vectorDash" },
  { x1: 219.1, x2: 338.5, y: 412.05, kind: "vectorDash" },
  { x1: 218.0, x2: 337.8, y: 387.35, kind: "solid" },
  { x1: 218.0, x2: 337.8, y: 386.15, kind: "solid" },
  { x1: 219.7, x2: 337.9, y: 374.25, kind: "vectorDash" },
  { x1: 218.15, x2: 340.4, y: 363.0, kind: "solid" },
  { x1: 218.15, x2: 340.4, y: 361.8, kind: "solid" },
  { x1: 83.0, x2: 192.0, y: 287.5, kind: "rectDash" },
  { x1: 340.0, x2: 449.0, y: 287.5, kind: "rectDash" },
  { x1: 278.75, x2: 385.75, y: 154.0, kind: "rectDash" },
  { x1: 467.75, x2: 574.75, y: 154.0, kind: "rectDash" },
  { x1: 279.0, x2: 386.0, y: 138.0, kind: "rectDash" },
  { x1: 468.8, x2: 575.8, y: 138.2, kind: "rectDash" },
  { x1: 32.0, x2: 191.0, y: 173.9, kind: "rectDash", group: "customerSignature" },
];

let currentPdfUrl = "";

document.addEventListener("DOMContentLoaded", () => {
  fillForm(EMPTY_DATA);
  bindEvents();
  refreshDerivedViews();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function bindEvents() {
  const form = document.getElementById("vsoForm");
  form.addEventListener("input", refreshDerivedViews);
  form.addEventListener("change", refreshDerivedViews);

  document.getElementById("sampleBtn").addEventListener("click", () => {
    fillForm(SAMPLE_DATA);
    refreshDerivedViews();
    setStatus("Contoh dimuat", false);
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    fillForm(EMPTY_DATA);
    resetPdfPreview();
    refreshDerivedViews();
    setStatus("Borang kosong", false);
  });

  document.getElementById("generateBtn").addEventListener("click", generatePdf);
}

function fillForm(data) {
  FIELD_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    if (element.type === "checkbox") {
      element.checked = Boolean(data[id]);
      return;
    }

    element.value = data[id] ?? "";
  });
}

function getFormData() {
  const data = {};
  FIELD_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    data[id] = element.type === "checkbox" ? element.checked : element.value.trim();
  });
  return data;
}

function refreshDerivedViews() {
  const data = getFormData();
  const pricing = resolvePricing(data);
  document.getElementById("calculatedTotal").textContent = moneyLabel(pricing.total);
}

async function generatePdf() {
  const generateBtn = document.getElementById("generateBtn");
  const data = getFormData();

  generateBtn.disabled = true;
  setStatus("Sedang jana PDF...", false);

  try {
    const templateBytes = await getTemplateBytes();
    const pdfDoc = await PDFLib.PDFDocument.load(templateBytes);
    keepFirstPageOnly(pdfDoc);
    const page = pdfDoc.getPage(0);
    const regular = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const pricing = resolvePricing(data);

    cleanFirstPage(page, data);
    restoreFillLines(page, data);
    drawCustomer(page, regular, data);
    drawVehicle(page, regular, data);
    drawPricing(page, regular, bold, data, pricing);
    drawDealer(page, regular, data);

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    setPdfPreview(blob, data);
    setStatus("PDF siap", true);
  } catch (error) {
    console.error(error);
    setStatus("PDF gagal dijana", false);
    alert(error.message || "PDF gagal dijana. Semak template PDF atau cuba semula.");
  } finally {
    generateBtn.disabled = false;
  }
}

async function getTemplateBytes() {
  const input = document.getElementById("templateFile");
  if (input.files && input.files[0]) {
    return input.files[0].arrayBuffer();
  }

  if (window.location.protocol === "file:") {
    const embeddedBytes = getEmbeddedTemplateBytes();
    if (embeddedBytes) return embeddedBytes;
  }

  try {
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) {
      throw new Error("Template PDF tidak ditemui.");
    }
    return response.arrayBuffer();
  } catch (error) {
    const embeddedBytes = getEmbeddedTemplateBytes();
    if (embeddedBytes) return embeddedBytes;
    throw new Error("Template PDF tidak dapat dibaca. Buka melalui app server atau pilih fail template PDF.");
  }
}

function getEmbeddedTemplateBytes() {
  const base64 = window.HONDA_VSO_TEMPLATE_BASE64;
  if (!base64) return null;

  if (!embeddedTemplateBytesCache) {
    embeddedTemplateBytesCache = base64ToArrayBuffer(base64);
  }
  return embeddedTemplateBytesCache.slice(0);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function keepFirstPageOnly(pdfDoc) {
  for (let index = pdfDoc.getPageCount() - 1; index > 0; index -= 1) {
    pdfDoc.removePage(index);
  }
}

function cleanFirstPage(page, data) {
  pdfTextZones.forEach((zone) => cover(page, zone.x, zone.y, zone.w, zone.h));

  if (data.clearCustomerSignature) {
    cover(page, 38, 172, 152, 45);
  }
}

function restoreFillLines(page, data) {
  fillLineSegments.forEach((line) => {
    if (line.group === "customerSignature" && !data.clearCustomerSignature) return;
    coverFillLine(page, line);
    drawFillLine(page, line);
  });
}

function drawCustomer(page, font, data) {
  const name = upper(data.customerName);
  const nric = upper(data.nric);

  drawFit(page, formatDate(data.bookingDate), 513, 730, 62, { font, size: 9, align: "center" });
  drawFit(page, name, 119, 701, 296, { font, size: 10 });
  drawFit(page, nric, 119, 684.3, 165, { font, size: 10 });

  const addressLines = wrapText(upperMultiline(data.address), font, 8.6, 302, 4);
  addressLines.forEach((line, index) => {
    drawFit(page, line, 119, 668.5 - index * 13, 302, { font, size: 8.6 });
  });

  drawFit(page, upper(data.homePhone), 494, 700, 80, { font, size: 8.8 });
  drawFit(page, upper(data.officePhone), 494, 687, 80, { font, size: 8.8 });
  drawFit(page, upper(data.mobilePhone), 494, 674, 80, { font, size: 8.8 });

}

function drawVehicle(page, font, data) {
  drawFit(page, upper(data.model), 119, 598.6, 218, { font, size: 9.2 });
  drawFit(page, upper(data.variant), 119, 585.7, 218, { font, size: 9.2 });
  drawFit(page, upper(data.colour), 119, 573, 218, { font, size: 9.2 });
  drawFit(page, upper(data.estimatedDelivery), 119, 560.2, 218, { font, size: 9.2 });

  drawFit(page, upper(data.salesType), 438, 598.6, 134, { font, size: 8.9 });
  drawFit(page, upper(data.chassisNo), 438, 585.7, 134, { font, size: 8.9 });
  drawFit(page, upper(data.engineNo), 438, 573, 134, { font, size: 8.9 });
  drawFit(page, upper(data.referenceDealer), 438, 560.2, 134, { font, size: 8.9 });
}

function drawPricing(page, font, bold, data, pricing) {
  drawMoney(page, font, valueOrNull(data.sellingPrice), priceRows.sellingPrice.y);
  drawMoney(page, font, valueOrNull(data.discount), priceRows.discount.y);
  drawMoney(page, font, pricing.subtotal, priceRows.subtotal.y);
  drawMoney(page, font, valueOrNull(data.numberPlate), priceRows.numberPlate.y);
  drawMoney(page, font, valueOrNull(data.roadTax), priceRows.roadTax.y);
  drawMoney(page, font, valueOrNull(data.registrationFee), priceRows.registrationFee.y);
  drawMoney(page, font, valueOrNull(data.ownershipFee), priceRows.ownershipFee.y);
  drawMoney(page, font, valueOrNull(data.accessories), priceRows.accessories.y);
  drawMoney(page, font, valueOrNull(data.miscSales), priceRows.miscSales.y);
  drawMoney(page, font, valueOrNull(data.insurance), priceRows.insurance.y);

  const ncdText = data.ncd === "" ? "" : `${trimNumber(data.ncd)}%`;
  drawFit(page, ncdText, 84, 400.8, 66, { font, size: 9.2, align: "center" });

  drawMoney(page, bold, pricing.total, priceRows.totalAmount.y);
  drawMoney(page, bold, pricing.bookingFeePaid, priceRows.bookingFeePaid.y);
  drawMoney(page, bold, pricing.outstanding, priceRows.totalOutstanding.y);

  const bookingText = pricing.bookingFeePaid === null ? "0.00" : formatMoney(pricing.bookingFeePaid);
  drawFit(page, bookingText, 127, 293.8, 38, { font, size: 8.8, align: "right" });
  drawFit(page, upper(data.paymentRef), 341, 293.8, 104, { font, size: 8.8, align: "center" });
}

function drawDealer(page, font, data) {
  drawFit(page, upper(data.salesAdvisorName), 267, 154.4, 124, { font, size: 7.1, align: "center" });
  drawFit(page, upper(data.salesAdvisorNric), 267, 139.2, 124, { font, size: 7.1, align: "center" });
  drawFit(page, upper(data.salesManagerName), 453, 154.4, 126, { font, size: 7.1, align: "center" });
  drawFit(page, upper(data.salesManagerNric), 453, 139.2, 126, { font, size: 7.1, align: "center" });
}

function setPdfPreview(blob, data) {
  if (currentPdfUrl) {
    URL.revokeObjectURL(currentPdfUrl);
  }

  currentPdfUrl = URL.createObjectURL(blob);
  document.getElementById("pdfPreview").src = currentPdfUrl;
  document.getElementById("pdfEmpty").classList.add("hidden");

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.href = currentPdfUrl;
  downloadBtn.download = `${buildFileName(data)}.pdf`;
  downloadBtn.classList.remove("disabled");
  downloadBtn.removeAttribute("aria-disabled");
}

function resetPdfPreview() {
  if (currentPdfUrl) {
    URL.revokeObjectURL(currentPdfUrl);
    currentPdfUrl = "";
  }

  document.getElementById("pdfPreview").removeAttribute("src");
  document.getElementById("pdfEmpty").classList.remove("hidden");

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.removeAttribute("href");
  downloadBtn.removeAttribute("download");
  downloadBtn.classList.add("disabled");
  downloadBtn.setAttribute("aria-disabled", "true");
}

function setStatus(message, ready) {
  const status = document.getElementById("pdfStatus");
  status.textContent = message;
  status.style.color = ready ? "var(--green-dark)" : "var(--amber)";
  status.style.background = ready ? "var(--teal-soft)" : "#fff5df";
}

function resolvePricing(data) {
  const sellingPrice = valueOrNull(data.sellingPrice);
  const discount = valueOrNull(data.discount);
  const hasSubtotal = data.sellingPrice !== "" || data.discount !== "";
  const subtotal = hasSubtotal ? (sellingPrice ?? 0) - (discount ?? 0) : null;
  const hasPriceComponents = PRICE_COMPONENT_FIELDS.some((field) => data[field] !== "");
  const componentTotal = [
    subtotal,
    valueOrNull(data.numberPlate),
    valueOrNull(data.roadTax),
    valueOrNull(data.registrationFee),
    valueOrNull(data.ownershipFee),
    valueOrNull(data.accessories),
    valueOrNull(data.miscSales),
    valueOrNull(data.insurance),
  ].reduce((sum, value) => sum + (value ?? 0), 0);

  const total = valueOrNull(data.totalAmount) ?? (hasPriceComponents ? componentTotal : null);
  const bookingFeePaid = valueOrNull(data.bookingFeePaid) ?? 0;
  const outstanding = valueOrNull(data.totalOutstanding) ?? (total !== null ? total - bookingFeePaid : null);

  return {
    subtotal,
    total,
    bookingFeePaid,
    outstanding,
  };
}

function drawMoney(page, font, value, y) {
  if (value === null || !Number.isFinite(value)) return;
  drawFit(page, formatMoney(value), 219, y, 120, { font, size: 9.2, align: "right" });
}

function cover(page, x, y, width, height) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: PDFLib.rgb(1, 1, 1),
    opacity: 1,
  });
}

function coverFillLine(page, line) {
  const height = line.kind === "rectDash" ? 1.8 : 2.2;
  cover(page, line.x1 - 0.4, line.y - height / 2, line.x2 - line.x1 + 0.8, height);
}

function drawFillLine(page, line) {
  if (line.kind === "rectDash") {
    drawRectDashLine(page, line.x1, line.y, line.x2);
    return;
  }

  page.drawLine({
    start: { x: line.x1, y: line.y },
    end: { x: line.x2, y: line.y },
    thickness: 0.6,
    color: PDFLib.rgb(0, 0, 0),
    dashArray: line.kind === "vectorDash" ? [1.5, 1.5] : undefined,
    dashPhase: 0,
  });
}

function drawRectDashLine(page, x1, y, x2) {
  const dashWidth = 3;
  const gap = 1;
  for (let x = x1; x < x2; x += dashWidth + gap) {
    page.drawRectangle({
      x,
      y: y - 0.5,
      width: Math.min(dashWidth, x2 - x),
      height: 1,
      color: PDFLib.rgb(0, 0, 0),
    });
  }
}

function drawFit(page, text, x, y, maxWidth, options) {
  const value = text ? String(text) : "";
  if (!value) return;

  const font = options.font;
  const minSize = options.minSize ?? 5.8;
  let size = options.size ?? 9;
  let width = font.widthOfTextAtSize(value, size);

  while (width > maxWidth && size > minSize) {
    size -= 0.25;
    width = font.widthOfTextAtSize(value, size);
  }

  const align = options.align ?? "left";
  const textX = align === "right" ? x + maxWidth - width : align === "center" ? x + (maxWidth - width) / 2 : x;

  if (options.clear) {
    cover(page, textX - 1.2, y - 1.3, width + 2.4, size + 3.1);
  }

  page.drawText(value, {
    x: textX,
    y,
    size,
    font,
    color: PDFLib.rgb(0, 0, 0),
  });
}

function wrapText(value, font, size, maxWidth, maxLines) {
  const rawLines = String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lines = [];

  rawLines.forEach((rawLine) => {
    let current = "";
    rawLine.split(/\s+/).forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test;
        return;
      }

      if (current) lines.push(current);
      current = word;
    });
    if (current) lines.push(current);
  });

  return lines.slice(0, maxLines);
}

function formatDate(value) {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function upper(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function upperMultiline(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim().toUpperCase())
    .filter(Boolean)
    .join("\n");
}

function valueOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function formatMoney(value) {
  if (value === null || !Number.isFinite(value)) return "";
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyLabel(value) {
  const formatted = formatMoney(value);
  return formatted ? `RM ${formatted}` : "RM 0.00";
}

function trimNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/, "").replace(/\.$/, "");
}

function buildFileName(data) {
  const name = upper(data.customerName) || "CUSTOMER";
  const date = formatDate(data.bookingDate) || todayIso();
  return `VSO_HONDA_${name}_${date}`.replace(/[^A-Z0-9_-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}
