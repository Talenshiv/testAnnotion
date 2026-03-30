import { Component, computed, ElementRef, HostListener, inject, input, signal, viewChild, } from '@angular/core';
import { Router } from '@angular/router';

import { Annotation, Article } from '@entities';
import { AnnotationService, ArticleService } from '@entities';
import { buildTextSegments, getSelectionOffsets, TextSegment } from '@shared';
import { PendingSelection, TooltipState } from '../models';

/** Страница просмотра статьи: рендер аннотированных сегментов, создание/удаление аннотаций, тултип. */
@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.scss',
})
export class ArticleViewerComponent {
  private _router = inject(Router);
  private _articleService = inject(ArticleService);
  private _annotationService = inject(AnnotationService);

  /** Привязывается из параметра маршрута `:id`. */
  id = input.required<string>();
  article = computed<Article | undefined>(() =>
    this._articleService.articles().find((a) => a.id === this.id()),
  );
  /** Список аннотаций соответствующее id статьи */
  annotations = computed<Annotation[]>(() =>
    this._annotationService.annotations().filter((a) => a.articleId === this.id()),
  );
  /** Сегменты текста для рендеринга — пересчитываются при изменении статьи или аннотаций. */
  segments = computed<TextSegment[]>(() => {
    const article = this.article();
    return article ? buildTextSegments(article.content, this.annotations()) : [];
  });
  /** Ссылка на контейнер контента — начало координат для Range API. */
  contentContainer = viewChild<ElementRef<HTMLDivElement>>('contentContainer');
  tooltip = signal<TooltipState | null>(null);
  pendingSelection = signal<PendingSelection | null>(null);
  pendingColor = signal<string>('#e74c3c');
  pendingNote = signal<string>('');
  selectionError = signal<string>('');

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.pendingSelection()) {
      this.cancelAnnotation();
    }
  }

  /** Читает текущее выделение и открывает попап создания аннотации. */
  onTextMouseUp(): void {
    // Не открываем второй попап поверх существующего.
    if (this.pendingSelection()) return;

    const container = this.contentContainer()?.nativeElement;
    if (!container) return;

    const result = getSelectionOffsets(container);
    if (!result) return;

    this.selectionError.set('');
    this.pendingColor.set('#e74c3c');
    this.pendingNote.set('');

    // Прижимаем попап к краям viewport, чтобы он не выходил за пределы.
    const popupWidth = 300;
    const rawX = result.rect.left + result.rect.width / 2;
    const x = Math.max(
      popupWidth / 2 + 8,
      Math.min(rawX, window.innerWidth - popupWidth / 2 - 8),
    );

    this.pendingSelection.set({
      startOffset: result.start,
      endOffset: result.end,
      selectedText: result.selectedText,
      x,
      y: result.rect.bottom + 12,
    });
  }

  /** Показывает тултип с заметкой над аннотированным фрагментом. */
  showTooltip(event: MouseEvent, annotation: Annotation): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltip.set({
      note: annotation.note,
      color: annotation.color,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  /** Скрывает подсказку. */
  hideTooltip(): void {
    this.tooltip.set(null);
  }

  /** Возвращает rgba-фон с opacity 0.15 для подсветки аннотированного фрагмента. */
  getAnnotationBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  }

  onColorChange(event: Event): void {
    this.pendingColor.set((event.target as HTMLInputElement).value);
  }

  onNoteChange(event: Event): void {
    this.pendingNote.set((event.target as HTMLTextAreaElement).value);
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
