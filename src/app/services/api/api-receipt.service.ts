import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.models';
import { Receipt } from '../../models/domain.models';
import { ReceiptService } from '../../models/service.interfaces';

@Injectable()
export class ApiReceiptService extends ReceiptService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  get(bookingId: string): Observable<Receipt> {
    return this.http
      .get<ApiEnvelope<Receipt>>(
        `${environment.apiBaseUrl}/bookings/${encodeURIComponent(bookingId)}/receipt`,
      )
      .pipe(map((response) => response.data));
  }
  share(receipt: Receipt): Observable<void> {
    return from(this.shareReceipt(receipt));
  }

  save(receipt: Receipt): Observable<string> {
    return from(this.saveReceipt(receipt));
  }

  private async shareReceipt(receipt: Receipt): Promise<void> {
    const fileName = receiptFileName(receipt);
    const image = await buildReceiptImage(receipt);
    const title = `PMS Car Rental receipt ${receipt.booking.reference}`;

    if (Capacitor.isNativePlatform()) {
      const file = await Filesystem.writeFile({
        path: `receipts/${fileName}`,
        data: await blobToBase64(image),
        directory: Directory.Cache,
        recursive: true,
      });
      await Share.share({ title, text: `Booking receipt ${receipt.booking.reference}`, url: file.uri });
      return;
    }

    if (!navigator.share) {
      throw new Error('Sharing is not supported by this browser. Save the receipt instead.');
    }
    const file = new File([image], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text: `Booking receipt ${receipt.booking.reference}`, files: [file] });
      return;
    }
    throw new Error('Image sharing is not supported by this browser. Save the receipt instead.');
  }

  private async saveReceipt(receipt: Receipt): Promise<string> {
    const fileName = receiptFileName(receipt);
    const image = await buildReceiptImage(receipt);

    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({
        path: `PMS-Car-Rental/${fileName}`,
        data: await blobToBase64(image),
        directory: Directory.Documents,
        recursive: true,
      });
      return `Saved to Documents/PMS-Car-Rental/${fileName}`;
    }

    const url = URL.createObjectURL(image);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return `Downloaded ${fileName}`;
  }
}

export function receiptFileName(receipt: Receipt): string {
  const reference = receipt.booking.reference.replace(/[^A-Za-z0-9_-]+/g, '-');
  return `PMS-Receipt-${reference || receipt.booking.id}.png`;
}

export async function buildReceiptImage(receipt: Receipt): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1720;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create the receipt image.');

  const navy = '#0f2a4d';
  const blue = '#2159c7';
  const paleBlue = '#e8f1ff';
  const ink = '#172033';
  const muted = '#64748b';
  const line = '#dbe4ef';
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  const date = (value: string): string =>
    new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date(value));
  const preview = receipt.booking.preview;
  const paid = receipt.amountPaid ?? receipt.booking.amountPaid ?? 0;
  const outstanding = receipt.outstandingBalance ?? Math.max(0, preview.total - paid);

  context.fillStyle = '#f1f5f9';
  context.fillRect(0, 0, canvas.width, canvas.height);
  fillRoundedRect(context, 54, 54, 972, 1612, 38, '#ffffff');

  fillRoundedRect(context, 94, 94, 82, 82, 41, navy);
  context.fillStyle = '#ffffff';
  context.font = '700 34px sans-serif';
  context.textAlign = 'center';
  context.fillText('P', 135, 149);
  context.textAlign = 'left';
  drawText(context, 'PMS Car Rental', 202, 137, 46, 700, ink);
  drawText(context, 'Cubao, Quezon City', 202, 178, 27, 400, muted);
  drawLine(context, 94, 224, 986, 224, navy, 4);

  drawText(context, 'BOOKING RECEIPT', 94, 294, 25, 700, blue);
  drawFittedText(context, receipt.booking.reference, 94, 360, 48, 800, ink, 600);
  const status = receipt.booking.status.replaceAll('_', ' ').toUpperCase();
  fillRoundedRect(context, 94, 391, 270, 54, 18, paleBlue);
  drawFittedText(context, status, 116, 429, 24, 700, navy, 226);

  drawText(context, 'CUSTOMER', 94, 520, 23, 700, blue);
  drawFittedText(context, receipt.customer.fullName, 94, 570, 34, 700, ink, 820);
  drawFittedText(context, receipt.customer.email, 94, 612, 26, 400, muted, 820);
  drawFittedText(
    context,
    receipt.booking.contactNumber || 'Contact not provided',
    94,
    651,
    26,
    400,
    muted,
    820,
  );

  drawText(context, 'RENTAL DETAILS', 94, 735, 23, 700, blue);
  drawFittedText(context, receipt.vehicle.name, 94, 787, 36, 700, ink, 820);
  drawFittedText(
    context,
    `${receipt.vehicle.category} · ${receipt.vehicle.transmission}`,
    94,
    828,
    26,
    400,
    muted,
    820,
  );
  drawReceiptRow(context, 'Pickup', date(receipt.booking.pickupDate), 890, ink, muted, line);
  drawReceiptRow(context, 'Return', date(receipt.booking.returnDate), 955, ink, muted, line);
  drawReceiptRow(context, 'Rental days', String(preview.rentalDays), 1020, ink, muted, line);

  drawText(context, 'PRICE SUMMARY', 94, 1120, 23, 700, blue);
  drawReceiptRow(context, 'Daily rate', money.format(preview.dailyRate), 1172, ink, muted, line);
  drawReceiptRow(context, 'Subtotal', money.format(preview.subtotal), 1237, ink, muted, line);
  drawReceiptRow(
    context,
    `Discount${preview.voucher?.code ? ` (${preview.voucher.code})` : ''}`,
    `−${money.format(preview.discount)}`,
    1302,
    ink,
    muted,
    line,
  );
  drawReceiptRow(context, 'Amount paid', money.format(paid), 1367, ink, muted, line);
  drawReceiptRow(context, 'Outstanding', money.format(outstanding), 1432, ink, muted, line);
  drawLine(context, 94, 1470, 986, 1470, navy, 3);
  drawText(context, 'TOTAL', 94, 1532, 30, 700, ink);
  drawRightText(context, money.format(preview.total), 986, 1532, 42, 800, navy);

  drawText(context, `Issued ${date(receipt.issuedAt)}`, 94, 1600, 23, 400, muted);
  drawRightText(context, 'Thank you for choosing PMS.', 986, 1600, 23, 600, muted);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the receipt image.'))),
      'image/png',
      1,
    );
  });
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function drawText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  weight: number,
  color: string,
): void {
  context.fillStyle = color;
  context.font = `${weight} ${size}px sans-serif`;
  context.textAlign = 'left';
  context.fillText(value, x, y);
}

