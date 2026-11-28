import type ExcelJS from 'exceljs';
import {
  NormalizedProduct,
  NormalizedProductVariant,
  PaymentMethod,
  ProductCategory,
  StockAdjustmentType,
  StockLog,
  TransactionRecord,
} from '../types';

export interface InventoryExcelRow {
  product: NormalizedProduct;
  variant: NormalizedProductVariant;
}

interface ExcelColumnDef<Row> {
  header: string;
  key: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  numFmt?: string;
  sumFormula?: boolean;
  wrapText?: boolean;
  value: (row: Row) => string | number;
}

interface StyledSheetOptions<Row> {
  sheetName: string;
  reportTitle: string;
  storeName: string;
  rows: Row[];
  columns: ExcelColumnDef<Row>[];
  emptyNote?: string;
}

const CATEGORY_LABELS: Record<Exclude<ProductCategory, 'all'>, string> = {
  kurma: 'Kurma Premium',
  'kismis-kacang': 'Kacang & Kismis',
  'cokelat-gift': 'Cokelat & Suvenir',
  'zamzam-herbal': 'Air Zamzam & Herbal',
  paket: 'Paket Oleh-Oleh',
};

const MUTATION_LABELS: Record<StockAdjustmentType, string> = {
  penjualan: 'Penjualan POS',
  restock: 'Restock Masuk',
  rusak: 'Stok Rusak',
  retur: 'Retur Barang',
  koreksi: 'Koreksi Opname',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tunai / Cash',
  qris: 'QRIS',
  transfer: 'Transfer Bank',
  edc: 'Debit EDC',
};

async function loadExcelJs(): Promise<typeof ExcelJS> {
  const mod = (await import('exceljs')) as { default?: typeof ExcelJS } & typeof ExcelJS;
  if ('Workbook' in mod && mod.Workbook) {
    return mod;
  }
  if (mod.default && 'Workbook' in mod.default) {
    return mod.default;
  }
  const winExcel = (globalThis as { ExcelJS?: typeof ExcelJS }).ExcelJS;
  if (winExcel?.Workbook) {
    return winExcel;
  }
  throw new Error('Modul ExcelJS gagal dimuat.');
}

