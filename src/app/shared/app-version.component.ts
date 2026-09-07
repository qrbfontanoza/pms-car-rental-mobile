import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [CommonModule],
  template: `<p class="app-version">
    <strong>PMS Car Rental</strong>
    <span *ngIf="version(); else webBuild">Version {{ version() }}</span>
    <ng-template #webBuild><span>Web development build</span></ng-template>
  </p>`,
})
export class AppVersionComponent {
  readonly version = signal('');

  constructor() {
    if (Capacitor.isNativePlatform()) {
      void App.getInfo().then((info) => this.version.set(info.version));
    }
  }
}
