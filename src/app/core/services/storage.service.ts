import { Injectable } from '@angular/core';

/** Обёртка над `localStorage` с типизированной JSON-сериализацией. */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Читает и десериализует значение по ключу; возвращает `null` при отсутствии или ошибке парсинга. */
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Сериализует и сохраняет значение по ключу. */
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /** Удаляет запись по ключу. */
  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
