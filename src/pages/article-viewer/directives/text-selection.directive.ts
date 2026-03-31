import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

import { PendingSelection } from '../models';
import { getSelectionOffsets } from '../utils';

/** Ширина попапа аннотации в пикселях — используется для расчёта ограничений позиции. */
const POPUP_WIDTH = 300;
/** Минимальный отступ попапа от края viewport в пикселях. */
const POPUP_MARGIN = 8;

/** Читает текстовое выделение внутри хост-элемента и эмитит позицию попапа. */
@Directive({
  selector: '[appTextSelection]',
})
export class TextSelectionDirective {
  /** Ссылка на хост-элемент — передаётся в Range API для вычисления смещений. */
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Эмитит данные выделения с координатами для позиционирования попапа. */
  selectionMade = output<PendingSelection>();

  /** Обрабатывает завершение выделения мышью и вычисляет позицию попапа. */
  @HostListener('mouseup')
  onMouseUp(): void {
    const result = getSelectionOffsets(this._el.nativeElement);
    if (!result) return;

    const rawX = result.rect.left + result.rect.width / 2;
    const x = Math.max(
      POPUP_WIDTH / 2 + POPUP_MARGIN,
      Math.min(rawX, window.innerWidth - POPUP_WIDTH / 2 - POPUP_MARGIN),
    );

    this.selectionMade.emit({
      startOffset: result.start,
      endOffset: result.end,
      selectedText: result.selectedText,
      x,
      y: result.rect.bottom + 12,
    });
  }
}
