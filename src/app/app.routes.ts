import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'articles',
    pathMatch: 'full',
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('./features').then((m) => m.ArticleListComponent),
  },
  {
    path: 'articles/new',
    loadComponent: () =>
      import('./features').then((m) => m.ArticleEditorComponent),
  },
  {
    path: 'articles/:id/edit',
    loadComponent: () =>
      import('./features').then((m) => m.ArticleEditorComponent),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features').then((m) => m.ArticleViewerComponent),
  },
  {
    path: '**',
    redirectTo: 'articles',
  },
];
