import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from './login.interface';
import { LocalStorageService} from 'angular-2-local-storage';
import{ AngularFire, FirebaseAuth, AuthProviders, AuthMethods } from 'angularfire2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	// Login form fields
	login:Login = {
		email:'',
		password:''
	}

	user:string;
  loginProcess:boolean = false;
  loginText:string = 'LOGIN';
  errorMessage:string;

  constructor(private router:Router, private localStorage:LocalStorageService, private af:AngularFire, private fAuth:FirebaseAuth) { }

  ngOnInit() {
  	if(localStorage.getItem('loggedInUser') != null) {
  		this.router.navigate(['/about']);
  	}
  }

  Login({value, valid}:{value:Login, valid:true}) {
    this.loginProcess = true;
    this.loginText = 'Logging...';

  	this.af.auth.login(value, {provider:AuthProviders.Password, method:AuthMethods.Password}).then((success) =>{
  		localStorage.setItem('loggedInUser', JSON.stringify(success));
      this.loginProcess = false;
      this.loginText = 'LOGIN';
  		this.router.navigate(['/about']);
  	}).catch((err) => {
      this.loginText = 'LOGIN';
      this.loginProcess = false;
      this.errorMessage = err.message;
  		console.log(err);
  	});
  	console.log(value);
  }

  navigateToRegistration() {
  	this.router.navigate(['/register'])
  }

}
