import { Annotation } from '@entities';

/** Фрагмент текста статьи — аннотированный или обычный. */
export interface TextSegment {
  text: string;
  /** Начало фрагмента в строке контента; используется как `data-start` в шаблоне. */
  startOffset: number;
  annotation?: Annotation;
}

/**
 * Разбивает текст статьи на массив сегментов для рендеринга.
 * При пересечении диапазонов приоритет у аннотации с меньшим startOffset.
 */
export function buildTextSegments(content: string, annotations: Annotation[]): TextSegment[] {
  if (!content) return [];
  if (!annotations.length) return [{ text: content, startOffset: 0 }];

  const valid = annotations
    .filter(
      (a) => a.startOffset >= 0 && a.endOffset > a.startOffset && a.endOffset <= content.length,
    )
    .sort((a, b) => a.startOffset - b.startOffset);

  // Убираем перекрывающиеся аннотации — приоритет у той, что начинается раньше.
  const resolved: Annotation[] = [];
  let lastEnd = 0;
  for (const ann of valid) {
    if (ann.startOffset >= lastEnd) {
      resolved.push(ann);
      lastEnd = ann.endOffset;
    }
  }

  const segments: TextSegment[] = [];
  let pos = 0;

  for (const ann of resolved) {
    if (pos < ann.startOffset) {
      segments.push({ text: content.slice(pos, ann.startOffset), startOffset: pos });
    }
    segments.push({
      text: content.slice(ann.startOffset, ann.endOffset),
      startOffset: ann.startOffset,
      annotation: ann,
    });
    pos = ann.endOffset;
  }

  if (pos < content.length) {
    segments.push({ text: content.slice(pos), startOffset: pos });
  }

  return segments;
}
