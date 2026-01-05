import { operationHandlers } from './OperationHandlers';
import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

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
			getNode: jest.fn().mockReturnValue({}),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
				constructExecutionMetaData: jest.fn(),
				httpRequestWithAuthentication: mockHttpRequest,
			} as any,
		};
		jest.clearAllMocks();
	});

	describe('device:get', () => {
		it('should call httpRequestWithAuthentication with correct path', async () => {
			const serialNumber = '12345';
			mockGetNodeParameter.mockReturnValue(serialNumber);
			mockHttpRequest.mockResolvedValue({ name: 'test-device' });

			const handler = operationHandlers['device:get'];
			await handler.call(mockExecuteFunctions as IExecuteFunctions, 0);

			expect(mockGetNodeParameter).toHaveBeenCalledWith('serialNumber', 0);
			expect(mockHttpRequest).toHaveBeenCalledWith(
				'dattoBackupApi',
				expect.objectContaining({
					url: 'https://api.datto.com/v1/bcdr/device/12345',
					method: 'GET'
				})
			);
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
				'dattoBackupApi',
				expect.objectContaining({
					qs: expect.objectContaining({ _page: 1 })
				})
			);
			expect(mockHttpRequest).toHaveBeenNthCalledWith(2,
				'dattoBackupApi',
				expect.objectContaining({
					qs: expect.objectContaining({ _page: 2 })
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
				'dattoBackupApi',
				expect.objectContaining({
					qs: expect.objectContaining({ _perPage: 50 })
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
				'dattoBackupApi',
				expect.objectContaining({
					url: `https://api.datto.com/v1/bcdr/device/${serialNumber}/asset/agent`
				})
			);
		});
	});
});
