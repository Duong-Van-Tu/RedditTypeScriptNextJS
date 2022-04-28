import { User } from '../entities/User';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import bcrypt from 'bcryptjs';
import { UserMutationResponse } from '../types/UserMutationResponse';
import { RegisterInput } from '../types/RegisterInput';
import { validateResgisterInput } from '../utils/validateResgisterInput';
import { LoginInput } from '../types/LoginInput';
import { Context } from '../types/Context';
import { COOKIE_NAME } from '../constants';
@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse, { nullable: true })
  async register(
    @Arg('registerInput') registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const validateRegisterInput = validateResgisterInput(registerInput);
    if (validateRegisterInput) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInput,
      };
    }
    try {
      const { username, email, password } = registerInput;
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });
      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: 'Duplicated username or email',
          error: [
            {
              field: existingUser.username === username ? 'username' : 'email',
              message: `${
                existingUser.username === username ? 'username' : 'email'
              } already taken`,
            },
          ],
        };
      }
      const hashedPassword = await bcrypt.hashSync(password, 10);
      let newUser = User.create({
        username,
        password: hashedPassword,
        email,
      });

      await newUser.save();
      return {
        code: 200,
        success: true,
        message: 'User registered successfully',
        user: newUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse, { nullable: true })
  async login(
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput;
      const existingUser = await User.findOne({
        where: usernameOrEmail.includes('@')
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail },
      });
      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: 'Login failed',
          error: [
            {
              field: 'Username or email',
              message: 'Username or email incorrect ',
            },
          ],
        };
      }

      const passwordValid = await bcrypt.compareSync(
        password,
        existingUser.password
      );
      if (!passwordValid) {
        return {
          code: 400,
          success: false,
          message: 'Login failed',
          error: [
            {
              field: 'password',
              message: 'Password is wrong',
            },
          ],
        };
      }
      // create session and return cookie
      req.session.userId = existingUser.id;
      return {
        code: 200,
        success: true,
        message: 'Logined successfully',
        user: existingUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error}`,
      };
    }
  }

  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise<boolean>((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log('DESTROYING SESSION ERROR', error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
