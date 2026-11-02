import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { resolverJwtSecret } from './jwtSecret.js';

describe('resolverJwtSecret', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('usa JWT_SECRET cuando está definido, también en producción', () => {
    expect(resolverJwtSecret({ JWT_SECRET: 'definido', NODE_ENV: 'production' })).toBe('definido');
  });

  it('en producción sin JWT_SECRET no arranca y explica por qué', () => {
    expect(() => resolverJwtSecret({ NODE_ENV: 'production' })).toThrow('JWT_SECRET es obligatorio');
  });

  it('en desarrollo sin JWT_SECRET genera un secreto efímero distinto en cada llamada', () => {
    const a = resolverJwtSecret({});
    const b = resolverJwtSecret({});
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);
  });
});
