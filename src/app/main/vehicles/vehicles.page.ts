import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonBadge,
  IonCheckbox,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, optionsOutline, searchOutline } from 'ionicons/icons';
import { Vehicle, VehicleCategory, VehicleFilter } from '../../models/domain.models';
import { VehicleService } from '../../models/service.interfaces';
import { EmptyStateComponent, LoadingGridComponent, VehicleCardComponent } from '../../shared/ui.components';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButton,
    IonBadge,
    IonIcon,
    IonChip,
    IonItem,
    IonModal,
    IonCheckbox,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    VehicleCardComponent,
    EmptyStateComponent,
    LoadingGridComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>Vehicles</ion-title></ion-toolbar>
      <div class="catalog-toolbar">
        <ion-searchbar
          aria-label="Search vehicles"
          [placeholder]="searchPlaceholder()"
          [(ngModel)]="filter.keyword"
          (ionInput)="reload()"
          [debounce]="300"
        /><button type="button" class="filter-button" (click)="openFilters()">
          <ion-icon slot="start" name="options-outline" />Filters
          <ion-badge *ngIf="activeCount">{{ activeCount }}</ion-badge>
        </button>
      </div>
      <div class="chips" *ngIf="activeCount">
        <ion-chip *ngFor="let c of activeChips">{{ c }}</ion-chip
        ><ion-button fill="clear" size="small" (click)="clear()">Clear all</ion-button>
      </div></ion-header
    ><ion-content
      ><ion-refresher slot="fixed" (ionRefresh)="refresh($event)"><ion-refresher-content /></ion-refresher
      ><app-loading-grid *ngIf="loading()" />
      <p class="results-summary page-shell" *ngIf="!loading()" aria-live="polite">
        {{ total() }} {{ total() === 1 ? 'vehicle' : 'vehicles' }} found
      </p>
      <div class="vehicle-grid page-shell" *ngIf="!loading() && items().length">
        <app-vehicle-card *ngFor="let v of items(); trackBy: track" [vehicle]="v" />
      </div>
      <app-empty-state
        *ngIf="!loading() && !items().length"
        [icon]="loadError() ? 'alert-circle-outline' : 'car-sport-outline'"
        [title]="loadError() ? 'Couldn’t load vehicles' : 'No vehicles found'"
        [message]="loadError() || 'Try adjusting your filters or searching another name.'"
        ><ion-button *ngIf="loadError(); else clearFilters" fill="outline" (click)="reload()"
          >Try again</ion-button
        ><ng-template #clearFilters
          ><ion-button (click)="clear()">Clear filters</ion-button></ng-template
        ></app-empty-state
      ><ion-infinite-scroll [disabled]="page() >= totalPages()" (ionInfinite)="more($event)"
        ><ion-infinite-scroll-content loadingText="Loading more rides..."
      /></ion-infinite-scroll>
      <ion-modal
        class="filter-modal"
        [isOpen]="filterOpen"
        [initialBreakpoint]="1"
        [breakpoints]="[0, 1]"
        [handle]="true"
        (didDismiss)="closeFilters()"
      >
        <ng-template>
          <ion-header
            ><ion-toolbar
              ><ion-title>Filters & sort</ion-title
              ><ion-button slot="end" fill="clear" (click)="closeFilters()">Cancel</ion-button></ion-toolbar
            ></ion-header
          >
          <ion-content>
            <div class="filter-content ion-padding">
              <div class="filter-intro">
                <p>Refine the catalog. Changes apply when you tap Show vehicles.</p>
                <ion-button fill="clear" size="small" (click)="clearDraft()">Clear all</ion-button>
              </div>
              <h3>Category</h3>
              <ion-item *ngFor="let c of categories"
                ><ion-checkbox
                  [checked]="draftFilter.categories.includes(c)"
                  (ionChange)="toggleCategory(c, $event.detail.checked)"
                  >{{ c }}</ion-checkbox
                ></ion-item
              >
              <h3>Daily price</h3>
              <div class="two-col">
                <ion-input
                  label="Minimum"
                  labelPlacement="stacked"
                  type="number"
                  [(ngModel)]="draftFilter.minPrice"
                /><ion-input
                  label="Maximum"
                  labelPlacement="stacked"
                  type="number"
                  [(ngModel)]="draftFilter.maxPrice"
                />
              </div>
              <h3>Passenger capacity</h3>
              <ion-select label="Minimum seats" labelPlacement="stacked" [(ngModel)]="draftFilter.seats"
                ><ion-select-option [value]="undefined">Any</ion-select-option
                ><ion-select-option *ngFor="let n of [2, 4, 7, 9]" [value]="n"
                  >{{ n }}+</ion-select-option
                ></ion-select
              >
              <h3>Fuel</h3>
              <ion-select label="Fuel type" labelPlacement="stacked" [(ngModel)]="draftFilter.fuel"
                ><ion-select-option value="">Any</ion-select-option
                ><ion-select-option *ngFor="let f of ['Gasoline', 'Diesel', 'Hybrid']" [value]="f">{{
                  f
                }}</ion-select-option></ion-select
              >
              <h3>Transmission</h3>
              <ion-select label="Transmission" labelPlacement="stacked" [(ngModel)]="draftFilter.transmission"
                ><ion-select-option value="">Any</ion-select-option
                ><ion-select-option value="Automatic">Automatic</ion-select-option
                ><ion-select-option value="Manual">Manual</ion-select-option></ion-select
              >
              <h3>Availability</h3>
              <ion-item
                ><ion-toggle [(ngModel)]="draftFilter.availableOnly"
                  >Available vehicles only</ion-toggle
                ></ion-item
              >
              <h3>Sort order</h3>
              <ion-select label="Sort by" labelPlacement="stacked" [(ngModel)]="draftFilter.sort"
                ><ion-select-option value="name_asc">Name A–Z</ion-select-option
                ><ion-select-option value="name_desc">Name Z–A</ion-select-option
                ><ion-select-option value="price_asc">Price low to high</ion-select-option
                ><ion-select-option value="price_desc">Price high to low</ion-select-option
                ><ion-select-option value="newest">Newest</ion-select-option></ion-select
              >
              <div class="filter-submit">
                <ion-button expand="block" size="large" (click)="apply()">Show vehicles</ion-button>
              </div>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal></ion-content
    >`,
})
export class VehiclesPage implements OnInit {
  readonly categories: VehicleCategory[] = ['Sedan', 'SUV', 'Van', 'Minivan', 'Scooter', 'Pickup'];
  readonly items = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loadError = signal('');
  readonly searchPlaceholder = signal(this.placeholderForWidth(window.innerWidth));
  filterOpen = false;
  filter: VehicleFilter = { keyword: '', categories: [], availableOnly: false, sort: 'newest' };
  draftFilter: VehicleFilter = this.copyFilter(this.filter);
  constructor(
    private readonly service: VehicleService,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({ filterOutline, optionsOutline, searchOutline });
  }
  ngOnInit(): void {
    const category = this.route.snapshot.queryParamMap.get('category') as VehicleCategory | null;
    if (category) this.filter.categories = [category];
    this.filter.pickupDate = this.route.snapshot.queryParamMap.get('pickupDate') || undefined;
    this.filter.returnDate = this.route.snapshot.queryParamMap.get('returnDate') || undefined;
  }
  ionViewWillEnter(): void {
    this.reload();
  }
  @HostListener('window:resize')
  onWindowResize(): void {
    this.searchPlaceholder.set(this.placeholderForWidth(window.innerWidth));
  }
  get activeCount(): number {
    return (
      Number(!!this.filter.keyword) +
      this.filter.categories.length +
      Number(!!this.filter.pickupDate && !!this.filter.returnDate) +
      Number(!!this.filter.minPrice) +
      Number(!!this.filter.maxPrice) +
      Number(!!this.filter.seats) +
      Number(!!this.filter.fuel) +
      Number(!!this.filter.transmission) +
      Number(this.filter.availableOnly)
    );
  }
  get activeChips(): string[] {
    return [
      this.filter.keyword,
      ...this.filter.categories,
      this.filter.pickupDate && this.filter.returnDate
        ? `${this.filter.pickupDate} – ${this.filter.returnDate}`
        : '',
      this.filter.availableOnly ? 'Available only' : '',
      this.filter.fuel || '',
      this.filter.transmission || '',
    ].filter(Boolean);
  }
  reload(event?: CustomEvent): void {
    this.loading.set(true);
    this.loadError.set('');
    this.page.set(1);
    this.service.list(this.filter, 1).subscribe({
      next: (r) => {
        this.items.set(r.data);
        this.totalPages.set(r.meta.totalPages);
        this.total.set(r.meta.total);
        this.loading.set(false);
        this.completeRefresher(event);
      },
      error: () => {
        this.items.set([]);
        this.total.set(0);
        this.loadError.set('Check your connection and try again.');
        this.loading.set(false);
        this.completeRefresher(event);
      },
    });
  }
  more(event: CustomEvent): void {
    const next = this.page() + 1;
    this.service.list(this.filter, next).subscribe((r) => {
      this.items.update((v) => [...v, ...r.data]);
      this.page.set(next);
      void (event.target as HTMLIonInfiniteScrollElement).complete();
    });
  }
  refresh(event: CustomEvent): void {
    this.reload(event);
  }
  clear(): void {
    this.filter = { keyword: '', categories: [], availableOnly: false, sort: 'newest' };
    this.draftFilter = this.copyFilter(this.filter);
    this.reload();
  }
  toggleCategory(c: VehicleCategory, on: boolean): void {
    this.draftFilter.categories = on
      ? [...this.draftFilter.categories, c]
      : this.draftFilter.categories.filter((x) => x !== c);
  }
  apply(): void {
    this.filter = this.copyFilter(this.draftFilter);
    this.reload();
    this.filterOpen = false;
  }
  clearDraft(): void {
    this.draftFilter = {
      keyword: this.filter.keyword,
      categories: [],
      availableOnly: false,
      sort: 'newest',
    };
  }
  closeFilters(): void {
    this.filterOpen = false;
  }
  openFilters(): void {
    this.draftFilter = this.copyFilter(this.filter);
    this.filterOpen = true;
  }
  track(_i: number, v: Vehicle): string {
    return v.id;
  }
  private completeRefresher(event?: CustomEvent): void {
    void (event?.target as HTMLIonRefresherElement | undefined)?.complete();
  }
  private placeholderForWidth(width: number): string {
    return width <= 390 ? 'Make or type…' : 'Search by make or type…';
  }
  private copyFilter(filter: VehicleFilter): VehicleFilter {
    return { ...filter, categories: [...filter.categories] };
  }
}
