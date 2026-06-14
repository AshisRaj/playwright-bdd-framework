export const contactsListSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      userId: { type: ['number', 'string'] },
      name: { type: 'string' },
      email: { type: 'string' },
    },
    required: ['id', 'userId', 'name', 'email'],
    additionalProperties: true,
  },
} as const;
