import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { environment } from '../../environments/environment';
import { pokemons } from './pokemons';
import contour from './contour';

@Component({
	selector: 'app-barcode',
	templateUrl: './barcode.component.html',
	styleUrls: ['./barcode.component.css']
})
export class BarcodeComponent implements OnInit {
	pokemons = [];

	constructor() {
		this.pokemons = pokemons;
	}

	ngOnInit() {

	}

	pokemonClick(container) {
		var img: HTMLImageElement = container.querySelector(".original");
		var outline: HTMLImageElement = container.querySelector(".outline");

		if (!outline) {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

			var defineNonTransparent = function (x, y) {
				var a = data[(y * canvas.width + x) * 4 + 3];
				return (a > 20);
			}

			var points = contour(defineNonTransparent, null);

			ctx.strokeStyle = "black";
			ctx.lineWidth = 5;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			ctx.moveTo(points[0][0], points[0][4]);
			for (var i = 1; i < points.length; i++) {
				var point = points[i];
				ctx.lineTo(point[0], point[1]);
			}
			ctx.closePath();
			ctx.stroke();
			
			outline = new Image();
			outline.className = "outline";
			outline.src = canvas.toDataURL();
			container.insertBefore(outline, img.nextSibling);
		}
		var state = img.getAttribute("hidden");
		if (!state) {
			img.setAttribute("hidden", "true");
			outline.removeAttribute("hidden");
		}
		else {
			img.removeAttribute("hidden");
			outline.setAttribute("hidden", "true");
		}

	}
}
