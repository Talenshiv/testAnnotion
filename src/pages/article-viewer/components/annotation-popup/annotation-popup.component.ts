import { Component, input, output } from '@angular/core';
import { PendingSelection } from '../../models';

/** Попап создания новой аннотации над выделенным текстом. */
@Component({
  selector: 'app-annotation-popup',
  templateUrl: './annotation-popup.component.html',
  styleUrl: './annotation-popup.component.scss',
})
export class AnnotationPopupComponent {
  /** Данные о текущем выделении: позиции и текст. */
  selection = input.required<PendingSelection>();
  /** Выбранный цвет подсветки аннотации. */
  color = input.required<string>();
  /** Текст заметки к аннотации. */
  note = input.required<string>();
  /** Сообщение об ошибке валидации; пустая строка — ошибок нет. */
  error = input.required<string>();

  /** Эмитируется при подтверждении создания аннотации. */
  save = output<void>();
  /** Эмитируется при отмене создания аннотации. */
  cancel = output<void>();
  /** Эмитируется при изменении цвета; передаёт новое значение. */
  colorChange = output<string>();
  /** Эмитируется при изменении текста заметки; передаёт новое значение. */
  noteChange = output<string>();

  /** Извлекает новое значение цвета из события input и пробрасывает его наверх. */
  onColorChange(event: Event): void {
    this.colorChange.emit((event.target as HTMLInputElement).value);
  }

  /** Извлекает новый текст заметки из события input и пробрасывает его наверх. */
  onNoteChange(event: Event): void {
    this.noteChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
