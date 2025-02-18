import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { PaginatedUsers } from './models/paginated-users.model';
import { Response } from './models/response.model';
import { UpdateUserPayload, User } from 'src/entities/user.entity';
import { BulkInsertDTO } from './models/bulk-insert-dto-model';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query((returns) => PaginatedUsers)
  async getUsers(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedUsers> {
    return this.userService.findAll({ skip, take });
  }

  @Query((returns) => User)
  async getUser(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<User|null> {
    return this.userService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: number;
  }): Promise<User|null> {
    return this.userService.findById(reference.id);
  }

  @Mutation((returns) => Response)
  async updateUser(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args({ name: 'data', type: () => UpdateUserPayload })
    updateUserInput: UpdateUserPayload,
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
    const resp =  await this.userService.delete(id);
    let response: Response = {
      message: resp,
      data: { deleted: true },
    };
    return response;
  }

  @Mutation((returns) => Response)
  async bulkCreate(
    @Args({ name: 'data', type: () => [BulkInsertDTO] }) data: [BulkInsertDTO],
  ): Promise<Response> {
    const resp =  await this.userService.createBulk(data);
    let response: Response = {
      message: resp,
      data: { bulkCreated: true },
    };
    return response;
  }
}