function getLocalDateSlug(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function columnIndexToLetter(colIndex: number): string {
  let num = colIndex;
  let letter = '';
  while (num > 0) {
    const rem = (num - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

function formatLineLength(val: string | number, numFmt?: string): number {
  if (typeof val === 'number') {
    const formatted = Math.abs(val).toLocaleString('id-ID');
    const prefixLen = numFmt?.includes('Rp') ? 3 : 1;
    return formatted.length + prefixLen;
  }
  const lines = String(val).split('\n');
  return Math.max(...lines.map((l) => l.length), 0);
}

/**
 * Populates an ExcelJS worksheet with consistent Alfaratha Store styling:
 * report banner, frozen dark sage header row, auto-filter, auto column widths,
 * formatted numeric columns, and optional SUM total footer row.
 */
function appendStyledTableSheet<Row>(
  workbook: ExcelJS.Workbook,
  options: StyledSheetOptions<Row>
): void {
  const { sheetName, reportTitle, storeName, rows, columns } = options;
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  const lastColIndex = columns.length;
  const lastColLetter = columnIndexToLetter(lastColIndex);
  const printedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Row 1: Report Title Banner
  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${storeName.toUpperCase()} — ${reportTitle.toUpperCase()}`;
  titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF18221E' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EFEA' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 26;

  // Row 2: Metadata Strip
  sheet.mergeCells(`A2:${lastColLetter}2`);
  const metaCell = sheet.getCell('A2');
  metaCell.value = `Dicetak: ${printedAt} WIB   •   Jumlah Data: ${rows.length} baris`;
  metaCell.font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FF52605A' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAF9' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(2).height = 20;

  // Row 3: Spacer
  sheet.getRow(3).height = 8;

  // Row 4: Styled Header Row
  const headerRow = sheet.getRow(4);
  headerRow.height = 24;
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18221E' } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col.align ?? 'left',
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF18221E' } },
      bottom: { style: 'medium', color: { argb: 'FF3A6B5C' } },
      left: { style: 'thin', color: { argb: 'FF26332E' } },
      right: { style: 'thin', color: { argb: 'FF26332E' } },
    };
  });

  const colMaxLengths = columns.map((c) => c.header.length + 2);

  // Data Rows (Row 5+)
  if (rows.length === 0) {
    const emptyRowIdx = 5;
    sheet.mergeCells(`A${emptyRowIdx}:${lastColLetter}${emptyRowIdx}`);
    const emptyCell = sheet.getCell(`A${emptyRowIdx}`);
    emptyCell.value = options.emptyNote || 'Tidak ada data untuk filter saat ini.';
    emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF52605A' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(emptyRowIdx).height = 26;
  } else {
    rows.forEach((item, rIdx) => {
      const excelRowNum = 5 + rIdx;
      const excelRow = sheet.getRow(excelRowNum);
      const isEven = rIdx % 2 === 1;
      let maxLinesInRow = 1;

      columns.forEach((col, cIdx) => {
        const val = col.value(item);
        const cell = excelRow.getCell(cIdx + 1);
        cell.value = val;
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF18221E' } };
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAF9' } };
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: col.align ?? (typeof val === 'number' ? 'right' : 'left'),
          wrapText: Boolean(col.wrapText),
        };
        if (col.numFmt && typeof val === 'number') {
          cell.numFmt = col.numFmt;
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDCE3DF' } },
          bottom: { style: 'thin', color: { argb: 'FFDCE3DF' } },
          left: { style: 'thin', color: { argb: 'FFDCE3DF' } },
          right: { style: 'thin', color: { argb: 'FFDCE3DF' } },
        };

        const len = formatLineLength(val, col.numFmt);
        if (len > colMaxLengths[cIdx]) {
          colMaxLengths[cIdx] = len;
        }
        if (typeof val === 'string' && col.wrapText) {
          const lines = Math.max(
            val.split('\n').length,
            Math.ceil(val.length / Math.max(24, col.maxWidth ?? 42))
          );
          if (lines > maxLinesInRow) maxLinesInRow = lines;
        }
      });

      excelRow.height = Math.max(20, Math.min(84, maxLinesInRow * 15 + 6));
    });

    // Optional SUM Summary Footer Row
    const hasSumColumn = columns.some((c) => c.sumFormula);
    if (hasSumColumn) {
      const firstDataRow = 5;
      const lastDataRow = 4 + rows.length;
      const totalRowNum = lastDataRow + 1;
      const totalRow = sheet.getRow(totalRowNum);
      totalRow.height = 23;

      columns.forEach((col, cIdx) => {
        const cell = totalRow.getCell(cIdx + 1);
        const colLetter = columnIndexToLetter(cIdx + 1);
        cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF18221E' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F3' } };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF3A6B5C' } },
          bottom: { style: 'medium', color: { argb: 'FF18221E' } },
          left: { style: 'thin', color: { argb: 'FFDCE3DF' } },
          right: { style: 'thin', color: { argb: 'FFDCE3DF' } },
        };

        if (cIdx === 0) {
          cell.value = 'TOTAL KESELURUHAN';
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (col.sumFormula) {
          cell.value = { formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})` };
          if (col.numFmt) cell.numFmt = col.numFmt;
          cell.alignment = { vertical: 'middle', horizontal: col.align ?? 'right' };
          colMaxLengths[cIdx] = Math.max(colMaxLengths[cIdx], 16);
        } else {
          cell.value = '';
        }
      });
    }

    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4 + rows.length, column: lastColIndex },
    };
  }

  // Apply Auto-Width
  columns.forEach((col, idx) => {
    const computed = Math.min(
      col.maxWidth ?? 46,
      Math.max(col.minWidth ?? 12, colMaxLengths[idx] + 4)
    );
    sheet.getColumn(idx + 1).width = computed;
  });
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportInventoryToExcel(
  rows: InventoryExcelRow[],
  storeName = 'Alfaratha Store'
): Promise<void> {
  const Excel = await loadExcelJs();
  const workbook = new Excel.Workbook();
  workbook.creator = storeName;
  workbook.created = new Date();

  appendStyledTableSheet<InventoryExcelRow>(workbook, {
    sheetName: 'Daftar Stok SKU',
    reportTitle: 'Laporan Stok & Inventori Produk',
    storeName,
    rows,
    columns: [
      { header: 'SKU', key: 'sku', minWidth: 14, value: (r) => r.variant.sku },
      { header: 'Nama Produk', key: 'name', minWidth: 24, maxWidth: 38, value: (r) => r.product.name },
      { header: 'Varian Kemasan', key: 'variant', minWidth: 18, maxWidth: 32, value: (r) => r.variant.label },
      { header: 'Kategori', key: 'category', minWidth: 18, value: (r) => CATEGORY_LABELS[r.product.category] },
      { header: 'Lokasi Simpan', key: 'location', minWidth: 16, value: (r) => r.variant.storageLocation },
      { header: 'Stok', key: 'stock', minWidth: 10, align: 'right', numFmt: '#,##0', sumFormula: true, value: (r) => r.variant.stock },
      { header: 'Min. Stok', key: 'minStock', minWidth: 11, align: 'right', numFmt: '#,##0', value: (r) => r.variant.minStock },
      { header: 'Harga Modal', key: 'costPrice', minWidth: 15, align: 'right', numFmt: '"Rp "#,##0', value: (r) => r.variant.costPrice },
      { header: 'Harga Jual', key: 'price', minWidth: 15, align: 'right', numFmt: '"Rp "#,##0', value: (r) => r.variant.price },
      {
        header: 'Potensi Nilai Jual',
        key: 'retailValue',
        minWidth: 18,
        align: 'right',
        numFmt: '"Rp "#,##0',
        sumFormula: true,
        value: (r) => r.variant.stock * r.variant.price,
      },
      { header: 'Expired Date', key: 'expiredDate', minWidth: 14, align: 'center', value: (r) => r.variant.expiredDate },
    ],
  });

  await downloadWorkbook(workbook, `alfaratha-inventori-stok-${getLocalDateSlug()}.xlsx`);
}

