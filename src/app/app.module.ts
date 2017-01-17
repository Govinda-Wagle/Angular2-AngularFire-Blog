import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageModule } from 'angular-2-local-storage';

// AngularFire
import config from './config/firebase.config';

import {FIREBASE_PROVIDERS,FirebaseConfig,AngularFireModule} from 'angularfire2';

// Routes
import {RouterModule, Router, ActivatedRoute} from '@angular/router';
import {routing} from './app.routing';

// angular material
import 'materialize-css';
import {MaterializeDirective, MaterializeAction, MaterializeModule} from 'angular2-materialize';

// import 'hammerjs';

// Components
import { AppComponent } from './app.component';
import { RegistrationComponent } from './Registration/registration.component';
import { LoginComponent } from './Login/login.component';
import { GalleryComponent } from './gallery/gallery.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    MaterializeDirective,
    RegistrationComponent,
    LoginComponent,
    GalleryComponent,
    DashboardComponent,
    AboutComponent,
    BlogComponent,
    BlogDetailsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(config),
    LocalStorageModule.withConfig({
      prefix:'gowin-blog',
      storageType:'localStorage'
    }),
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
