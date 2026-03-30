import { computed, effect, inject, Injectable, signal } from '@angular/core';

import { Annotation } from '../models';
import { StorageService } from './storage.service';

const ANNOTATIONS_KEY = 'annotations';

/** Управляет коллекцией аннотаций. Изменения автоматически сохраняются в localStorage. */
@Injectable({providedIn: 'root'})
export class AnnotationService {
  private _storage = inject(StorageService);

  private _annotations = signal<Annotation[]>(
    this._storage.get<Annotation[]>(ANNOTATIONS_KEY) ?? [],
  );

  /** Изолируем аннотации */
  annotations = computed<Annotation[]>(() => this._annotations());

  constructor() {
    // Автоматически записываем состояние в localStorage при каждом изменении сигнала.
    effect(() => this._storage.set(ANNOTATIONS_KEY, this._annotations()));
  }

  /** Создаёт аннотацию с автогенерированным id и возвращает её. */
  create(data: Omit<Annotation, 'id'>): Annotation {
    const annotation: Annotation = {...data, id: crypto.randomUUID()};
    this._annotations.update((list) => [...list, annotation]);
    return annotation;
  }

  /** Удаляет аннотацию по id. */
  delete(id: string): void {
    this._annotations.update((list) => list.filter((a) => a.id !== id));
  }

  /** Удаляет все аннотации статьи — вызывается при удалении самой статьи. */
  deleteByArticleId(articleId: string): void {
    this._annotations.update((list) => list.filter((a) => a.articleId !== articleId));
  }
}
