import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appNavDropdown]'
})
export class NavDropdownDirective {

  constructor(private el: ElementRef) { }

  toggle() {
    this.el.nativeElement.classList.toggle('open');
  }
}

/**
 * Allows the dropdown to be toggled via click.
 */
@Directive({
  selector: '[appNavDropdownToggle]'
})
export class NavDropdownToggleDirective {
  constructor(private dropdown: NavDropdownDirective) {}

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    this.dropdown.toggle();
  }
}

@Directive({
  selector: '[appHtmlAttr]'
})
export class HtmlAttributesDirective implements OnInit {
  @Input() appHtmlAttr: {[key: string]: string };

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    const attribs = this.appHtmlAttr;
    for (const attr in attribs) {
      if (attr === 'style' && typeof(attribs[attr]) === 'object' ) {
        this.setStyle(attribs[attr]);
      } else if (attr === 'class') {
        this.addClass(attribs[attr]);
      } else {
        this.setAttrib(attr, attribs[attr]);
      }
    }
  }

  private setStyle(styles) {
    // tslint:disable-next-line:forin
    for (const style in styles) {
      this.renderer.setStyle(this.el.nativeElement, style, styles[style] );
    }
  }

  private addClass(classes) {
    const classArray = (Array.isArray(classes) ? classes : classes.split(' '));
    classArray.filter((element) => element.length > 0).forEach(element => {
      this.renderer.addClass(this.el.nativeElement, element );
    });
  }

  private setAttrib(key, value) {
    value !== null ?
      this.renderer.setAttribute(this.el.nativeElement, key, value ) :
      this.renderer.removeAttribute(this.el.nativeElement, key);
  }
}
