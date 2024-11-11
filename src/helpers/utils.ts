import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
  return await model.exists(options); // Trả về true nếu đúng, false nếu không
};

export const comparePasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  return await bcrypt.compare(plainPassword, hashPassword); // Trả về true nếu đúng, false nếu không
};

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

// utils.ts (hoặc file helper của bạn)
export const preparePaginationFilter = async (
  model: any, // model Mongoose
  filter: any, // filter truy vấn
  current: number, // trang hiện tại
  pageSize: number, // số bản ghi trên một trang
) => {
  // Loại bỏ current và pageSize khỏi filter
  delete filter.current;
  delete filter.pageSize;

  // Đếm tổng số bản ghi
  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / pageSize); // Tính số trang

  // Kiểm tra phân trang hợp lệ (nếu cần)
  validatePagination(current, totalPages);

  return { totalItems, totalPages };
};
