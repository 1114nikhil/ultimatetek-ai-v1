import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Chat } from './page/chat/chat';

export const routes: Routes = [
     {
        path: '',
        component: Login,
         
    },{
        path:'chat',
        component:Chat
    }
];
