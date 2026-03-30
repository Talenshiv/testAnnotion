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
      import('../pages').then((m) => m.ArticleListComponent),
  },
  {
    path: 'articles/new',
    loadComponent: () =>
      import('../pages').then((m) => m.ArticleEditorComponent),
  },
  {
    path: 'articles/:id/edit',
    loadComponent: () =>
      import('../pages').then((m) => m.ArticleEditorComponent),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('../pages').then((m) => m.ArticleViewerComponent),
  },
  {
    path: '**',
    redirectTo: 'articles',
  },
];
