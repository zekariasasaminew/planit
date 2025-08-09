import { writeFileSync, mkdirSync } from 'fs';
import { OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registry as routeRegistry } from '../src/lib/validation/schemas';

const registry = new OpenAPIRegistry();
// In a larger app you'd merge multiple registries; here we reuse the shared one
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(registry as any).definitions = (routeRegistry as any).definitions;

const generator = new OpenApiGeneratorV31(registry.definitions);
const doc = generator.generateDocument({
  openapi: '3.1.0',
  info: { title: 'PlanIt API', version: '0.1.0' },
});

mkdirSync('public', { recursive: true });
writeFileSync('public/openapi.json', JSON.stringify(doc, null, 2));
console.log('public/openapi.json written');

