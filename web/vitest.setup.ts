import '@testing-library/jest-dom';

// Basic fetch mock default for unit tests that don't focus on networking
if (!(global as any).fetch) {
  (global as any).fetch = async () => ({ ok: true, json: async () => ({}) }) as any;
}

