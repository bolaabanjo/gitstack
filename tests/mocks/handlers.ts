import { rest } from 'msw';

export const handlers = [
  rest.post('/api/ai/coding-assistant', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ suggestion: 'function add(a, b) { return a + b; }' })
    );
  }),

  rest.post('/api/ai/regex', (req, res, ctx) => {
    const { regex, testString } = req.body as any;
    try {
      const matches = [...testString.matchAll(new RegExp(regex, 'g'))].map((m) => m[0]);
      return res(ctx.status(200), ctx.json({ matches }));
    } catch (e) {
      return res(ctx.status(400), ctx.json({ error: 'Invalid regex' }));
    }
  }),

  rest.post('/api/ai/repo-qa', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ answer: 'This function adds two numbers.' }));
  }),
];
