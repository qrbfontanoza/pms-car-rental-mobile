import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Vehicle } from '../models/domain.models';
import { PriceBreakdownComponent, StatusBadgeComponent, VehicleCardComponent } from './ui.components';

describe('shared customer UI', () => {
  it('renders friendly booking status labels instead of backend enum values', async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', 'returned_early');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Returned early');
    expect(fixture.nativeElement.textContent).not.toContain('returned_early');
  });

  it('announces scarce and unavailable inventory in vehicle cards', async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(VehicleCardComponent);
    const vehicle: Vehicle = {
      id: 'test',
      name: 'Long production vehicle name',
      category: 'SUV',
      dailyRate: 4500,
      seats: 7,
      fuel: 'Diesel',
      transmission: 'Automatic',
      totalUnits: 1,
      availableUnits: 1,
      image: 'missing.jpg',
      gallery: [],
      description: '',
      featured: false,
      createdAt: new Date().toISOString(),
    };
    fixture.componentRef.setInput('vehicle', vehicle);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Only 1 left');

    fixture.componentRef.setInput('vehicle', { ...vehicle, availableUnits: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unavailable');
  });

  it('shows the authoritative payment state in the price breakdown', async () => {
    await TestBed.configureTestingModule({ imports: [PriceBreakdownComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PriceBreakdownComponent);
    fixture.componentRef.setInput('preview', {
      rentalDays: 2,
      dailyRate: 1000,
      subtotal: 2000,
      discount: 0,
      total: 2000,
    });
    fixture.componentRef.setInput('paymentStatus', 'paid');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Payment: Paid');
    expect(fixture.nativeElement.textContent).not.toContain('Payment: Pay at pickup');
  });
});
