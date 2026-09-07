import { Directive, HostListener, input } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true,
})
export class ImageFallbackDirective {
  fallbackSrc = input('assets/vehicle-placeholder.svg');

  @HostListener('error', ['$event'])
  useFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.dataset['fallbackApplied']) return;
    image.dataset['fallbackApplied'] = 'true';
    image.src = this.fallbackSrc();
  }
}
