import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

await mkdir("tmp/pdfs", { recursive: true });

const templateBytes = await readFile("public/honda-vso-template.pdf");
const pdfLibCode = await readFile("public/pdf-lib.min.js", "utf8");
const templateDataCode = await readFile("public/template-data.js", "utf8");
const appCode = await readFile("src/app.js", "utf8");

function createClassList() {
  const values = new Set();
  return {
    add: (...items) => items.forEach((item) => values.add(item)),
    remove: (...items) => items.forEach((item) => values.delete(item)),
    contains: (item) => values.has(item),
    toString: () => Array.from(values).join(" "),
  };
}

function createElement(id) {
  return {
    id,
    type: id === "clearCustomerSignature" ? "checkbox" : id === "templateFile" ? "file" : "text",
    value: "",
    checked: false,
    files: id === "templateFile" ? [] : undefined,
    textContent: "",
    style: {},
    href: "",
    src: "",
    download: "",
    classList: createClassList(),
    addEventListener() {},
    removeAttribute(name) {
      delete this[name];
    },
    setAttribute(name, value) {
      this[name] = value;
    },
  };
}

function cloneArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function createContext({ protocol, fetchMode, useFileInput }) {
  const elements = new Map();
  const listeners = new Map();
  const context = {
    console,
    setTimeout,
    clearTimeout,
    Uint8Array,
    ArrayBuffer,
    Blob,
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    alert(message) {
      context.__lastAlert = message;
    },
    fetch: async () => {
      context.__fetchCount += 1;
      if (fetchMode === "success") {
        return {
          ok: true,
          arrayBuffer: async () => cloneArrayBuffer(templateBytes),
        };
      }
      throw new Error("simulated fetch failure");
    },
    URL: {
      createObjectURL(blob) {
        context.__lastBlob = blob;
        return `blob:stress-${context.__blobCount += 1}`;
      },
      revokeObjectURL() {},
    },
    window: {
      location: { protocol },
    },
    document: {
      addEventListener(event, callback) {
        listeners.set(event, callback);
      },
      getElementById(id) {
        if (!elements.has(id)) {
          elements.set(id, createElement(id));
        }
        return elements.get(id);
      },
    },
    __blobCount: 0,
    __fetchCount: 0,
    __lastAlert: "",
    __lastBlob: null,
  };

  vm.createContext(context);
  vm.runInContext(pdfLibCode, context);
  vm.runInContext(templateDataCode, context);
  vm.runInContext(appCode, context);
  listeners.get("DOMContentLoaded")();

  if (useFileInput) {
    context.document.getElementById("templateFile").files = [
      {
        arrayBuffer: async () => cloneArrayBuffer(templateBytes),
      },
    ];
  }

  return context;
}

async function runScenario(name, options, overrides) {
  const context = createContext(options);
  const baseData = vm.runInContext(options.base === "sample" ? "SAMPLE_DATA" : "EMPTY_DATA", context);
  context.__scenarioData = { ...baseData, ...overrides };

  const result = await vm.runInContext(
    `(async () => {
      fillForm(__scenarioData);
      refreshDerivedViews();
      await generatePdf();
      return {
        status: document.getElementById("pdfStatus").textContent,
        download: document.getElementById("downloadBtn").download,
        href: document.getElementById("downloadBtn").href,
        calculatedTotal: document.getElementById("calculatedTotal").textContent,
        alert: __lastAlert,
        fetchCount: __fetchCount
      };
    })()`,
    context,
  );

  assert.equal(result.status, "PDF siap", `${name}: status should be ready`);
  assert.equal(result.alert, "", `${name}: should not show alert`);
  assert.match(result.download, /^VSO_HONDA_.*\.pdf$/, `${name}: download filename should be set`);
  assert.match(result.href, /^blob:stress-/, `${name}: download href should be a blob URL`);
  assert.ok(context.__lastBlob, `${name}: PDF blob should be created`);

  const outputBytes = new Uint8Array(await context.__lastBlob.arrayBuffer());
  assert.equal(new TextDecoder().decode(outputBytes.slice(0, 4)), "%PDF", `${name}: output should be a PDF`);

  const outputDoc = await context.PDFLib.PDFDocument.load(outputBytes);
  assert.equal(outputDoc.getPageCount(), 1, `${name}: output should contain first page only`);

  const path = `tmp/pdfs/${name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}.pdf`;
  await writeFile(path, outputBytes);

  return {
    name,
    bytes: outputBytes.length,
    fetchCount: result.fetchCount,
    calculatedTotal: result.calculatedTotal,
    path,
  };
}

const results = [];

results.push(
  await runScenario(
    "sample via http fetch",
    { protocol: "http:", fetchMode: "success", base: "sample" },
    {},
  ),
);

results.push(
  await runScenario(
    "empty form via file fallback",
    { protocol: "file:", fetchMode: "fail", base: "empty" },
    {},
  ),
);

results.push(
  await runScenario(
    "long text and decimals via embedded fallback",
    { protocol: "http:", fetchMode: "fail", base: "empty" },
    {
      bookingDate: "2026-07-06",
      customerName: "NAMA CUSTOMER SANGAT PANJANG UNTUK STRESS TEST BIN ABDULLAH",
      nric: "991231-14-5678",
      mobilePhone: "+60 12 345 6789",
      homePhone: "03-12345678",
      officePhone: "03-87654321",
      address: "NO 1234, JALAN PANJANG SANGAT UNTUK TEST WRAP TEXT\nTAMAN CONTOH INDAH, 43000 KAJANG, SELANGOR",
      model: "HONDA CR-V",
      salesType: "PANEL HIRE PURCHASE",
      variant: "2.0L E:HEV RS WITH VERY LONG VARIANT NAME",
      colour: "PLATINUM WHITE PEARL",
      estimatedDelivery: "Q4 2026",
      referenceDealer: "REFERENCE DEALER NAME THAT IS LONG",
      chassisNo: "MRH123456789ABCDEFGHIJ",
      engineNo: "L15B1234567890",
      sellingPrice: "199999.99",
      discount: "12345.67",
      numberPlate: "310.5",
      roadTax: "379.9",
      registrationFee: "150",
      ownershipFee: "50",
      accessories: "8888.88",
      miscSales: "123.45",
      insurance: "9876.54",
      ncd: "12.50",
      totalAmount: "",
      bookingFeePaid: "500.25",
      totalOutstanding: "",
      paymentRef: "CHQ-REF-999999",
      clearCustomerSignature: true,
    },
  ),
);

results.push(
  await runScenario(
    "uploaded template and blank ncd",
    { protocol: "http:", fetchMode: "fail", base: "sample", useFileInput: true },
    {
      ncd: "",
      totalAmount: "88000",
      totalOutstanding: "86000",
      clearCustomerSignature: false,
    },
  ),
);

console.table(results);
