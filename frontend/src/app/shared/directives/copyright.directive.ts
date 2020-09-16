
import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '.page-content'
})
export class CopyrightDirective implements AfterViewInit {
  constructor(
      private el: ElementRef
  ) { }

  ngAfterViewInit() {
    const element = $(this.el.nativeElement);
    const template = `<div class="text-left" style="position: absolute; bottom: 5px; font-size:10px;"><span><i>Copyright ERM © 2020 - BotScript AI Platform</i></span></div>`;
    element.append(template);
  }

}
