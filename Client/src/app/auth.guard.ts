import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate() {
        // return Promise.resolve(true);
        if (this.authService.isLoggedIn)
            return Promise.resolve(true);
        return this.authService.tryLogin()
            .then(result => {
                if (!result) {
                    this.router.navigate(['./login']);
                    return false;
                }
                return true;
            })
    }
}