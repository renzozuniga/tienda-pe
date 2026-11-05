import type { ApiError } from '@tienda/contracts';
import type { FastifyError, FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { contractMatches } from './contract.js';

export const ApiErrorSchema = z.strictObject({
  code: z.enum(['VALIDATION_ERROR', 'NOT_FOUND', 'RATE_LIMITED', 'INTERNAL_ERROR']),
  message: z.string(),
  details: z.array(z.strictObject({ field: z.string(), message: z.string() })).optional(),
});
contractMatches<z.infer<typeof ApiErrorSchema>, ApiError>(true);

/** Error responses every route declares, so they are serialized with the contract's Error schema. */
export const errorResponses = {
  400: ApiErrorSchema,
  404: ApiErrorSchema,
  429: ApiErrorSchema,
  500: ApiErrorSchema,
} as const;

export function notFound(message = 'No encontramos lo que buscas.'): ApiError {
  return { code: 'NOT_FOUND', message };
}

/** Single error format for the whole API: { code, message, details? } with messages in Spanish. */
export function registerErrorHandling(app: FastifyInstance) {
  app.setErrorHandler<FastifyError>((err, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      const where = err.validationContext ?? 'request';
      const details = err.validation.map((v) => ({
        field: [where, ...v.instancePath.split('/').filter(Boolean)].join('.'),
        message: v.message ?? 'Valor inválido',
      }));
      return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'Revisa los datos enviados.', details });
    }

    const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
    if (status === 404) return reply.code(404).send(notFound());
    if (status === 429) {
      return reply.code(429).send({
        code: 'RATE_LIMITED',
        message: 'Hiciste demasiadas solicitudes. Espera un minuto y vuelve a intentarlo.',
      });
    }
    if (status >= 400 && status < 500) {
      return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'La solicitud no es válida.' });
    }

    req.log.error({ err }, 'Unhandled error');
    return reply
      .code(500)
      .send({ code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.' });
  });

  app.setNotFoundHandler((_req, reply) => reply.code(404).send(notFound()));
}
