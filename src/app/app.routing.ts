import {RouterModule, Routes} from '@angular/router';
import { RegistrationComponent } from './Registration/registration.component';
import { LoginComponent } from './Login/login.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { GalleryComponent } from './gallery/gallery.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
/**
 * Define Routes
 */

const appRoutes: Routes = [
    {
        path : '',
        redirectTo : '/login',
        pathMatch : 'full'
    },

    {
        path : 'register',
        component : RegistrationComponent
    },

    {
        path : 'login',
        component : LoginComponent
    },

    // {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // },
    {
        path : 'about',
        component : AboutComponent
    },
    // {
    //     path : 'gallery',
    //     component : GalleryComponent
    // },
      {
        path : 'blog',
        component : BlogComponent
    },
    {
        path:'blog-details/:userId/:blogId',
        component:BlogDetailsComponent
    },
    {
        path:'**',
        component: PageNotFoundComponent
    }
];

export const routing = RouterModule.forRoot(appRoutes, {useHash : true});