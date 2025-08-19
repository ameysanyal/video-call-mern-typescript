import { describe, it, expect, vi } from 'vitest';
import { validate } from '../../../src/middlewares/validateSchema.middleware.js';
import { z } from 'zod';

describe('validate middleware', () => {
  // Helper to create mock req, res, next
  const createMocks = (body = {}, params = {}, query = {}) => {
    return {
      req: {
        body,
        params,
        query,
      },
      res: {},
      next: vi.fn(),
    };
  };

  it('should parse and assign valid body and call next', () => {
    const bodySchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const { req, res, next } = createMocks({ name: 'Alice', age: 30 });

    const middleware = validate({ body: bodySchema });

    //Executes the middleware. as any bypasses TS type checks since these aren’t real Express objects.
    middleware(req as any, res as any, next);

    expect(req.body).toEqual({ name: 'Alice', age: 30 });
    expect(next).toHaveBeenCalled();
  });

  it('should call next with error if body validation fails', () => {
    const bodySchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const { req, res, next } = createMocks({
      name: 'Alice',
      age: 'not a number',
    });

    const middleware = validate({ body: bodySchema });

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    const calledWithError = next.mock.calls[0][0];
    // Ensures next was called with an error.
    // Pulls the first argument from the first call to next and checks it’s a ZodError.
    expect(calledWithError).toBeInstanceOf(Error);
    expect(calledWithError.name).toBe('ZodError');
  });

  it('should parse and assign valid params and call next', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { req, res, next } = createMocks({}, { id: '550e8400-e29b-41d4-a716-446655440000' });

    const middleware = validate({ params: paramsSchema });

    middleware(req as any, res as any, next);

    expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(next).toHaveBeenCalled();
  });

  it('should call next with error if params validation fails', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { req, res, next } = createMocks({}, { id: 'invalid-uuid' });

    const middleware = validate({ params: paramsSchema });

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    const calledWithError = next.mock.calls[0][0];
    expect(calledWithError).toBeInstanceOf(Error);
    expect(calledWithError.name).toBe('ZodError');
  });

  it('should parse and assign valid query and call next', () => {
    const querySchema = z.object({
      search: z.string().optional(),
      limit: z.string().transform((val) => parseInt(val, 10)),
    });

    const { req, res, next } = createMocks({}, {}, { search: 'term', limit: '10' });

    const middleware = validate({ query: querySchema });

    middleware(req as any, res as any, next);

    expect(req.query).toEqual({ search: 'term', limit: 10 });
    expect(next).toHaveBeenCalled();
  });

  it('should call next with error if query validation fails', () => {
    const querySchema = z.object({
      limit: z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      }),
    });

    const { req, res, next } = createMocks({}, {}, { limit: 'not-a-number' });

    const middleware = validate({ query: querySchema });

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    const calledWithError = next.mock.calls[0][0];
    expect(calledWithError).toBeInstanceOf(Error);
  });

  it('should call next without schemas', () => {
    const { req, res, next } = createMocks();

    const middleware = validate({});

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
});
