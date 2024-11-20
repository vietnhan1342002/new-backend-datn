import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
const saltOrRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltOrRounds);
  } catch (error) {
    console.log(error);
  }
};

export const isExistHelper = async (
  options: Record<string, any>,
  model: any,
) => {
  return await model.exists(options);
};

export const comparePasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  return await bcrypt.compare(plainPassword, hashPassword);
};

export function formatDate(date: Date | string): string {
  const formattedDate = new Date(date).toISOString().split('T')[0];
  return formattedDate;
}

//----------------------------------------Pagination--------------------------------------------------//
// Hàm phụ trợ để kiểm tra và phân tích các tham số
export const parseQueryParam = (value: string): number => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue) || parsedValue < 1) {
    throw new BadRequestException('Invalid parameter');
  }
  return parsedValue;
};

// Kiểm tra tính hợp lệ của phân trang
export const validatePagination = (current: number, totalPages: number) => {
  if (current > totalPages) {
    throw new NotFoundException('Page not found');
  }
};

// Tính toán giá trị skip
export const calculateSkip = (current: number, pageSize: number): number => {
  return (current - 1) * pageSize;
};

export const preparePaginationFilter = async (
  model: any,
  filter: any,
  current: number,
  pageSize: number,
) => {
  delete filter.current;
  delete filter.pageSize;

  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / pageSize);

  validatePagination(current, totalPages);

  return { totalItems, totalPages };
};

export async function paginateAndPopulate(
  model: any,
  options: {
    filter: Record<string, any>;
    sort: Record<string, any>;
    current: number;
    pageSize: number;
    populateQuery: (query: any) => any;
  },
) {
  const { filter, sort, current, pageSize, populateQuery } = options;

  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / pageSize);

  const skip = (current - 1) * pageSize;
  let query = model.find(filter).limit(pageSize).skip(skip).sort(sort);

  if (populateQuery) {
    query = populateQuery(query);
  }

  const result = await query.exec();
  return { result, totalPages, totalItems };
}
