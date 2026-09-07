import { Receipt } from '../../models/domain.models';
import { buildReceiptText, receiptFileName } from './api-receipt.service';

describe('receipt export', () => {
  const receipt = {
    booking: {
      id: '7',
      reference: 'PMS/2026 007',
      contactNumber: '09171234567',
      pickupDate: '2026-09-10',
      returnDate: '2026-09-12',
      status: 'confirmed',
      paymentStatus: 'paid',
      amountPaid: 3600,
      preview: { rentalDays: 2, dailyRate: 2000, subtotal: 4000, discount: 400, total: 3600 },
    },
    customer: { fullName: 'Maria Santos', email: 'maria@example.com' },
    vehicle: { name: 'Toyota Vios', category: 'Sedan', transmission: 'Automatic' },
    transactionReference: 'TX-007',
    issuedAt: '2026-09-12T08:00:00Z',
  } as Receipt;

  it('creates a safe receipt filename', () => {
    expect(receiptFileName(receipt)).toBe('PMS-Receipt-PMS-2026-007.png');
  });

  it('includes canonical booking and payment details', () => {
    const text = buildReceiptText(receipt);
    expect(text).toContain('PMS CAR RENTAL');
    expect(text).toContain('Toyota Vios');
    expect(text).toContain('TX-007');
    expect(text).toContain('Amount paid: ₱3,600.00');
    expect(text).toContain('Outstanding balance: ₱0.00');
  });
});
