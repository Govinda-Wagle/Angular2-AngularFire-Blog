import { Component, OnInit, Inject } from '@angular/core';
import { Blog } from './blog.interface';
import { AngularFire, FirebaseAuth, FirebaseApp } from 'angularfire2';
import { Router } from'@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  // styleUrls: ['./blog.component.css'],
 styles: [`
    blockquote {font-family: GillSans, Calibri, Trebuchet, sans-serif !important}
   .blog blockquote {cursor: pointer; line-height:9px;}
    .even { border-left: 5px solid #80cbc4 }
    .odd { order-left: 5px solid #ee6e73; }
    .evenStatus { color:#80cbc4 }
    .oddStatus { color:  #ee6e73; }
     .status { font-family: GillSans, Calibri, Trebuchet, sans-serif !important; }
    label span.public-private-input {
    font-family: GillSans, Calibri, Trebuchet, sans-serif !important;}
    .activeBlog {border-bottom: 2px solid #ee6e73 !important; font-weight:bold !important;}
    `]
})
export class BlogComponent implements OnInit {

  blog:Blog = {
    title:'',
    subtitle:'',
    content:'',
    isPublic:true
  }
  searchString:string;
  toggleAddButton:boolean = false;
  visibility:string = 'add';

  showPreLoader:boolean = false;
  firebase:any;
  user:any = null;
  publicBlogsNotFound:boolean = false;
  privateBlogs:Array<any> = [];
  publicBlogs:Array<any> = [];
  publicBlogsTemp:Array<any> = [];
  showPublicBlogs:boolean = false;
  showPrivateBlogs:boolean = false;
  publicBlogBorderBottom:string;
  privateBlogBorderBottom:string;
  constructor(private af:AngularFire,  private fAuth:FirebaseAuth, private router:Router, private localStorage:LocalStorageService, @Inject(FirebaseApp) firebase:any) { 
    this.firebase = firebase;
    this.privateBlogBorderBottom = 'activeBlog';
    var user = this.getUser();
    var userAsObject = JSON.parse(user);
    this.user = userAsObject;

    if(userAsObject != null) {
      this.getPrivateBlogs();
      this.getPublicBlogs();
    } else {
      this.getPublicBlogs();
    }
  }

  ngOnInit() {

  }

  getUser() {
    return localStorage.getItem('loggedInUser');
  }

  getPrivateBlogs() {
    var activeBlog = localStorage.getItem('activeBlogHeading');
    if(activeBlog === 'private') {
      this.showPrivateBlogs = true;
      this.showPublicBlogs = false;
      this.privateBlogBorderBottom = 'activeBlog';
      this.publicBlogBorderBottom = '';
    } else {
      this.showPrivateBlogs = false;
      this.showPublicBlogs = true;
      this.privateBlogBorderBottom = '';
      this.publicBlogBorderBottom = 'activeBlog';
    }


    var blogCompObject = this;
    var blogRef = this.af.database.list('users/'+this.user.uid +'/blogs/', {preserveSnapshot:true});
    this.showPreLoader = true;
    blogRef.subscribe(snapshot => {
      this.privateBlogs = [];

      snapshot.forEach(blog => {
        var valueExists = false;
        this.privateBlogs.forEach(data => {
           if(data === {key:blog.key, value:blog.val()}) {
              valueExists = true;
           }
          })
           if(valueExists === false) {
             var status = null;
             if(blog.val().isPublic == true) {
              status = 'Public';
             } else {
               status = 'Private'
             }

             if(blog.val().removed != true) {
               this.privateBlogs.push({userId:blogCompObject.user.uid,key:blog.key, value:blog.val(), status:status});
             }
             
        }
      })
      blogCompObject.showPreLoader = false;
    })
  }

  getPublicBlogs() {
    if(this.user != null && localStorage.getItem('activeBlogHeading') != 'private') {
       this.showPublicBlogs = true;
      this.showPrivateBlogs = false;
    } else if(this.user == null) {
      this.showPublicBlogs = true;
      this.showPrivateBlogs = false;
    }
 
    this.showPreLoader = true;
    var blogCompObject = this;
    var blogRef = this.af.database.list('public-blogs/', {preserveSnapshot:true});
    blogRef.subscribe(snapshot => {
      this.publicBlogs = [];
      snapshot.forEach(blog => {
        var valueExists = false;
        var userKey = blog.key;
        blog.forEach(data => {
          this.publicBlogs.push({userId:userKey, key:data.key, value:data.val()})
        })
      })
      this.publicBlogsTemp = this.publicBlogs;
      if(this.publicBlogs.length == 0) {
        this.publicBlogsNotFound = true;
      }
      blogCompObject.showPreLoader = false;
    })
  }

  add({value, valid}:{value:Blog, valid:true}) {
    var user = JSON.parse(localStorage.getItem('loggedInUser'));
    var blog =  {blog:value};
    var blogCompObject = this;
    if(blog.blog.isPublic != true) {
      blog.blog.isPublic = false;
    }
     this.firebase.database().ref('/users/'+user.uid+'/blogs/').push(blog.blog).then(success => {
      var blogId = '';
         for(let key in success) {
           if(key === 'getKey') {
             blogId = success.key;
             if(value.isPublic === true) {
               blogCompObject.addAsPublicBlog(blogId, user, blog.blog);
             }
           }
          
         }
         }).catch((error) => {
           console.log(error);
         })
  }

  showBlogs(status) {
    if(status === 'private') {
      this.showPrivateBlogs = true;
      this.showPublicBlogs = false;
      this.privateBlogBorderBottom = 'activeBlog';
      this.publicBlogBorderBottom = '';
      localStorage.setItem('activeBlogHeading', 'private');
    } else {
      this.showPrivateBlogs = false;
      this.showPublicBlogs = true;
      this.privateBlogBorderBottom = '';
      localStorage.setItem('activeBlogHeading', 'public');
      this.publicBlogBorderBottom = 'activeBlog';
    }

  }

  search() {
    var publicBlogsTempStore = this.publicBlogs;
    if(this.searchString != "") {
          var searchedBlogTempStorage = [];
          this.publicBlogs.forEach(data => {
          var titleAndSubtitle = data.value.title + ' '+ data.value.subtitle;
          var searchString = this.searchString;
          titleAndSubtitle = titleAndSubtitle.toLowerCase();
          searchString = searchString.toLowerCase();
          if(titleAndSubtitle.indexOf(this.searchString)>=0) {
            searchedBlogTempStorage.push(data);
          }
        })
          this.publicBlogs = searchedBlogTempStorage;
          if(this.publicBlogs.length == 0) {
            this.publicBlogsNotFound = true;
          }
    } else {
      this.publicBlogs = this.publicBlogsTemp;
    }

  }

  toggleAddBlogBtn() {
    console.log(this.toggleAddButton);
    if(this.toggleAddButton === false) {
      this.toggleAddButton = true;
      this.visibility = 'visibility_off';
    } else {
      this.toggleAddButton = false;
      this.visibility = 'add';
    }
    console.log(this.toggleAddButton);
  }

  addAsPublicBlog(blogId, user, blog) {
     this.firebase.database().ref('/public-blogs/'+user.uid+'/'+blogId).set(blog).then(success => {
          console.log('success')
         }).catch((error) => {
           console.log(error);
         })
  }

  navigateToBlogContent(userId, blogId) {
     this.router.navigate(['/blog-details',userId,blogId]);

  }
}