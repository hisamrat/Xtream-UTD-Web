export const PRODUCTS_PER_PAGE = 12;

/** A window of at most `maxVisible` page numbers centred on `currentPage`. */
export function getVisiblePageNumbers(currentPage: number, pageCount: number, maxVisible: number): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  let start = currentPage - Math.floor(maxVisible / 2);
  let end = start + maxVisible - 1;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > pageCount) {
    end = pageCount;
    start = Math.max(1, pageCount - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function getPageCount(total: number, perPage = PRODUCTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}