export async function exportMutationsToExcel(
  logs: StockLog[],
  storeName = 'Alfaratha Store'
): Promise<void> {
  const Excel = await loadExcelJs();
  const workbook = new Excel.Workbook();
  workbook.creator = storeName;
  workbook.created = new Date();

  appendStyledTableSheet<StockLog>(workbook, {
    sheetName: 'Riwayat Mutasi Stok',
    reportTitle: 'Laporan Audit Riwayat Mutasi Stok',
    storeName,
    rows: logs,
    columns: [
      {
        header: 'Waktu',
        key: 'timestamp',
        minWidth: 18,
        value: (l) =>
          new Date(l.timestamp).toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
      },
      { header: 'SKU', key: 'sku', minWidth: 14, value: (l) => l.sku },
      { header: 'Nama Produk', key: 'productName', minWidth: 24, maxWidth: 38, value: (l) => l.productName },
      { header: 'Varian', key: 'variantLabel', minWidth: 18, maxWidth: 30, value: (l) => l.variantLabel },
      { header: 'Jenis Mutasi', key: 'type', minWidth: 16, value: (l) => MUTATION_LABELS[l.type] },
      {
        header: 'Perubahan Unit',
        key: 'delta',
        minWidth: 14,
        align: 'right',
        numFmt: '+#,##0;-#,##0;0',
        value: (l) => l.delta,
      },
      { header: 'Stok Sebelum', key: 'stockBefore', minWidth: 13, align: 'right', numFmt: '#,##0', value: (l) => l.stockBefore },
      { header: 'Stok Sesudah', key: 'stockAfter', minWidth: 13, align: 'right', numFmt: '#,##0', value: (l) => l.stockAfter },
      {
        header: 'Keterangan / Referensi',
        key: 'reason',
        minWidth: 24,
        maxWidth: 44,
        wrapText: true,
        value: (l) => l.reason,
      },
      { header: 'Petugas', key: 'staffName', minWidth: 16, value: (l) => l.staffName },
    ],
  });

  await downloadWorkbook(workbook, `alfaratha-mutasi-stok-${getLocalDateSlug()}.xlsx`);
}

