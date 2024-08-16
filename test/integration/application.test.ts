import request from 'supertest';
import { Shutdown } from '../../src/server';
import { application } from '../../src/app';

describe('Application', () => {
	afterAll((done) => {
		Shutdown(done);
	});

	it('Returns 404 when the route requested is not found.', async () => {
		const response = await request(application).get('/a/cute/route/that/does/not/exist/');

		expect(response.status).toBe(404);
	}, 10000);
});
