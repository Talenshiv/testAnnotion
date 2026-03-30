/** Результат успешного чтения выделения текста внутри контент-контейнера. */
export interface SelectionResult {
  start: number;
  end: number;
  selectedText: string;
  rect: DOMRect;
}

/**
 * Вычисляет абсолютную позицию символа через атрибут `data-start` на спанах контейнера.
 * Устойчив к пробельным текстовым узлам, которые Angular вставляет между `@for`/`@if`.
 */
export function getAbsoluteOffset(
  container: HTMLElement,
  targetNode: Node,
  targetOffset: number,
): number {
  // Находим ближайший элемент-предок (или сам узел), несущий атрибут data-start.
  let el: Element | null =
    targetNode.nodeType === Node.TEXT_NODE
      ? (targetNode as Text).parentElement
      : (targetNode as Element);

  while (el && el !== container) {
    const dataStart = el.getAttribute('data-start');
    if (dataStart !== null) {
      return parseInt(dataStart, 10) + targetOffset;
    }
    el = el.parentElement;
  }

  // Резервный путь: тройной клик выделяет весь контейнер, Range.startContainer
  // становится самим container с targetOffset = индекс дочернего элемента.
  if (targetNode.nodeType === Node.ELEMENT_NODE) {
    const children = Array.from((targetNode as Element).children);
    let abs = 0;
    for (let i = 0; i < Math.min(targetOffset, children.length); i++) {
      abs += (children[i].textContent ?? '').length;
    }
    return abs;
  }

  return 0;
}

/**
 * Возвращает позиции выделения относительно контейнера через Range API.
 * Возвращает `null`, если выделение пустое или вне контейнера.
 */
export function getSelectionOffsets(container: HTMLElement): SelectionResult | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const selectedText = selection.toString();
  if (!selectedText.trim()) return null;

  const start = getAbsoluteOffset(container, range.startContainer, range.startOffset);
  const end = getAbsoluteOffset(container, range.endContainer, range.endOffset);
  if (start === end) return null;

  const rect = range.getBoundingClientRect();
  return start <= end
    ? { start, end, selectedText, rect }
    : { start: end, end: start, selectedText, rect };
}
