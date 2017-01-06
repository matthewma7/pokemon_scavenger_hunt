import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

	isLoggedIn = false;
	email = "";
	constructor(private http: Http) {
		try {
			this.email = sessionStorage.getItem("pokemon_scavenger_hunt-email");
		} catch (e) { }
	}

	ngOnInit() {
		console.log("AuthService");
	}

	login(email) {
		return this.http.post(
			environment.server + "/api/auth",
			null,
			{
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': btoa(email)
				})
			})
			.toPromise()
			.then(() => {
				try {
					sessionStorage.setItem("pokemon_scavenger_hunt-email", email);
				} catch (e) { }
				this.isLoggedIn = true;
				this.email = email;
				return true;
			})
			.catch(() => {
				return false;
			})
	}

	tryLogin() {
		if (this.isLoggedIn) {
			return Promise.resolve(true);
		}
		if (this.email) {
			return this.login(this.email)
		}
		return Promise.resolve(false);
	}
}
