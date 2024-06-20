export function updatePaginationFilter(filter) {
  if (!filter.page) {
    filter.page = 1;
  }
  if (!filter.pageSize) {
    filter.pageSize = 20;
  }
  filter.startIndex = (filter.page - 1) * filter.pageSize;
  return filter;
}
