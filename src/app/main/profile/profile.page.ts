import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  informationCircleOutline,
  lockClosedOutline,
  logInOutline,
  logOutOutline,
  pencilOutline,
  shieldCheckmarkOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  moonOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../core/theme.service';
import { CustomerProfile, ThemePreference } from '../../models/domain.models';
import { AuthService, BookingService, ProfileService } from '../../models/service.interfaces';
import { catchError, finalize, of, Subscription, switchMap, timeout, timer } from 'rxjs';
import { AppVersionComponent } from '../../shared/app-version.component';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonBadge,
    IonButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    AppVersionComponent,
    ImageFallbackDirective,
    ScreenSkeletonComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header
    ><ion-content
      ><div class="profile-shell">
        <ng-container *ngIf="authenticated(); else guest"
          ><ng-container *ngIf="profile() as p; else profileState"
            ><section class="profile-hero">
              <ion-avatar
                ><img
                  appImageFallback
                  fallbackSrc="assets/profile-placeholder.svg"
                  [src]="p.profileImage || 'assets/profile-placeholder.svg'"
                  [alt]="p.fullName"
                  width="164"
                  height="164"
              /></ion-avatar>
              <div>
                <h1>{{ p.fullName }}</h1>
                <p>{{ p.email }}</p>
              </div>
            </section>
            <ion-list inset class="settings-group"
              ><ion-list-header><ion-label>Account</ion-label></ion-list-header
              ><ion-item button detail routerLink="/profile/edit"
                ><ion-icon slot="start" name="pencil-outline" /><ion-label>Edit profile</ion-label></ion-item
              ><ion-item button detail routerLink="/profile/change-password"
                ><ion-icon slot="start" name="lock-closed-outline" /><ion-label
                  >Change password</ion-label
                ></ion-item
              ><ion-item lines="none" class="document-status"
                ><ion-icon slot="start" name="shield-checkmark-outline" /><ion-label
                  ><strong>Rental documents</strong>
                  <p>{{ licenseStatusHelp(p.licenseStatus) }}</p></ion-label
                ><ion-badge [color]="licenseStatusColor(p.licenseStatus)">{{
                  licenseStatusLabel(p.licenseStatus)
                }}</ion-badge></ion-item
              ></ion-list
            ></ng-container
          ><ng-template #profileState
            ><section class="profile-hero" aria-live="polite">
              <app-screen-skeleton *ngIf="profileLoading(); else profileErrorState" variant="profile" />
              <ng-template #profileErrorState
                ><div>
                  <h1>Profile unavailable</h1>
                  <p>{{ profileError() }}</p>
                  <ion-button fill="outline" (click)="loadProfile()">Retry</ion-button>
                </div></ng-template
              >
            </section></ng-template
          > </ng-container
        ><ng-template #guest
          ><section class="guest-card">
            <img src="assets/logo.png" alt="" />
            <h1>Your trips in one place</h1>
            <p>Sign in to reserve vehicles, manage bookings, and contact support.</p>
            <ion-button expand="block" routerLink="/auth/login"
              ><ion-icon slot="start" name="log-in-outline" />Sign in</ion-button
            >
          </section></ng-template
        ><ion-list inset class="settings-group"
          ><ion-list-header><ion-label>Preferences</ion-label></ion-list-header
          ><ion-item *ngIf="authenticated()" button detail routerLink="/profile/edit"
            ><ion-icon slot="start" name="notifications-outline" /><ion-label
              >Notifications</ion-label
            ></ion-item
          ><ion-item
            ><ion-icon slot="start" name="moon-outline" /><ion-label>Appearance</ion-label
            ><ion-select
              aria-label="Appearance"
              [value]="theme.preference()"
              (ionChange)="setTheme($event.detail.value)"
              ><ion-select-option value="system">System</ion-select-option
              ><ion-select-option value="light">Light</ion-select-option
              ><ion-select-option value="dark">Dark</ion-select-option></ion-select
            ></ion-item
          ></ion-list
        ><ion-list inset class="settings-group"
          ><ion-list-header><ion-label>Support & legal</ion-label></ion-list-header
          ><ion-item button detail routerLink="/more/faq"
            ><ion-icon slot="start" name="help-circle-outline" /><ion-label>FAQ</ion-label></ion-item
          ><ion-item button detail routerLink="/more/about"
            ><ion-icon slot="start" name="information-circle-outline" /><ion-label
              >About PMS</ion-label
            ></ion-item
          ><ion-item button detail routerLink="/more/privacy"
            ><ion-icon slot="start" name="shield-checkmark-outline" /><ion-label
              >Privacy Policy</ion-label
            ></ion-item
          ><ion-item button detail routerLink="/more/support"
            ><ion-icon slot="start" name="chatbubble-outline" /><ion-label
              >Contact & support</ion-label
            ></ion-item
          ></ion-list
        ><ion-button
          *ngIf="authenticated()"
          class="logout"
          expand="block"
          fill="outline"
          color="danger"
          [disabled]="loggingOut()"
          (click)="logout()"
          ><ion-icon *ngIf="!loggingOut()" slot="start" name="log-out-outline" />
          <ion-spinner *ngIf="loggingOut()" slot="start" name="crescent" />
          {{ loggingOut() ? 'Signing out…' : 'Logout' }}</ion-button
        >
        <app-version />
      </div>
    </ion-content>`,
})
export class ProfilePage implements OnInit, OnDestroy {
  readonly profile = signal<CustomerProfile | null>(null);
  readonly authenticated = signal(false);
  readonly profileLoading = signal(false);
  readonly profileError = signal('Please check your connection and try again.');
  readonly loggingOut = signal(false);
  private authSubscription?: Subscription;
  constructor(
    public readonly auth: AuthService,
    public readonly theme: ThemeService,
    private readonly profiles: ProfileService,
    private readonly bookings: BookingService,
    private readonly router: Router,
  ) {
    addIcons({
      helpCircleOutline,
      informationCircleOutline,
      lockClosedOutline,
      logInOutline,
      logOutOutline,
      pencilOutline,
      shieldCheckmarkOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      moonOutline,
      notificationsOutline,
    });
  }
  ngOnInit(): void {
    this.authSubscription = this.auth.user$.subscribe((user) => {
      this.authenticated.set(user !== null);
      if (user) {
        this.loadProfile();
      } else {
        this.profile.set(null);
        this.profileLoading.set(false);
      }
    });
  }
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
  ionViewWillEnter(): void {
    this.loadProfile();
  }
  loadProfile(): void {
    if (!this.authenticated() || this.profileLoading()) return;
    this.profileLoading.set(true);
    this.profileError.set('Please check your connection and try again.');
    this.profiles.get().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileLoading.set(false);
      },
      error: () => {
        this.profile.set(null);
        this.profileLoading.set(false);
      },
    });
  }
  setTheme(v: ThemePreference): void {
    this.theme.set(v);
  }
  licenseStatusLabel(status: CustomerProfile['licenseStatus']): string {
    if (status === 'verified') return 'Verified';
    if (status === 'pending') return 'Verification pending';
    if (status === 'rejected') return 'Needs attention';
    return 'License not added';
  }
  licenseStatusColor(status: CustomerProfile['licenseStatus']): string {
    if (status === 'verified') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'rejected') return 'danger';
    return 'medium';
  }
  licenseStatusHelp(status: CustomerProfile['licenseStatus']): string {
    if (status === 'verified') return 'Your driver’s license is ready for rentals.';
    if (status === 'pending') return 'We’ll update you after review.';
    if (status === 'rejected') return 'Update your license image in Edit profile.';
    return 'Add a driver’s license in Edit profile.';
  }
  logout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    timer(650)
      .pipe(
        switchMap(() => this.auth.logout()),
        timeout(4000),
        catchError(() => of(undefined)),
        finalize(() => {
          this.bookings.clear();
          void this.router
            .navigateByUrl('/tabs/home', { replaceUrl: true })
            .finally(() => this.loggingOut.set(false));
        }),
      )
      .subscribe();
  }
}
