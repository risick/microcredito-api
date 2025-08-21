import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "@/config/database";
import { config } from "@/config/environment";
import type { RegisterInput, LoginInput } from "@/schemas/auth";
import type { JwtTokenPayload } from "@/types";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(payload: {
    userId: string;
    email: string;
    role: string;
  }):  Promise<string>  {
    const tokenPayload: JwtTokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    if (!config.jwtSecret) {
      throw new Error("JWT_SECRET não está configurado.");
    }
    return jwt.sign(tokenPayload, String(config.jwtSecret), {
      expiresIn: config.jwtExpiresIn,
    } as SignOptions);
  }

  static async register(data: RegisterInput) {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Usuário já existe com este email");
    }

    // Hash da senha
    const hashedPassword = await this.hashPassword(data.password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Gerar token
    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  static async login(data: LoginInput) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      throw new Error("Conta desativada");
    }

    // Verificar senha
    const isPasswordValid = await this.comparePassword(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    // Gerar token
    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }
}
