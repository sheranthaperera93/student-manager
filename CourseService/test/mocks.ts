export const mockCourseService = {
  findAll: jest.fn().mockImplementation(() => {
    return [
      { id: 1, name: '', description: '', userId: 1 },
      { id: 2, name: '', description: '', userId: 1 },
    ];
  }),
  findOne: jest.fn().mockImplementation((userId) => {
    return { id: 1, name: '', description: '', userId };
  }),
};
