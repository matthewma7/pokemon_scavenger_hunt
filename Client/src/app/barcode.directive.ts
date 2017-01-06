import { Directive, ElementRef, Input, Renderer } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Directive({
	selector: '[appBarcode]'
})
export class BarcodeDirective {

	@Input('appBarcode') code: string;

	constructor(private el: ElementRef, renderer: Renderer) {
	}

	ngOnInit() {
		JsBarcode(this.el.nativeElement, this.code, {
			width: 4,
			height: 200,
			displayValue: false
		});
	}

}
