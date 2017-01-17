import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { AngularFire, FirebaseApp, FirebaseListObservable, FirebaseAuth} from 'angularfire2';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute } from'@angular/router';

import {Comment} from './blog-details-comments-interface';
import {Status, EditBlog} from './blog-details-status-interface';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent implements OnInit {
  editBlog:any;
  editBlogTitleTest:string;
	blogId:string;
  userId:string;
	blogContent:Array<any>=[];
	comments:Array<any> = [];
  status:Status;
  statusString:string;
	firebase:any;
	showPreLoader:boolean = false;
  showProgress:boolean = false;
	showCommentsPreLoader:boolean = false;
  statusChangeProgress:boolean = false;
  isBlogOfCurrentUser:boolean;
  editMode:boolean = false;
  errorMessage:string;
  errorMessageOnEdit:string;
  user:any;
	comment:Comment = {
		name:'',
		comment:'',
    userId:null,
	}

  constructor(private localStorage:LocalStorageService,  @Inject(FirebaseApp) firebase: any,private router:Router, private activeRoute:ActivatedRoute, private af:AngularFire) {
  	this.firebase = firebase;
  }

  ngOnInit() {
  	this.activeRoute.params.subscribe(params => {
  		this.blogId = params['blogId'];
      this.userId = params['userId'];
  		this.getDetails();
  		this.getComments();
  		
  	})
  }

  getDetails() {
  	 var detailsComponentObj = this;
  	 detailsComponentObj.showPreLoader = true;
  	 var user = JSON.parse(localStorage.getItem('loggedInUser'));
     console.log(user);
     this.user = user;
     this.isBlogOfCurrentUser = false;

    if(this.user != null) {
      if(this.user.auth.uid === this.userId) {
              this.isBlogOfCurrentUser = true;
        }
      this.getPrivateBlogDetails();
    } else {
      this.getPublicBlogDetails();
    }
  }

  getPrivateBlogDetails() {
    var detailsComponentObj = this;
    var blogDetailsRef = this.firebase.database().ref('users/'+this.userId +'/blogs/'+this.blogId);
     blogDetailsRef.on('value', function(snapshot) {
        detailsComponentObj.blogContent = snapshot.val();
        if(snapshot.val().isPublic === true && snapshot.val()!=null) {
          detailsComponentObj.statusString = 'Private'
        } else {
          detailsComponentObj.statusString = 'Public'
        }
        detailsComponentObj.showPreLoader = false;
     })
  }

  getPublicBlogDetails() {
    this.af.database.list('public-blogs/', {preserveSnapshot:true});
    var detailsComponentObj = this;
    var blogDetailsRef = this.firebase.database().ref('public-blogs/'+this.userId +'/'+this.blogId);
     blogDetailsRef.on('value', function(snapshot) {
        detailsComponentObj.blogContent = snapshot.val();
         detailsComponentObj.showPreLoader = false;
     })
  }

  getComments() {
    this.showCommentsPreLoader = true;
  	 var detailsComponentObj = this;
  	 var user = JSON.parse(localStorage.getItem('loggedInUser'));
     this.user = user;
     var commentsRef = this.firebase.database().ref('/comments/user-'+this.userId +'/blog-'+this.blogId);

  	 commentsRef.on('value', function(snapshot) {
       detailsComponentObj.showCommentsPreLoader = false;
  	 	 detailsComponentObj.comments = [];
  	 	let valueExists = false;
  	 	for(let key in snapshot.val()) {
  	 		 detailsComponentObj.comments.forEach(cmnt => {
            console.log(cmnt);
  	 		 	if(cmnt == {key:key, value:snapshot.val()[key]}) {
  	 		 		valueExists = true;
  	 		 	}
  			})

		 	if(valueExists === false) {
         var userRef = detailsComponentObj.firebase.database().ref('/users/'+snapshot.val()[key].userId);
         userRef.on('value', function(userProfile) {
           var profileSource = userProfile.val().profileImageSrc;
           var name = userProfile.val().firstName+' '+ userProfile.val().lastName;
           detailsComponentObj.comments.push({key:key, name:name, profileImage:profileSource, value:snapshot.val()[key]});

         })
	    	}
  	 	}
  	 })
  }

  changeStatus() {
    this.statusChangeProgress = true;
    var detailsComponentObj = this;

    if(detailsComponentObj.statusString === "Private") {
      detailsComponentObj.makePrivate()
    } else {
      detailsComponentObj.makePublic();
    }
  }

  makePublic() {
    var blogDetailsPublicRef = this.firebase.database().ref('public-blogs/'+this.userId +'/'+this.blogId);
    var blogDetailsPrivateRef = this.firebase.database().ref('users/'+this.userId +'/blogs/'+this.blogId);
    var blogDetailsPrivateIsPublicRef = this.firebase.database().ref('users/'+this.userId +'/blogs/'+this.blogId+'/isPublic');
    var blogDetailsCompObject = this;

    blogDetailsPrivateRef.once('value', function(snapshot) {
      console.log(snapshot.val());
      var blogData = snapshot.val();
      blogData.isPublic = true;
       blogDetailsPrivateIsPublicRef.set(true).then(success => {
               blogDetailsPublicRef.set(blogData).then(success => {
                blogDetailsCompObject.statusString = 'Private';
                blogDetailsCompObject.statusChangeProgress = false;
        }).catch(error => {
          this.errorMessage = error.message;
        })
      }).catch(error => {
        this.errorMessage = error.message;
      })

    })
   }

  makePrivate() {
    var blogDetailsPublicRef = this.firebase.database().ref('public-blogs/'+this.userId +'/'+this.blogId);
    var blogDetailsPrivateRef = this.firebase.database().ref('users/'+this.userId +'/blogs/'+this.blogId+'/isPublic');
    var blogDetailsCompObject = this;
    blogDetailsPublicRef.set(null).then((success) => {
      blogDetailsPrivateRef.set(false).then(success => {
         blogDetailsCompObject.statusString = 'Public';
         blogDetailsCompObject.statusChangeProgress = false;
      }).catch(error => {
        this.errorMessage = error.message;
      })
    }).catch(error => {
      this.errorMessage = error.message;
    })
   }

  addComment({value, valid}:{value:Comment, valid:true}) {
  	var user = JSON.parse(localStorage.getItem('loggedInUser'));
  	var blog =  {blog:value};
    blog.blog.userId = user.auth.uid;
    blog.blog.name = user.auth.email;
  	var blogDetailsCompObject = this;
  	 this.firebase.database().ref('/comments/user-'+this.userId+'/blog-'+this.blogId).push(blog.blog).then((success) => {
         }).catch((error) => {
           this.errorMessage = error.message;
         })
  }

  removeBlog() {
    if(this.statusString === "Private") {
        this.removeBlogIfPublic();
    } else {
       this.removeBlogIfPrivate();
    }
  }

  removeBlogIfPrivate() {
     this.firebase.database().ref('users/'+this.userId+'/blogs/'+this.blogId+'/removed')
     .set(true).then(success => {
       this.router.navigate(['/blog']);
     }).catch(error => {
       this.errorMessage = error.message;
     })
  }

  removeBlogIfPublic() {
     var blogDetailsPublicRef = this.firebase.database().ref('public-blogs/'+this.userId +'/'+this.blogId);
   blogDetailsPublicRef.set(null).then(success => {
       this.removeBlogIfPrivate();
     }).catch(error => {
       this.errorMessage = error.message;
     })
  }

  edit() {
   if(this.editMode == true) {
      this.showProgress = true;
      if(this.editBlog.isPublic === true) {
        this.editBlogIfPublic();
    } else {
       this.editBlogIfPrivate();
     }
    } else {
      this.editBlog = this.blogContent;
      this.editMode = true;
      this.showProgress = false;
    }
  }

  editBlogIfPublic() {
     var blogDetailsPublicRef = this.firebase.database().ref('public-blogs/'+this.userId +'/'+this.blogId);
     blogDetailsPublicRef.set(this.editBlog).then(success => {
         this.editBlogIfPrivate();
       }).catch(error => {
         this.errorMessage = error.message;
         this.showProgress = false;
       })
  }

  editBlogIfPrivate() {
    var thisObject = this;
     var privateBlogRef = this.firebase.database().ref('users/'+this.userId+'/blogs/'+this.blogId);
     privateBlogRef.set(this.editBlog).then(function(snapshot) {
       thisObject.editMode = false;
     }).catch(error => {
       this.errorMessageOnEdit = error.message;
       this.showProgress = false;
     })

  }
}
