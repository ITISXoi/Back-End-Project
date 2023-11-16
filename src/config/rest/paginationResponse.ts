import { Pagination } from "./pagination";

export class PaginationResponse<T> {
  pagination: Pagination;

  results: Array<T>;

  constructor(results: Array<T>, pagination: Pagination) {
    this.results = results;

    this.pagination = pagination;
  }
}

export class Response<T> {
  results: Array<T>;

  constructor(results: Array<T>, pagination: Pagination) {
    this.results = results;
  }
}
