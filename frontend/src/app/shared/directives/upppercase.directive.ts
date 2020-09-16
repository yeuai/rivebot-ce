import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[upperCase]'
})
export class UpperCaseDirective {

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {
  }

  @HostListener('keyup') onKeyUp() {
    this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
  }

  @HostListener('input', ['$event']) onInputChange($event) {
    this.el.nativeElement.value = $event.target.value.toUpperCase();
  }
}
