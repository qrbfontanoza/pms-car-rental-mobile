import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
          placeholder="Search make or type"
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
      <div class="vehicle-grid page-shell" *ngIf="!loading() && items().length">
        <app-vehicle-card *ngFor="let v of items(); trackBy: track" [vehicle]="v" />
      </div>
      <app-empty-state
        *ngIf="!loading() && !items().length"
        title="No vehicles found"
        message="Try adjusting your filters or searching another name."
        ><ion-button (click)="clear()">Clear filters</ion-button></app-empty-state
      ><ion-infinite-scroll [disabled]="page() >= totalPages()" (ionInfinite)="more($event)"
        ><ion-infinite-scroll-content loadingText="Loading more rides..."
      /></ion-infinite-scroll>
      <div
        class="filter-backdrop"
        *ngIf="filterOpen"
        tabindex="0"
        (click)="backdropClick($event)"
        (keydown.escape)="closeFilters()"
      >
        <section class="filter-sheet">
          <ion-header
            ><ion-toolbar
              ><ion-title>Filters & sort</ion-title
              ><ion-button slot="end" fill="clear" (click)="closeFilters()">Done</ion-button></ion-toolbar
            ></ion-header
          >
          <div class="filter-content ion-padding">
            <h3>Category</h3>
            <ion-item *ngFor="let c of categories"
              ><ion-checkbox
                [checked]="filter.categories.includes(c)"
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
                [(ngModel)]="filter.minPrice"
              /><ion-input
                label="Maximum"
                labelPlacement="stacked"
                type="number"
                [(ngModel)]="filter.maxPrice"
              />
            </div>
            <ion-select label="Minimum seats" labelPlacement="stacked" [(ngModel)]="filter.seats"
              ><ion-select-option [value]="undefined">Any</ion-select-option
              ><ion-select-option *ngFor="let n of [2, 4, 7, 9]" [value]="n"
                >{{ n }}+</ion-select-option
              ></ion-select
            ><ion-select label="Fuel type" labelPlacement="stacked" [(ngModel)]="filter.fuel"
              ><ion-select-option value="">Any</ion-select-option
              ><ion-select-option *ngFor="let f of ['Gasoline', 'Diesel', 'Hybrid']" [value]="f">{{
                f
              }}</ion-select-option></ion-select
            ><ion-select label="Transmission" labelPlacement="stacked" [(ngModel)]="filter.transmission"
              ><ion-select-option value="">Any</ion-select-option
              ><ion-select-option value="Automatic">Automatic</ion-select-option
              ><ion-select-option value="Manual">Manual</ion-select-option></ion-select
            ><ion-item
              ><ion-toggle [(ngModel)]="filter.availableOnly">Available vehicles only</ion-toggle></ion-item
            ><ion-select label="Sort by" labelPlacement="stacked" [(ngModel)]="filter.sort"
              ><ion-select-option value="name_asc">Name A–Z</ion-select-option
              ><ion-select-option value="name_desc">Name Z–A</ion-select-option
              ><ion-select-option value="price_asc">Price low to high</ion-select-option
              ><ion-select-option value="price_desc">Price high to low</ion-select-option
              ><ion-select-option value="newest">Newest</ion-select-option></ion-select
            ><ion-button expand="block" size="large" (click)="apply()">Show vehicles</ion-button>
          </div>
        </section>
      </div></ion-content
    >`,
})
export class VehiclesPage implements OnInit {
  readonly categories: VehicleCategory[] = ['Sedan', 'SUV', 'Van', 'Minivan', 'Scooter', 'Pickup'];
  readonly items = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  filterOpen = false;
  filter: VehicleFilter = { keyword: '', categories: [], availableOnly: false, sort: 'newest' };
  constructor(
    private readonly service: VehicleService,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({ filterOutline, optionsOutline, searchOutline });
  }
  ngOnInit(): void {
    const category = this.route.snapshot.queryParamMap.get('category') as VehicleCategory | null;
    if (category) this.filter.categories = [category];
    this.reload();
  }
  get activeCount(): number {
    return (
      Number(!!this.filter.keyword) +
      this.filter.categories.length +
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
      this.filter.availableOnly ? 'Available only' : '',
      this.filter.fuel || '',
      this.filter.transmission || '',
    ].filter(Boolean);
  }
  reload(): void {
    this.loading.set(true);
    this.page.set(1);
    this.service.list(this.filter, 1).subscribe({
      next: (r) => {
        this.items.set(r.data);
        this.totalPages.set(r.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    this.service.refresh().subscribe(() => {
      this.reload();
      void (event.target as HTMLIonRefresherElement).complete();
    });
  }
  clear(): void {
    this.filter = { keyword: '', categories: [], availableOnly: false, sort: 'newest' };
    this.reload();
  }
  toggleCategory(c: VehicleCategory, on: boolean): void {
    this.filter.categories = on
      ? [...this.filter.categories, c]
      : this.filter.categories.filter((x) => x !== c);
  }
  apply(): void {
    this.reload();
    this.filterOpen = false;
  }
  closeFilters(): void {
    this.filterOpen = false;
  }
  openFilters(): void {
    this.filterOpen = true;
  }
  backdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeFilters();
  }
  track(_i: number, v: Vehicle): string {
    return v.id;
  }
}
