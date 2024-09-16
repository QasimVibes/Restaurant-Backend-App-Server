import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { GraphQLContext, UserRole } from "../types/types";
import { emailForgotPassword } from "../libs/email/emailForgotPassword";
import { GraphQLError } from "graphql";
import { User } from "../../prisma/generated/type-graphql";
import { isAuth } from "../middleware/isAuth";

@Resolver()
export class AuthResolver {
  private secret: string;
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    this.secret = secret;
  }

  @Mutation(() => User)
  async signup(
    @Arg("fullname") fullname: string,
    @Arg("password") password: string,
    @Arg("dateOfBirth") dateOfBirth: Date,
    @Arg("email") email: string,
    @Arg("mobileNumber") mobileNumber: string,
    @Arg("role", { defaultValue: UserRole.CUSTOMER }) role: UserRole,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<User> {
    try {
      if (
        ![fullname, password, dateOfBirth, email, mobileNumber].every(Boolean)
      ) {
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { mobileNumber }],
        },
      });

      if (existingUser) {
        throw new GraphQLError("User already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          fullname,
          password: hashedPassword,
          dateOfBirth,
          email,
          mobileNumber,
          role,
        },
      });

      return user;
    } catch (error: any) {
      throw new GraphQLError(error.message || "Internal server error", {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => String)
  async login(
    @Arg("identifier") identifier: string,
    @Arg("password") password: string,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<string> {
    try {
      if (![identifier, password].every(Boolean)) {
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { mobileNumber: identifier }],
        },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "X-Error": "User not found",
              },
            },
          },
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError("Invalid password", {
          extensions: {
            code: "INVALID_PASSWORD",
            http: {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        {
          expiresIn: "7d",
        }
      );

      return token;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async resetPassword(
    @Arg("password") password: string,
    @Ctx() context: GraphQLContext
  ): Promise<Boolean> {
    try {
      const { prisma, user } = context;
      if (!user || !user.id || !user.role) {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      if (!updatedUser) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }
  @Mutation(() => String)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<string> {
    try {
      if (!email) {
        throw new GraphQLError("Email is required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      if (user.otp && user.otpExpires && user.otpExpires > new Date()) {
        throw new GraphQLError("OTP already sent", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await emailForgotPassword(email, otp);

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          otp: otp,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      if (!updatedUser) {
        throw new GraphQLError("Error sending OTP", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            http: {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      return "OTP sent successfully";
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => String)
  async verifyOtp(
    @Arg("otp") otp: string,
    @Arg("email") email: string,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<string> {
    try {
      if (!otp || !email) {
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      if (user.otp !== otp) {
        throw new GraphQLError("Invalid OTP", {
          extensions: {
            code: "INVALID_OTP",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      if (user.otpExpires && user.otpExpires < new Date()) {
        throw new GraphQLError("OTP expired", {
          extensions: {
            code: "OTP_EXPIRED",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      return "OTP verified successfully";
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => String)
  async changePassword(
    @Arg("otp") otp: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<string> {
    try {
      if (!otp || !email || !password) {
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      if (user.otp !== otp) {
        throw new GraphQLError("Invalid OTP", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      if (user.otpExpires && user.otpExpires < new Date()) {
        throw new GraphQLError("OTP expired", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          otp: null,
          otpExpires: null,
        },
      });

      if (!updatedUser) {
        throw new GraphQLError("Error updating user with new password", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            http: {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      return "Password changed successfully";
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }
}