function drawRightText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  weight: number,
  color: string,
): void {
  context.fillStyle = color;
  context.font = `${weight} ${size}px sans-serif`;
  context.textAlign = 'right';
  context.fillText(value, x, y);
  context.textAlign = 'left';
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  initialSize: number,
  weight: number,
  color: string,
  maxWidth: number,
): void {
  let size = initialSize;
  context.font = `${weight} ${size}px sans-serif`;
  while (size > 18 && context.measureText(value).width > maxWidth) {
    size -= 2;
    context.font = `${weight} ${size}px sans-serif`;
  }
  drawText(context, value, x, y, size, weight, color);
}

function drawReceiptRow(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  y: number,
  ink: string,
  muted: string,
  line: string,
): void {
  drawText(context, label, 94, y, 25, 400, muted);
  let size = 27;
  context.font = `700 ${size}px sans-serif`;
  while (size > 18 && context.measureText(value).width > 640) {
    size -= 2;
    context.font = `700 ${size}px sans-serif`;
  }
  context.textAlign = 'right';
  context.fillStyle = ink;
  context.font = `700 ${size}px sans-serif`;
  context.fillText(value, 986, y);
  context.textAlign = 'left';
  drawLine(context, 94, y + 27, 986, y + 27, line, 2);
}

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
): void {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not prepare the receipt image.'));
    reader.onload = () => resolve(String(reader.result).split(',', 2)[1] || '');
    reader.readAsDataURL(blob);
  });
}

export function buildReceiptText(receipt: Receipt): string {
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  const date = (value: string): string =>
    new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date(value));
  const preview = receipt.booking.preview;
  const paid = receipt.amountPaid ?? receipt.booking.amountPaid ?? 0;
  const outstanding = receipt.outstandingBalance ?? Math.max(0, preview.total - paid);

  return [
    'PMS CAR RENTAL',
    'BOOKING RECEIPT',
    '',
    `Booking reference: ${receipt.booking.reference}`,
    `Transaction reference: ${receipt.transactionReference || 'Not issued'}`,
    `Issued: ${date(receipt.issuedAt)}`,
    '',
    `Customer: ${receipt.customer.fullName}`,
    `Email: ${receipt.customer.email}`,
    `Contact: ${receipt.booking.contactNumber || 'Not provided'}`,
    '',
    `Vehicle: ${receipt.vehicle.name}`,
    `Category: ${receipt.vehicle.category}`,
    `Transmission: ${receipt.vehicle.transmission}`,
    `Pickup: ${date(receipt.booking.pickupDate)}`,
    `Return: ${date(receipt.booking.returnDate)}`,
    `Rental days: ${preview.rentalDays}`,
    '',
    `Daily rate: ${money.format(preview.dailyRate)}`,
    `Subtotal: ${money.format(preview.subtotal)}`,
    `Voucher: ${preview.voucher?.code || 'None'}`,
    `Discount: ${money.format(preview.discount)}`,
    `Total: ${money.format(preview.total)}`,
    `Amount paid: ${money.format(paid)}`,
    `Outstanding balance: ${money.format(outstanding)}`,
    `Booking status: ${receipt.booking.status.replaceAll('_', ' ')}`,
    `Payment status: ${(receipt.paymentStatus ?? receipt.booking.paymentStatus).replaceAll('_', ' ')}`,
    '',
    'Thank you for choosing PMS Car Rental.',
  ].join('\n');
}
