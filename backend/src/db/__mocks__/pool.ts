// Mock automático de Jest para el módulo db/pool
// Jest lo detecta automáticamente al llamar jest.mock('../db/pool')

export const query = jest.fn();

const pool = {
  query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] }),
  on: jest.fn(),
};

export default pool;
