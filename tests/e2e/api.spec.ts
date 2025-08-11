import { test, expect } from '@playwright/test';

test.describe('API smoke tests', () => {
  test('openapi endpoint is available', async ({ request }) => {
    const res = await request.get('/api/openapi');
    expect(res.ok()).toBeTruthy();
  });

  test('catalog majors returns array', async ({ request }) => {
    const res = await request.get('/api/catalog/majors');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});

