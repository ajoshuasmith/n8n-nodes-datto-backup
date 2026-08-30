import { DattoBackupApi } from '../../credentials/DattoBackupApi.credentials';
import { getSaasCustomers } from './GenericFunctions';
import { operationHandlers } from './OperationHandlers';
import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

// Don't mock GenericFunctions - verify the real logic flow
// jest.mock('./GenericFunctions');

describe('OperationHandlers', () => {
	let mockExecuteFunctions: Partial<IExecuteFunctions>;
	let mockGetNodeParameter: jest.Mock;
	let mockHttpRequest: jest.Mock;

	beforeEach(() => {
		mockGetNodeParameter = jest.fn();
		mockHttpRequest = jest.fn();
		mockExecuteFunctions = {
			getNodeParameter: mockGetNodeParameter,
			getCredentials: jest.fn().mockResolvedValue({ publicKey: 'user', secretKey: 'pass' }),
			getNode: jest.fn().mockReturnValue({}),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
				constructExecutionMetaData: jest.fn(),
				httpRequest: mockHttpRequest,
			} as unknown as IExecuteFunctions['helpers'],
		};
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('device:get', () => {
		it('uses the same API key mapping in the n8n credential test', () => {
			const credentialType = new DattoBackupApi();

			expect(credentialType.test.request.auth).toEqual({
				username: '={{$credentials.publicKey}}',
				password: '={{$credentials.secretKey}}',
			});
		});

		it('uses the configured API keys for HTTP Basic authentication', async () => {
			const serialNumber = '12345';
			mockGetNodeParameter.mockReturnValue(serialNumber);
			mockHttpRequest.mockResolvedValue({ name: 'test-device' });

			const handler = operationHandlers['device:get'];
			await handler.call(mockExecuteFunctions as IExecuteFunctions, 0);

			expect(mockGetNodeParameter).toHaveBeenCalledWith('serialNumber', 0);
			expect(mockHttpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://api.datto.com/v1/bcdr/device/12345',
					method: 'GET',
					auth: {
						username: 'user',
						password: 'pass',
					},
				})
			);
		});

		it('preserves n8n API error wrapping for request failures', async () => {
			mockGetNodeParameter.mockReturnValue('12345');
			mockHttpRequest.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' });

			const handler = operationHandlers['device:get'];

			await expect(
				handler.call(mockExecuteFunctions as IExecuteFunctions, 0),
			).rejects.toBeInstanceOf(NodeApiError);
		});
	});

	describe('sensitive logging', () => {
		it('does not log SaaS customer option responses', async () => {
			const consoleLog = jest.spyOn(console, 'log').mockImplementation();
			const consoleError = jest.spyOn(console, 'error').mockImplementation();
			mockHttpRequest.mockResolvedValue({
				items: [{ id: 'customer-123', organizationName: 'Example Customer' }],
			});

			const result = await getSaasCustomers.call(
				mockExecuteFunctions as unknown as ILoadOptionsFunctions,
			);

			expect(result).toEqual([
				{ name: 'Example Customer', value: 'customer-123' },
			]);
			expect(consoleLog).not.toHaveBeenCalled();
			expect(consoleError).not.toHaveBeenCalled();
		});

		it('does not log Datto API responses or credential metadata', async () => {
			const consoleLog = jest.spyOn(console, 'log').mockImplementation();
			const consoleError = jest.spyOn(console, 'error').mockImplementation();
			mockGetNodeParameter.mockImplementation((param) => {
				if (param === 'saasCustomerId') return 'customer-123';
				if (param === 'returnAll') return true;
				return undefined;
			});
			mockHttpRequest.mockResolvedValue({ items: [{ id: 'record-1' }] });

			await operationHandlers['saasDomain:getMany'].call(
				mockExecuteFunctions as IExecuteFunctions,
				0,
			);
			await operationHandlers['saasSeat:getMany'].call(
				mockExecuteFunctions as IExecuteFunctions,
				0,
			);
			await operationHandlers['saasApplication:getMany'].call(
				mockExecuteFunctions as IExecuteFunctions,
				0,
			);

			expect(consoleLog).not.toHaveBeenCalled();
			expect(consoleError).not.toHaveBeenCalled();
		});
	});

	describe('device:getMany', () => {
		it('should fetch all pages when returnAll is true', async () => {
			mockGetNodeParameter.mockImplementation((param) => {
				if (param === 'returnAll') return true;
				if (param === 'options') return {};
				return undefined;
			});
			// Mock first page response with pagination indicating more pages
			mockHttpRequest.mockResolvedValueOnce({
				items: [{ id: 1 }],
				pagination: { totalPages: 2 }
			});
			// Mock second page response
			mockHttpRequest.mockResolvedValueOnce({
				items: [{ id: 2 }],
				pagination: { totalPages: 2 }
			});

			const handler = operationHandlers['device:getMany'];
			const result = await handler.call(mockExecuteFunctions as IExecuteFunctions, 0);

			expect(mockHttpRequest).toHaveBeenCalledTimes(2);
			expect(result).toHaveLength(2);
			expect(mockHttpRequest).toHaveBeenNthCalledWith(1,
				expect.objectContaining({
					qs: expect.objectContaining({ _page: 1 }),
					auth: {
						username: 'user',
						password: 'pass',
					},
				})
			);
			expect(mockHttpRequest).toHaveBeenNthCalledWith(2,
				expect.objectContaining({
					qs: expect.objectContaining({ _page: 2 }),
					auth: {
						username: 'user',
						password: 'pass',
					},
				})
			);
		});

		it('should fetch single page with limit when returnAll is false', async () => {
			mockGetNodeParameter.mockImplementation((param) => {
				if (param === 'returnAll') return false;
				if (param === 'options') return {};
				if (param === 'limit') return 50;
				return undefined;
			});
			mockHttpRequest.mockResolvedValue({ items: [{ id: 1 }] });

			const handler = operationHandlers['device:getMany'];
			await handler.call(mockExecuteFunctions as IExecuteFunctions, 0);

			expect(mockHttpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					qs: expect.objectContaining({ _perPage: 50 }),
					auth: {
						username: 'user',
						password: 'pass',
					},
				})
			);
		});
	});

	describe('agent:getMany', () => {
		it('should call handleGetManyRequest logic correctly', async () => {
			const serialNumber = '12345';
			mockGetNodeParameter.mockImplementation((param) => {
				if (param === 'serialNumber') return serialNumber;
				if (param === 'returnAll') return true;
				return undefined;
			});
			mockHttpRequest.mockResolvedValue({
				items: [],
				pagination: { totalPages: 1 }
			});

			const handler = operationHandlers['agent:getMany'];
			await handler.call(mockExecuteFunctions as IExecuteFunctions, 0);

			expect(mockHttpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					url: `https://api.datto.com/v1/bcdr/device/${serialNumber}/asset/agent`,
					auth: {
						username: 'user',
						password: 'pass',
					},
				})
			);
		});
	});
});
