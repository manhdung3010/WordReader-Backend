export class ResponseData<D> {
  data: D | D[];
  statusNumber: number;
  message: string;
  totalElements?: number;
  totalPages?: number;
  size?: number;

  constructor(
    data: D | D[],
    statusCode: number,
    message: string,
    totalElements?: number,
    totalPages?: number,
    size?: number,
  ) {
    this.data = data;
    this.statusNumber = statusCode;
    this.message = message;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.size = size;
    return this;
  }
}
