import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { AngularFire, FirebaseApp, FirebaseListObservable} from 'angularfire2';
import { Gallery } from './gallery.interface';
import { LocalStorageService } from 'angular-2-local-storage';

import { FacebookService, FacebookLoginResponse, FacebookInitParams} from 'ng2-facebook-sdk';


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  providers:[FacebookService]
})
export class GalleryComponent implements OnInit {
  gallery:Gallery = {
  	fileName:null,
    imageDesc:null
  }

  file:any = null;
  firebase:any;
  user:string;
  progress:number=0;
  showProgress:boolean = false;
  showPreLoader:boolean = false;
  galleryImages:FirebaseListObservable<any>;
  images:Array<any> = [];

  constructor(af: AngularFire, @Inject(FirebaseApp) firebase: any, localStorage:LocalStorageService, private fb:FacebookService) {
  	this.firebase = firebase;
    this.showPreLoader = true;
    var user = this.getUser();
    var userAsObject = JSON.parse(user);
    this.galleryImages = af.database.list('users/'+userAsObject.uid +'/gallery/', {preserveSnapshot:true});
    this.galleryImages.subscribe(snapshot =>  {
      this.showPreLoader = false;
      console.log(snapshot);
      this.images = [];

      snapshot.forEach(eachImage => {
        var valueExists = false;
        this.images.forEach(data => {
         if(data === {key:eachImage.key, value:eachImage.val()}) {
            valueExists = true;
           console.log(data);
         }
        })
        if(valueExists === false) {
             this.images.push({key:eachImage.key, value:eachImage.val()});
        }
      })

      let fbParams: FacebookInitParams = {
                                   appId: '1769016783313542',
                                   xfbml: true,
                                   version: 'v2.7'
                                   };
       this.fb.init(fbParams);
    });


   }

  ngOnInit() {
	
  }

  ngAfterViewInit() {
  }

  getUser() {
    return localStorage.getItem('loggedInUser');
  }


  uploadImages({value, valid}: {value:Gallery, valid:true}) {
    this.showProgress = true;
  	var user = JSON.parse(localStorage.getItem('loggedInUser'));
  	var galleryRef = this.firebase.database().ref('users/'+user.auth.uid +'/gallery/');
    var galleryComponentObj = this;

   this.file = (<HTMLInputElement>document.getElementById('imageFile')).files[0];
  	var uploadTask = this.firebase.storage().ref('/gallery/images/'+this.file.name).put(this.file);
  	uploadTask.on('state_changed', function(snapshot) {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
       galleryComponentObj.progress = progress;
  	}, function(error) {
  		console.log(error);
  	}, function() {
      galleryComponentObj.showProgress = false;
  		var galleryImage = {
        path: uploadTask.snapshot.downloadURL,
        desc:value.imageDesc
      }
     
  		galleryRef.push(galleryImage).then((success) => {
        	galleryComponentObj.gallery = {
          fileName:null,
          imageDesc:null
        }
  		}).catch((error) => {
  			console.log(error);
  		})
  	})
  }

  share() {
    this.fb.api('/')
    this.fb.login().then(
      (response:FacebookLoginResponse) => {
        console.log(response);
        // this.fb.sh
      },
      (error:any) => console.log(error)
      );
  }

  removeImage(imageId) {
    var user = JSON.parse(localStorage.getItem('loggedInUser'));
    var removeRef = this.firebase.database().ref('users/'+user.auth.uid +'/blogs/'+imageId);
    removeRef.set(null);
  }

}
