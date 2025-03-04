import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { PaginatedUsers } from './models/paginated-users.model';
import { Response } from './models/response.model';
import { User } from 'src/entities/user.entity';
import { UserInputDTO } from './models/user-input.dto';
import { DateOfBirthRangeInput } from './models/date-of-birth.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query((returns) => PaginatedUsers)
  async getUsers(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('name', {type: () => String, nullable: true}) name?: string,
    @Args('email', {type: () => String, nullable: true}) email?: string,
    @Args('dateOfBirth', { type: () => DateOfBirthRangeInput, nullable: true })
    dateOfBirth?: DateOfBirthRangeInput,
  ): Promise<PaginatedUsers> {
    return this.userService.findAll({ skip, take, name, email, dateOfBirth });
  }

  @Query((returns) => User)
  async getUser(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Mutation((returns) => Response)
  async updateUser(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args({ name: 'data', type: () => UserInputDTO })
    updateUserInput: UserInputDTO,
  ): Promise<Response> {
    const resp = await this.userService.update(id, updateUserInput);
    let response: Response = {
      message: resp,
      data: { updated: true },
    };
    return response;
  }

  @Mutation((returns) => Response)
  async deleteUser(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<Response> {
    const resp = await this.userService.delete(id);
    let response: Response = {
      message: resp,
      data: { deleted: true },
    };
    return response;
  }

  @Mutation((returns) => Response)
  async bulkCreate(
    @Args({ name: 'data', type: () => [UserInputDTO] }) data: [UserInputDTO],
  ): Promise<Response> {
    const resp = await this.userService.createBulk(data);
    let response: Response = {
      message: resp,
      data: { bulkCreated: true },
    };
    return response;
  }

  @Mutation((returns) => Response)
  async exportUsers(
    @Args({ name: 'age', type: () => String }) params: string,
  ): Promise<Response> {
    const resp = await this.userService.exportUsers(params);
    let response: Response = {
      message: resp,
      data: { exported: true },
    };
    return response;
  }
}
