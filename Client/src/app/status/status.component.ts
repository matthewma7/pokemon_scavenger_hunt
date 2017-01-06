import { Component, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-status',
	templateUrl: './status.component.html',
	styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
	status = null;

	constructor(private http: Http, private authService: AuthService) {

	}

	ngOnInit() {
		return this.http.get(
			environment.server + "/api/status",
			{
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': btoa(this.authService.email)
				})
			})
			.toPromise()
			.then(response => response.json())
			.then(status => {
				this.status = status;
				console.log(status);
			})
	}

}