interface TransactionItemExcelRow {
  invoiceNumber: string;
  timestamp: string;
  cashierName: string;
  customerName: string;
  sku: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export async function exportTransactionsToExcel(
  transactions: TransactionRecord[],
  storeName = 'Alfaratha Store'
): Promise<void> {
  const Excel = await loadExcelJs();
  const workbook = new Excel.Workbook();
  workbook.creator = storeName;
  workbook.created = new Date();

  appendStyledTableSheet<TransactionRecord>(workbook, {
    sheetName: 'Rekap Transaksi',
    reportTitle: 'Laporan Rekapitulasi Transaksi Kasir POS',
    storeName,
    rows: transactions,
    columns: [
      { header: 'No. Invoice', key: 'invoiceNumber', minWidth: 17, value: (t) => t.invoiceNumber },
      {
        header: 'Waktu Transaksi',
        key: 'timestamp',
        minWidth: 20,
        value: (t) =>
          new Date(t.timestamp).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
      },
      { header: 'Kasir', key: 'cashierName', minWidth: 16, value: (t) => t.cashierName },
      { header: 'Pelanggan', key: 'customerName', minWidth: 18, maxWidth: 30, value: (t) => t.customerName },
      {
        header: 'Mode Harga',
        key: 'pricingMode',
        minWidth: 14,
        value: (t) => (t.pricingMode === 'jamaah' ? 'Paket Jamaah' : 'Eceran'),
      },
      {
        header: 'Daftar Item',
        key: 'items',
        minWidth: 28,
        maxWidth: 48,
        wrapText: true,
        value: (t) =>
          t.items.map((i) => `${i.productName} (${i.variantLabel}) x${i.quantity}`).join('\n'),
      },
      { header: 'Subtotal', key: 'subtotal', minWidth: 15, align: 'right', numFmt: '"Rp "#,##0', sumFormula: true, value: (t) => t.subtotal },
      { header: 'Diskon', key: 'discount', minWidth: 14, align: 'right', numFmt: '"Rp "#,##0', sumFormula: true, value: (t) => t.discount },
      { header: 'Total Bayar', key: 'total', minWidth: 16, align: 'right', numFmt: '"Rp "#,##0', sumFormula: true, value: (t) => t.total },
      { header: 'Metode Bayar', key: 'paymentMethod', minWidth: 15, value: (t) => PAYMENT_LABELS[t.paymentMethod] },
      { header: 'Tunai Diterima', key: 'cashReceived', minWidth: 16, align: 'right', numFmt: '"Rp "#,##0', value: (t) => t.cashReceived },
      { header: 'Kembalian', key: 'changeAmount', minWidth: 15, align: 'right', numFmt: '"Rp "#,##0', value: (t) => t.changeAmount },
    ],
  });

  const detailRows: TransactionItemExcelRow[] = transactions.flatMap((trx) =>
    trx.items.map((item) => ({
      invoiceNumber: trx.invoiceNumber,
      timestamp: trx.timestamp,
      cashierName: trx.cashierName,
      customerName: trx.customerName,
      sku: item.sku,
      productName: item.productName,
      variantLabel: item.variantLabel,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }))
  );

  appendStyledTableSheet<TransactionItemExcelRow>(workbook, {
    sheetName: 'Detail Item Terjual',
    reportTitle: 'Rincian Item Terjual Per Faktur POS',
    storeName,
    rows: detailRows,
    columns: [
      { header: 'No. Invoice', key: 'invoiceNumber', minWidth: 17, value: (r) => r.invoiceNumber },
      {
        header: 'Waktu',
        key: 'timestamp',
        minWidth: 18,
        value: (r) =>
          new Date(r.timestamp).toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
      },
      { header: 'SKU', key: 'sku', minWidth: 14, value: (r) => r.sku },
      { header: 'Nama Produk', key: 'productName', minWidth: 24, maxWidth: 38, value: (r) => r.productName },
      { header: 'Varian', key: 'variantLabel', minWidth: 18, maxWidth: 30, value: (r) => r.variantLabel },
      { header: 'Qty', key: 'quantity', minWidth: 9, align: 'right', numFmt: '#,##0', sumFormula: true, value: (r) => r.quantity },
      { header: 'Harga Satuan', key: 'unitPrice', minWidth: 15, align: 'right', numFmt: '"Rp "#,##0', value: (r) => r.unitPrice },
      { header: 'Total Baris', key: 'lineTotal', minWidth: 16, align: 'right', numFmt: '"Rp "#,##0', sumFormula: true, value: (r) => r.lineTotal },
      { header: 'Pelanggan', key: 'customerName', minWidth: 18, value: (r) => r.customerName },
      { header: 'Kasir', key: 'cashierName', minWidth: 15, value: (r) => r.cashierName },
    ],
  });

  await downloadWorkbook(workbook, `alfaratha-transaksi-penjualan-${getLocalDateSlug()}.xlsx`);
}
