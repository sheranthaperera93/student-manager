import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';

const usersServiceMock = {
  findById: jest.fn((id: number): User => {
    return {
      id,
      name: 'Mocked User',
      date_of_birth: new Date(),
      email: 'example@example.com',
    };
  }),
};

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: usersServiceMock },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should query a user by its id', async () => {
    const result = await resolver.getUser(1);
    expect(result.id).toEqual(1);
  });

  it('should resolve a reference', async () => {
    const result = await resolver.resolveReference({ __typename: 'User', id: 1 });
    expect(result.id).toEqual(1);
  });
});
