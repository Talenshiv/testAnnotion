import { effect, inject, Injectable, signal } from '@angular/core';

import { Article } from '../models';
import { StorageService } from './storage.service';

const ARTICLES_KEY = 'articles';

/** Управляет коллекцией статей. Изменения автоматически сохраняются в localStorage. */
@Injectable({providedIn: 'root'})
export class ArticleService {
  private _storage = inject(StorageService);

  private _articles = signal<Article[]>(
    this._storage.get<Article[]>(ARTICLES_KEY) ?? [],
  );

  /** Изолируем статьи */
  get articles(): Article[] {
    return this._articles()
  }

  constructor() {
    // Автоматически записываем состояние в localStorage при каждом изменении сигнала.
    effect(() => this._storage.set(ARTICLES_KEY, this._articles()));
  }

  /** Ищет статью по id, возвращает `undefined` если не найдена. */
  getById(id: string): Article | undefined {
    return this._articles().find((a) => a.id === id);
  }

  /** Создаёт статью, добавляет в список и возвращает её. */
  create(title: string, content: string): Article {
    const now = new Date().toISOString();
    const article: Article = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content,
      createdAt: now,
      updatedAt: now,
    };
    this._articles.update((list) => [...list, article]);
    return article;
  }

  /** Обновляет заголовок и содержимое статьи по id. */
  update(id: string, title: string, content: string): void {
    this._articles.update((list) =>
      list.map((a) =>
        a.id === id
          ? {...a, title: title.trim(), content, updatedAt: new Date().toISOString()}
          : a,
      ),
    );
  }

  /** Удаляет статью по id. */
  delete(id: string): void {
    this._articles.update((list) => list.filter((a) => a.id !== id));
  }
}
