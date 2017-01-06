import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import QrCode from 'qrcode-reader';
import loadImage from 'blueimp-load-image-npm';
import Quagga from 'quagga';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';
import PubSub from 'pubsub-js';
import { AuthService } from '../auth.service';

import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-catching',
	templateUrl: './catching.component.html',
	styleUrls: ['./catching.component.css']
})
export class CatchingComponent implements OnInit {

	@ViewChild('fileinput') fileInput: ElementRef;
	@ViewChild('canvaspreview') canvasPreview: ElementRef;

	result: string;
	pokeballVisible: boolean = true;
	messageClass = [];
	pokemonVisible: boolean = false;
	animationClass = [];
	private messageContent = "";
	pokemonSrc = "";

	constructor(private zone: NgZone, private http: Http, private authService: AuthService) { }

	ngOnInit() {
	}

	photoTaken(e) {
		loadImage.parseMetaData(e.target.files[0], data => {
			this.pokeballVisible = false;
			PubSub.publish("prevent-navigation");
			var orientation = 1;
			var latLon;
			if (data.exif) {
				orientation = data.exif.get('Orientation');
				var latitude = data.exif.get('GPSLatitude');
				var longitude = data.exif.get('GPSLongitude');
				var latitudeRef = data.exif.get('GPSLatitudeRef');
				var longitudeRef = data.exif.get('GPSLongitudeRef');
				if (latitude && longitude && latitudeRef && longitudeRef) {
					latLon = toDecimal(latitude, latitudeRef, longitude, longitudeRef);
				}
			}
			loadImage(
				e.target.files[0],
				canvas => {
					var context = canvas.getContext("2d");
					var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
					context.putImageData(threshold(imageData, 100), 0, 0);
					// document.body.appendChild(canvas);
					var dataURI = canvas.toDataURL();
					Quagga.decodeSingle({
						decoder: {
							readers: ["code_128_reader"]
						},
						locate: false,
						src: dataURI,
						numOfWorkers: 0
					}, re => {
						if (re && re.codeResult) {
							this.result = re.codeResult.code;
							var code = re.codeResult.code.replace(/@/g, "");
							console.log(re.codeResult.code);
							this.scan({
								code: code,
								imageHash: hashCode(dataURI)
							})
						} else {
							this.pokeballVisible = true;
							this.message = "nothing happened";
							setTimeout(() => this.message = "", 4000);
							this.result = "not detected";
						}
						setTimeout(() => {
							this.result = "";
							// this.zone.run(() => { });
						}, 5000);
						// this.zone.run(() => { });
					});
				},
				{
					maxWidth: 600,
					orientation: orientation,
					canvas: true,
					crop: true,
					// aspectRatio:1/1
				}
			);
			e.target.value = "";
		});
	}

	scan(attempt) {
		this.http.post(
			environment.server + "/api/scan",
			JSON.stringify(attempt),
			{
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': btoa(this.authService.email)
				})
			})
			.toPromise()
			.then(response => response.json())
			.then(result => {
				console.log(result);
				switch (result.type) {
					case "catch":
						this.catch(result);
						return;
					case "nopokeball":
						this.message = "No pokeball left, need to get some pokeball at the shop first.";
						break;
					case "addpokeball":
						this.message = `Got ${result.count} pokeballs!`;
						break;
					case "duplicateimage":
						this.message = "There are new pokemon to explore.";
						break;
					case "invalidscan":
						this.message = "nothing happened";
						break;
				}
				setTimeout(() => this.message = "", 4000);
				PubSub.publish("resume-navigation");
				this.pokeballVisible = true;
			})
	}

	catch(result) {
		var pokemonSrc = environment.server + "/assets/pokemon/" + result.pokemonId + ".png";
		new Promise<string>((resolve, reject) => {
			var image = new Image();
			image.src = pokemonSrc;
			image.onload = function () {
				resolve(pokemonSrc);
			}
			image.onerror = function () {
				reject();
			}
		})
			.then(pokemonSrc => {
				delay(() => {
					this.pokemonVisible = true;
					this.animationClass = ["wiggle"];
					this.pokemonSrc = pokemonSrc;
					this.message = `Wild ${result.pokemonName} appears!`;
				}, 0)
					.delay(() => {
						this.message = `Throw a pokeball at ${result.pokemonName}!`;
					}, 2500)
					.delay(() => {
						this.message = [
							`${result.pokemonName} is fighting back!`,
							`${result.pokemonName} is trying to escape`
						][Math.floor((Math.random() * 2))];
					}, 2000)
					.delay(() => {
						if (result.caught) {
							this.animationClass = [];
							this.message = `Caught ${result.pokemonName}!`;
						}
						else {
							this.animationClass = ["fade"];
							this.message = `${result.pokemonName} escaped`;
							this.messageClass.push("fade");
						}
					}, 2500)
					.delay(() => {
						this.pokemonVisible = false;
						this.pokeballVisible = true;
						PubSub.publish("resume-navigation");
						this.message = "";
					}, 3200);
			})
	}

	// catch2(dataURI) {
	// 	this.http.post(
	// 		environment.server + "/api/catch2",
	// 		JSON.stringify({ base64Image: dataURI }),
	// 		{ headers: new Headers({ 'Content-Type': 'application/json' }) })
	// 		.toPromise()
	// 		.then(result => {

	// 		})
	// }

	set message(value) {
		this.messageClass = [["blue", "orange", "red", "purple"][Math.floor((Math.random() * 3))]];
		this.messageContent = value;
	}

	get message() {
		return this.messageContent;
	}
}

function toDecimal(lat, latRef, lon, lonRef) {
	lat = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef == "N" ? 1 : -1);
	lon = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef == "W" ? -1 : 1);
	return { latitude: lat, longitude: lon };
}

function hashCode(str) {
	var hash = 0, i, chr, len;
	if (str.length === 0) return hash;
	for (i = 0, len = str.length; i < len; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

function threshold(pixels, threshold) {
	var d = pixels.data;
	for (var i = 0; i < d.length; i += 4) {
		var r = d[i];
		var g = d[i + 1];
		var b = d[i + 2];
		var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
		d[i] = d[i + 1] = d[i + 2] = v
	}
	return pixels;
};

function delay(fn, t) {
	// private instance variables
	var queue = [], self, timer;

	function schedule(fn, t) {
		timer = setTimeout(function () {
			timer = null;
			fn();
			if (queue.length) {
				var item = queue.shift();
				schedule(item.fn, item.t);
			}
		}, t);
	}
	self = {
		delay: function (fn, t) {
			// if already queuing things or running a timer, 
			//   then just add to the queue
			if (queue.length || timer) {
				queue.push({ fn: fn, t: t });
			} else {
				// no queue or timer yet, so schedule the timer
				schedule(fn, t);
			}
			return self;
		},
		cancel: function () {
			clearTimeout(timer);
			queue = [];
		}
	};
	return self.delay(fn, t);
}

