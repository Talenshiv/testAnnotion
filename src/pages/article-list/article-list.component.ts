import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Article } from '@entities';
import { AnnotationService, ArticleService } from '@entities';

/** Список статей с кратким превью и счётчиком аннотаций. */
@Component({
  selector: 'app-article-list',
  imports: [RouterLink],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {
  private _router = inject(Router);
  private _articleService = inject(ArticleService);
  private _annotationService = inject(AnnotationService);

  /** Текущий список статей. */
  articles = computed<Article[]>(() => this._articleService.articles());
  /** articleId → количество аннотаций. */
  annotationCountMap = computed(() => {
    const map = new Map<string, number>();
    for (const ann of this._annotationService.annotations()) {
      map.set(ann.articleId, (map.get(ann.articleId) ?? 0) + 1);
    }
    return map;
  });

  /** Кол-во аннотаций */
  getAnnotationCount(articleId: string): number {
    return this.annotationCountMap().get(articleId) ?? 0;
  }

  /** Обрезает текст до 180 символов для превью в карточке. */
  getPreview(content: string): string {
    const trimmed = content.trim();
    return trimmed.length > 180 ? trimmed.slice(0, 180) + '…' : trimmed;
  }

  /** Форматирует ISO-дату в дд.мм.гггг. */
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  }

  /** Переходит на страницу просмотра статьи. */
  viewArticle(id: string): void {
    this._router.navigate(['/articles', id]);
  }

  /** Переходит на страницу редактирования статьи. */
  editArticle(id: string): void {
    this._router.navigate(['/articles', id, 'edit']);
  }

  /** Удаляет статью и все её аннотации после подтверждения. */
  deleteArticle(article: Article): void {
    if (!confirm(`Удалить статью "${article.title}"?`)) return;
    this._annotationService.deleteByArticleId(article.id);
    this._articleService.delete(article.id);
  }
}
