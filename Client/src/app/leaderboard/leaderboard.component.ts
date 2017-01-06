import { Component, OnInit, OnDestroy } from '@angular/core';
import PubSub from 'pubsub-js';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Component({
	selector: 'app-leaderboard',
	templateUrl: './leaderboard.component.html',
	styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, OnDestroy {

	trainers = [];
	url = "";
	constructor(private http: Http) {
		this.url = environment.url;
		this.load = this.load.bind(this);
	}

	timeIntevalHandle = null;
	ngOnInit() {
		this.load();
		this.timeIntevalHandle = setInterval(this.load, 10000);
	}

	ngOnDestroy() {
		clearInterval(this.timeIntevalHandle);
	}

	load() {
		this.http.get(
			environment.server + "/api/leaderboard",
			{
				headers: new Headers({
					'Content-Type': 'application/json'
				})
			})
			.toPromise()
			.then(response => response.json())
			.then(trainers => {
				trainers.sort((a, b) => this.getTotal(b.trainerPokemons) - this.getTotal(a.trainerPokemons));
				this.trainers = trainers;
			})
	}

	getTotal(trainerPokemons) {
		return trainerPokemons.map(a => a.count).reduce((a, b) => a + b);
	}

}
