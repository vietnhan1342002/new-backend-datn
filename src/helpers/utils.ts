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
