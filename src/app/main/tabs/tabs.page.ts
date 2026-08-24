import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, carSportOutline, calendarOutline, personOutline } from 'ionicons/icons';
@Component({
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `<ion-tabs
    ><ion-tab-bar slot="bottom"
      ><ion-tab-button tab="home" href="/tabs/home"
        ><ion-icon name="home-outline" /><ion-label>Home</ion-label></ion-tab-button
      ><ion-tab-button tab="vehicles" href="/tabs/vehicles"
        ><ion-icon name="car-sport-outline" /><ion-label>Vehicles</ion-label></ion-tab-button
      ><ion-tab-button tab="bookings" href="/tabs/bookings"
        ><ion-icon name="calendar-outline" /><ion-label>My Bookings</ion-label></ion-tab-button
      ><ion-tab-button tab="profile" href="/tabs/profile"
        ><ion-icon name="person-outline" /><ion-label>Profile</ion-label></ion-tab-button
      ></ion-tab-bar
    ></ion-tabs
  >`,
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, carSportOutline, calendarOutline, personOutline });
  }
}
