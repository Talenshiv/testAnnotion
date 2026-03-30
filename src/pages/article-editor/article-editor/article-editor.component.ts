import { Component, computed, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '@entities';
import { ArticleEditorFormService } from '../services';


/**
 * Страница создания или редактирования статьи.
 */
@Component({
  selector: 'app-article-editor',
  imports: [ReactiveFormsModule],
  providers: [ArticleEditorFormService],
  templateUrl: './article-editor.component.html',
  styleUrl: './article-editor.component.scss',
})
export class ArticleEditorComponent implements OnInit {
  private _router = inject(Router);
  private _articleService = inject(ArticleService);

  /** Привязывается из параметра маршрута `:id` через `withComponentInputBinding()`. */
  id = input<string | undefined>(undefined);
  /** `true` в режиме редактирования, `false` при создании новой статьи. */
  isEditMode = computed(() => !!this.id());

  /** Сервис формы доступен в шаблоне напрямую для привязки к `[formGroup]`. */
  formService = inject(ArticleEditorFormService);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    const article = this._articleService.getById(id);
    if (!article) {
      // Статья не найдена — возвращаемся к списку.
      this._router.navigate(['/articles']);
      return;
    }
    this.formService.fill(article);
  }

  /** Сохраняет статью (создаёт или обновляет) и переходит к ней. При невалидной форме показывает ошибки. */
  save(): void {
    if (!this.formService.form.valid) {
      this.formService.markAllAsTouched();
      return;
    }

    const {title, content} = this.formService.getValue();
    const id = this.id();

    if (id) {
      this._articleService.update(id, title, content);
      this._router.navigate(['/articles']);
    } else {
      const article = this._articleService.create(title, content);
      this._router.navigate(['/articles', article.id]);
    }
  }

  /** Переходит к списку статей без сохранения изменений. */
  cancel(): void {
    this._router.navigate(['/articles']);
  }
}
