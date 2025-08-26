import { createMocks } from 'node-mocks-http';
import { codingAssistantHandler } from '../../src/pages/api/ai/coding-assistant';
import { regexHandler } from '../../src/pages/api/ai/regex';
import { repoQAHandler } from '../../src/pages/api/ai/repo-qa';

describe('AI Endpoints', () => {
  describe('/api/ai/coding-assistant', () => {
    it('should return a response for valid requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { prompt: 'Write a function to add two numbers' },
      });

      await codingAssistantHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toHaveProperty('suggestion');
    });

    it('should return a 400 for invalid requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      });

      await codingAssistantHandler(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('/api/ai/regex', () => {
    it('should return matches for valid regex patterns', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { regex: '\\d+', testString: 'There are 123 apples' },
      });

      await regexHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toHaveProperty('matches');
    });

    it('should return a 400 for invalid regex patterns', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { regex: '[', testString: 'Test' },
      });

      await regexHandler(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('/api/ai/repo-qa', () => {
    it('should return relevant answers for valid queries', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { query: 'What does this function do?', repoId: 'test-repo' },
      });

      await repoQAHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toHaveProperty('answer');
    });

    it('should return a 400 for invalid queries', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      });

      await repoQAHandler(req, res);

      expect(res.statusCode).toBe(400);
    });
  });
});