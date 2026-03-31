import { Component, input } from '@angular/core';
import { TooltipState } from '../../models';

/** Всплывающая подсказка с заметкой над аннотированным фрагментом. */
@Component({
  selector: 'app-annotation-tooltip',
  templateUrl: './annotation-tooltip.component.html',
  styleUrl: './annotation-tooltip.component.scss',
})
export class AnnotationTooltipComponent {
  /** Состояние тултипа: позиция на экране и текст отображаемой заметки. */
  tooltip = input.required<TooltipState>();
}
