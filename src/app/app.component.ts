import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute } from '@angular/router';
import {AngularFire, FirebaseAuth} from 'angularfire2';

import "rxjs/add/operator/filter";
import "rxjs/add/operator/first";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  user:string;
  changeUrl:boolean = false;
  currentUrl:string;
  userAccount:string;
  constructor(private localStorage:LocalStorageService, private router:Router, private af:AngularFire,  private fAuth:FirebaseAuth) {
  	this.checkAuth();
  }

// Checks authentication data every second and if data is empty redirects to login page
  private checkAuth() {
  	if(localStorage.getItem('loggedInUser') != null) {
  		this.user = JSON.parse(localStorage.getItem('loggedInUser'));
  	} 
  	setTimeout(() => this.checkAuth(), 1000);
  }


  ngOnInit() {
     this.userAccount = 'userAccount';
  	if(localStorage.getItem('loggedInUser') != null) {
  		this.user = JSON.parse(localStorage.getItem('loggedInUser'));
  		this.router.navigate(['/about']);
  	} else {
  		this.router.navigate(['/login']);
  	}
  }

 // Logs out user
  logout() {
  	localStorage.removeItem('loggedInUser');
	  this.af.auth.logout();
    this.user = null;
	  this.router.navigate(['/login']);

  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

// navigates to gallery
  navigateToAbout() {
    this.router.navigate(['/about']);
  }

// navigates to gallery
  navigateToGallery() {
    this.router.navigate(['/gallery']);
  }

  // navigates to blog
  navigateToBlog() {
    this.router.navigate(['/blog']);
  }

}
