import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
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
  notificationsOutline,
  pencilOutline,
  shieldCheckmarkOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  moonOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../core/theme.service';
import { CustomerProfile, ThemePreference } from '../../models/domain.models';
import { AuthService, ProfileService } from '../../models/service.interfaces';
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
    IonItem,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header
    ><ion-content
      ><div class="profile-shell">
        <ng-container *ngIf="auth.isAuthenticated && profile() as p; else guest"
          ><section class="profile-hero">
            <ion-avatar><img [src]="p.profileImage || 'assets/avatar.png'" [alt]="p.fullName" /></ion-avatar>
            <div>
              <h1>{{ p.fullName }}</h1>
              <p>{{ p.email }}</p>
              <ion-badge color="success">License {{ p.licenseStatus }}</ion-badge>
            </div>
          </section>
          <ion-list inset
            ><ion-item button detail routerLink="/profile/edit"
              ><ion-icon slot="start" name="pencil-outline" /><ion-label>Edit profile</ion-label></ion-item
            ><ion-item button detail routerLink="/profile/change-password"
              ><ion-icon slot="start" name="lock-closed-outline" /><ion-label
                >Change password</ion-label
              ></ion-item
            ><ion-item
              ><ion-icon slot="start" name="notifications-outline" /><ion-label>Notifications</ion-label
              ><ion-badge color="primary">On</ion-badge></ion-item
            ></ion-list
          ></ng-container
        ><ng-template #guest
          ><section class="guest-card">
            <img src="assets/logo.png" alt="" />
            <h1>Your trips in one place</h1>
            <p>Sign in to reserve vehicles, manage bookings, and contact support.</p>
            <ion-button expand="block" routerLink="/auth/login"
              ><ion-icon slot="start" name="log-in-outline" />Sign in</ion-button
            >
          </section></ng-template
        ><ion-list inset
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
          *ngIf="auth.isAuthenticated"
          class="logout"
          expand="block"
          fill="outline"
          color="danger"
          (click)="logout()"
          ><ion-icon slot="start" name="log-out-outline" />Logout</ion-button
        >
        <p class="version">PMS Car Rental · Mobile preview 1.0</p>
      </div></ion-content
    >`,
})
export class ProfilePage implements OnInit {
  readonly profile = signal<CustomerProfile | null>(null);
  constructor(
    public readonly auth: AuthService,
    public readonly theme: ThemeService,
    private readonly profiles: ProfileService,
    private readonly router: Router,
  ) {
    addIcons({
      helpCircleOutline,
      informationCircleOutline,
      lockClosedOutline,
      logInOutline,
      logOutOutline,
      notificationsOutline,
      pencilOutline,
      shieldCheckmarkOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      moonOutline,
    });
  }
  ngOnInit(): void {
    if (this.auth.isAuthenticated) this.profiles.get().subscribe((p) => this.profile.set(p));
  }
  setTheme(v: ThemePreference): void {
    this.theme.set(v);
  }
  logout(): void {
    this.auth.logout().subscribe(() => {
      this.profile.set(null);
      void this.router.navigateByUrl('/tabs/home');
    });
  }
}
