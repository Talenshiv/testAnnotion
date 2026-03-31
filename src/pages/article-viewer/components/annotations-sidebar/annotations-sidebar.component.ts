import { Component, input, output } from '@angular/core';
import { Annotation } from '@entities';

/** Боковая панель со списком аннотаций текущей статьи. */
@Component({
  selector: 'app-annotations-sidebar',
  templateUrl: './annotations-sidebar.component.html',
  styleUrl: './annotations-sidebar.component.scss',
})
export class AnnotationsSidebarComponent {
  /** Список аннотаций текущей статьи для отображения в панели. */
  annotations = input.required<Annotation[]>();

  /** Эмитируется при удалении аннотации; передаёт её идентификатор. */
  deleted = output<string>();
}
