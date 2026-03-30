import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Article } from '@entities';
import { ArticleFormValue } from '../models';

/** Реактивная форма для создания и редактирования статьи. */
@Injectable()
export class ArticleEditorFormService {
   form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get titleControl(): FormControl<string> {
    return this.form.controls.title;
  }

  get contentControl(): FormControl<string> {
    return this.form.controls.content;
  }

  /** Заполняет форму данными существующей статьи. */
  fill(article: Article): void {
    this.form.patchValue({ title: article.title, content: article.content });
  }

  getValue(): ArticleFormValue {
    return this.form.getRawValue();
  }

  /** Помечает все контролы как тронутые, чтобы показать ошибки валидации. */
  markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }
}
