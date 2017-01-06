import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import PubSub from 'pubsub-js';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	email = "";
	
	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
		PubSub.publish("prevent-navigation");
	}

	ngOnDestroy() {
		PubSub.publish("resume-navigation");
	}

	login() {
		console.log(this.email);
		this.authService.login(this.email)
			.then((result) => {
				if (result) {
					this.router.navigate(['./explore']);
				}
				else{
					alert("email not found");
				}
			})
	}
}
