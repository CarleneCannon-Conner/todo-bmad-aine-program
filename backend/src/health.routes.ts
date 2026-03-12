import { FastifyInstance } from 'fastify';
import type { ApiResponse } from '@todo/shared';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) => {
    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: 'ok' },
    };
    return reply.status(200).send(response);
  });
}
