import { Component, computed, HostListener, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Annotation, AnnotationService, Article, ArticleService } from '@entities';
import { AnnotationPopupComponent } from '../components/annotation-popup';
import { AnnotationTooltipComponent } from '../components/annotation-tooltip';
import { AnnotationsSidebarComponent } from '../components/annotations-sidebar';
import { AnnotationHoverDirective, TextSelectionDirective } from '../directives';
import { PendingSelection, TooltipState } from '../models';
import { buildTextSegments, TextSegment } from '../utils';

/** Страница просмотра статьи: рендер аннотированных сегментов, создание/удаление аннотаций, тултип. */
@Component({
  selector: 'app-article-viewer',
  imports: [AnnotationPopupComponent, AnnotationsSidebarComponent, AnnotationTooltipComponent, TextSelectionDirective, AnnotationHoverDirective],
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.scss',
})
export class ArticleViewerComponent {
  private _router = inject(Router);
  private _articleService = inject(ArticleService);
  private _annotationService = inject(AnnotationService);

  /** Привязывается из параметра маршрута `:id`. */
  id = input.required<string>();
  /** Статья соответствующая id. */
  article = computed<Article | undefined>(() =>
    this._articleService.articles().find((a) => a.id === this.id()),
  );
  /** Список аннотаций соответствующее id статьи. */
  annotations = computed<Annotation[]>(() =>
    this._annotationService.annotations().filter((a) => a.articleId === this.id()),
  );
  /** Сегменты текста для рендеринга — пересчитываются при изменении статьи или аннотаций. */
  segments = computed<TextSegment[]>(() => {
    const article = this.article();
    return article ? buildTextSegments(article.content, this.annotations()) : [];
  });
  /** Тултип. */
  tooltip = signal<TooltipState | null>(null);
  /** Временное выделение перед подтверждением. */
  pendingSelection = signal<PendingSelection | null>(null);
  /** Цвет текущего выделения. */
  pendingColor = signal<string>('#e74c3c');
  /** Заметка к выделению. */
  pendingNote = signal<string>('');
  /** Ошибка при создании выделения. */
  selectionError = signal<string>('');

  /** @inheritDoc */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.pendingSelection()) {
      this.cancelAnnotation();
    }
  }

  /** Открывает попап создания аннотации по результату из TextSelectionDirective. */
  onSelectionMade(sel: PendingSelection): void {
    if (this.pendingSelection()) return;
    this.selectionError.set('');
    this.pendingColor.set('#e74c3c');
    this.pendingNote.set('');
    this.pendingSelection.set(sel);
  }

  /** Возвращает rgba-фон с opacity 0.15 для подсветки аннотированного фрагмента. */
  getAnnotationBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  }

  /** Валидирует и сохраняет аннотацию. Показывает ошибку при пустой заметке или пересечении диапазонов. */
  saveAnnotation(): void {
    const selection = this.pendingSelection();
    if (!selection) return;

    const note = this.pendingNote().trim();
    if (!note) {
      this.selectionError.set('Добавьте заметку для аннотации.');
      return;
    }

    const overlaps = this.annotations().some(
      (ann) => selection.startOffset < ann.endOffset && selection.endOffset > ann.startOffset,
    );
    if (overlaps) {
      this.selectionError.set('Выделение пересекается с существующей аннотацией.');
      return;
    }

    this._annotationService.create({
      articleId: this.id(),
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      color: this.pendingColor(),
      note,
      selectedText: selection.selectedText,
    });

    this.pendingSelection.set(null);
    window.getSelection()?.removeAllRanges();
  }

  /** Отменяет создание аннотации и закрывает попап. */
  cancelAnnotation(): void {
    this.pendingSelection.set(null);
    window.getSelection()?.removeAllRanges();
  }

  /** Удаляет аннотацию по id. */
  deleteAnnotation(id: string): void {
    this._annotationService.delete(id);
  }

  /** Переходит на страницу редактирования текущей статьи. */
  navigateToEdit(): void {
    this._router.navigate(['/articles', this.id(), 'edit']);
  }

  /** Возвращается к списку статей. */
  goBack(): void {
    this._router.navigate(['/articles']);
  }

  /** Форматирует ISO-дату в дд.мм.гггг. */
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  }
}
