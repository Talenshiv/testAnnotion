import { Directive, HostListener, input, output } from '@angular/core';

import { Annotation } from '@entities';
import { TooltipState } from '../models';

/** Вычисляет позицию тултипа по BoundingClientRect хост-элемента и эмитит её. */
@Directive({
  selector: '[appAnnotationHover]',
})
export class AnnotationHoverDirective {
  /** Аннотация, данные которой передаются в тултип при наведении. */
  annotation = input.required<Annotation>();

  /** Эмитит состояние тултипа с координатами при наведении на хост-элемент. */
  tooltipShow = output<TooltipState>();
  /** Эмитит при уходе курсора с хост-элемента — сигнал скрыть тултип. */
  tooltipHide = output<void>();

  /** Вычисляет позицию тултипа над хост-элементом и эмитит её. */
  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ann = this.annotation();
    this.tooltipShow.emit({
      note: ann.note,
      color: ann.color,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  /** Эмитит сигнал скрытия тултипа. */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tooltipHide.emit();
  }
}
