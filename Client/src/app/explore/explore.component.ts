import { Component, OnInit } from '@angular/core';
import PubSub from 'pubsub-js';

@Component({
	selector: 'app-explore',
	templateUrl: './explore.component.html',
	styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

	showNavigation = true;
	constructor() { }

	ngOnInit() {
		PubSub.subscribe("prevent-navigation", () => {
			this.showNavigation = false;
		});
		PubSub.subscribe("resume-navigation", () => {
			this.showNavigation = true;
		});
	}

}
