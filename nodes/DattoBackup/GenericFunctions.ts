import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.datto.com/v1';

/**
 * Make an authenticated request to the Datto API
 */
export async function dattoApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'dattoBackupApi',
			options,
		);
		return response as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an authenticated request and return all items (handles pagination)
 */
export async function dattoApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const perPage = 100;
	let hasMorePages = true;

	while (hasMorePages) {
		qs._page = page;
		qs._perPage = perPage;

		const response = (await dattoApiRequest.call(this, method, endpoint, body, qs)) as IDataObject;

		const items = (response.items as IDataObject[]) || [];
		returnData.push(...items);

		// Check pagination metadata
		const pagination = response.pagination as IDataObject | undefined;
		if (pagination) {
			const totalPages = pagination.totalPages as number;
			hasMorePages = page < totalPages;
		} else {
			// If no pagination info, assume single page
			hasMorePages = false;
		}

		page++;
	}

	return returnData;
}

/**
 * Load devices for dropdown selection (fetches ALL pages for MSPs with many devices)
 */
export async function getDevices(
	this: ILoadOptionsFunctions,
): Promise<Array<{ name: string; value: string }>> {
	const devices: Array<{ name: string; value: string }> = [];

	try {
		// Use pagination to get ALL devices, not just first page
		const items = await dattoApiRequestAllItems.call(this, 'GET', '/bcdr/device');

		for (const device of items) {
			const name = device.name as string || device.serialNumber as string;
			const serialNumber = device.serialNumber as string;

			if (serialNumber) {
				devices.push({
					name: name || serialNumber,
					value: serialNumber,
				});
			}
		}
	} catch {
		// Return empty array if API call fails - user can still use expressions
	}

	return devices;
}

/**
 * Load SaaS domains/customers for dropdown selection
 */
export async function getSaasCustomers(
	this: ILoadOptionsFunctions,
): Promise<Array<{ name: string; value: string }>> {
	const customers: Array<{ name: string; value: string }> = [];

	try {
		const items = await dattoApiRequestAllItems.call(this, 'GET', '/saas/domains');

		for (const domain of items) {
			const name = domain.domain as string || domain.saasCustomerId as string;
			const customerId = String(domain.saasCustomerId || '');

			if (customerId) {
				customers.push({
					name: name || customerId,
					value: customerId,
				});
			}
		}
	} catch {
		// Return empty array if API call fails - user can still use expressions
	}

	return customers;
}
