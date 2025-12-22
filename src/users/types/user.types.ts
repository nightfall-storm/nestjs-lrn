import type { Pagination } from "src/common/types/pagination.types";

export type FindAllUsersResponse = {
  data: User[];
  pagination: Pagination;
};

export type User = {
  id: number;
  email: string;
  createdAt: Date;
};
