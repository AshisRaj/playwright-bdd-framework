export const contactSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['id', 'userId', 'name', 'email'],
  additionalProperties: true,
} as const;
