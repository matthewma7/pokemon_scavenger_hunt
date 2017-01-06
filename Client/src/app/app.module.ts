import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CatchingComponent } from './catching/catching.component';
import { StatusComponent } from './status/status.component';

import { LoginComponent } from './login/login.component';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { Routes, RouterModule } from '@angular/router';
import { ExploreComponent } from './explore/explore.component';
import { BarcodeComponent } from './barcode/barcode.component';
import { BarcodeDirective } from './barcode.directive';


@NgModule({
	declarations: [
		AppComponent,
		CatchingComponent,
		StatusComponent,
		LoginComponent,
		LeaderboardComponent,
		ExploreComponent,
		BarcodeComponent,
		BarcodeDirective
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		RouterModule.forRoot([
			{
				path: '',
				component: ExploreComponent,
				children: [
					{
						path: '',
						redirectTo: "/login",
						pathMatch: 'full'
					},
					{
						path: 'explore',
						component: CatchingComponent,
						canActivate: [AuthGuard]
					},
					{
						path: 'status',
						component: StatusComponent,
						canActivate: [AuthGuard]
					},
				],
			},
			{
				path: 'login',
				component: LoginComponent,
			},
			{
				path: 'leaderboard',
				component: LeaderboardComponent,
			},
			{
				path: 'barcode',
				component: BarcodeComponent
			}
		])
	],
	providers: [AuthService, AuthGuard],
	bootstrap: [AppComponent]
})
export class AppModule { }
