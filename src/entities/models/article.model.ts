/** Статья, созданная пользователем и хранящаяся в localStorage. */
export interface Article {
  /** Уникальный идентификатор (UUID v4). */
  id: string;
  /** Короткий заголовок статьи. */
  title: string;
  /** Тело статьи в виде обычного текста (без HTML и разметки). */
  content: string;
  /** Дата создания статьи в формате ISO 8601. */
  createdAt: string;
  /** Дата последнего редактирования в формате ISO 8601. */
  updatedAt: string;
}
