import { InvalidCredentialsError } from '@/services/errors/invalid-credentials-error';
import { makeAuthService } from '@/services/factories/make-auth-service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const authenticateBodySchema = z.object({
		email: z.string().email(),
		password: z.string(),
	});

	const { email, password } = authenticateBodySchema.parse(request.body);

	try {
		const userService = makeAuthService();

		const { user } = await userService.authUser({ email, password });

		const token = await reply.jwtSign({}, { sign: { sub: user.id } });

		return reply.status(200).send({ token });
	} catch (err) {
		if (err instanceof InvalidCredentialsError) {
			return reply.status(400).send({ message: err.message });
		}
		throw err;
	}
}
