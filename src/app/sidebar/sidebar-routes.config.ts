import {  RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
    { path: '/', title: 'Dashboard',  icon: 'dashboard', class: 'active' },
    { path: '/certificate', title: 'Certificate',  icon:'library_books', class: '' },
    { path: '/teachers', title: 'Profile',  icon:'person', class: 'active' }
];
