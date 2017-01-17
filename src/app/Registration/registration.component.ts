import { Component, OnInit, Inject } from '@angular/core';
import { User } from './registration.interface';
import { AngularFire, FirebaseAuth, FirebaseApp } from 'angularfire2';
import { Router } from'@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
	user:User = {
		firstName:'',
		lastName:'',
		account: {
			email: '',
			password:'',
			confirm:''
		}
	}

  firebase:any;
  file:any;
  registrationProcess:boolean = false;
  registrationText:string = 'CREATE';
  registerResponse:Object;
  errorMessage:string;

  constructor(private af:AngularFire,  private fAuth:FirebaseAuth, private router:Router, private localStorage:LocalStorageService, @Inject(FirebaseApp) firebase:any) {
    this.firebase = firebase;
  }

  ngOnInit() {
    if(localStorage.getItem('loggedInUser') != null) {
      this.router.navigate(['/about']);
    }
  }

  // Create user
  createUser({ value, valid }: { value: User, valid: boolean }) {
    var registrationCompObj = this;
    if(value.account.confirm != value.account.password) {
      this.errorMessage = 'Invalid confirm password.';
    } else {

          var registrationCompObj = this;
          registrationCompObj.registrationProcess = true;
           registrationCompObj.registrationText = 'Registering...';
          var fUser = {email:value.account.email, password:value.account.password};
          this.af.auth.createUser(fUser)
            .then((success) => {
              var registeredUser = success;
              var user = {
                email:success.auth.email,
                uid: success.auth.uid,
                firstName:value.firstName,
                lastName:value.lastName,
                profileImageSrc:null
              };

              this.uploadProfileImage(user.uid, user, registeredUser);
            }).catch((err) => {
               registrationCompObj.registrationProcess = false;
                registrationCompObj.registrationText = "CREATE"
                registrationCompObj.errorMessage = err.message
              console.log(err);
            });
    }
  }

  uploadProfileImage(userId, user, registeredUser) {
    var registrationCompObj = this;
    var user = user;
   this.file = (<HTMLInputElement>document.getElementById('imageFile')).files[0];
   if(this.file != undefined) {
     var uploadTask = this.firebase.storage().ref('/gallery/images/'+this.file.name).put(this.file);
      uploadTask.on('state_changed', function(snapshot) {
        registrationCompObj.registrationProcess = true;
         registrationCompObj.registrationText = "Uploading..."
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, function(error) {
          registrationCompObj.registrationProcess = false;
         registrationCompObj.registrationText = "CREATE"
         registrationCompObj.errorMessage = error.message

        console.log(error);
      }, function() {
          user.profileImageSrc = uploadTask.snapshot.downloadURL;
          registrationCompObj.addUserWithProfileImage(user, registeredUser);
      })
   } else {
     this.addUserWithProfileImage(user, registeredUser);
   }    
  }

  private addUserWithProfileImage(user, registeredUser) {
    var registrationCompObj = this;
    this.firebase.database().ref('/users/'+user.uid).set(user).then((success) => {
         localStorage.setItem('loggedInUser', JSON.stringify(registeredUser));
          registrationCompObj.registrationProcess = false;
          registrationCompObj.registrationText = "CREATE";
         this.router.navigate(['/login']);
     }).catch((error) => {
        registrationCompObj.registrationProcess = false;
         registrationCompObj.registrationText = "CREATE"
         registrationCompObj.errorMessage = error.message
       console.log(error);
     })
  }

}
