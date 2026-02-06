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
	const credentials = await this.getCredentials('dattoBackupApi');

	// Debug: Log credential keys to see what we actually got
	console.log('[DattoBackup] Credentials Keys:', Object.keys(credentials));

	// Handle both new (publicKey) and old (user) field names
	const username = (credentials.publicKey || credentials.user) as string;
	const password = (credentials.secretKey || credentials.password) as string;

	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
		auth: {
			username,
			password,
		},
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		const response = await this.helpers.httpRequest(options);
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
		const requestQs = { ...qs, _page: page, _perPage: perPage };

		const response = (await dattoApiRequest.call(
			this,
			method,
			endpoint,
			body,
			requestQs,
		)) as IDataObject;

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

		if (page > 500) {
			// Safety break to prevent infinite loops
			hasMorePages = false;
		}
	}

	return returnData;
}

/**
 * Handle standard "Get Many" request with pagination and sort options
 */
export async function handleGetManyRequest(
	this: IExecuteFunctions,
	i: number,
	endpoint: string,
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;

	// Try to get options if they exist
	try {
		const options = this.getNodeParameter('options', i) as IDataObject;
		if (options.sortBy) {
			qs._sort = options.sortBy;
		}
		if (options.sortOrder) {
			qs._order = options.sortOrder;
		}
	} catch {
		// Options parameter doesn't exist for this operation
	}

	if (returnAll) {
		return await dattoApiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
	} else {
		const limit = this.getNodeParameter('limit', i) as number;
		qs._perPage = limit;
		const response = (await dattoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			qs,
		)) as IDataObject;
		return (response.items as IDataObject[]) || [];
	}
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
		console.log('[DattoBackup] Fetching SaaS domains...');

		// Fetch the raw response first to inspect structure
		const response = await dattoApiRequest.call(this, 'GET', '/saas/domains');
		console.log('[DattoBackup] SaaS domains raw response:', JSON.stringify(response, null, 2));

		// Handle different possible response formats
		let items: IDataObject[] = [];
		if (Array.isArray(response)) {
			items = response;
		} else if ((response as IDataObject).items) {
			items = (response as IDataObject).items as IDataObject[];
		} else if ((response as IDataObject).data) {
			items = (response as IDataObject).data as IDataObject[];
		} else {
			// Response might be a single object or have a different structure
			console.log('[DattoBackup] Unexpected response structure, keys:', Object.keys(response));
		}

		console.log(`[DattoBackup] SaaS domains found: ${items.length} items`);

		for (const domain of items) {
			// Try multiple possible field names for the customer identifier
			const customerId = String(
				domain.saasCustomerId ||
				domain.customerId ||
				domain.id ||
				domain.externalSubscriptionId ||
				''
			);

			// Try multiple possible field names for the display name - prefer customer/org name over domain
			const name = (
				domain.saasCustomerName ||
				domain.organizationName ||
				domain.domain ||
				domain.name ||
				domain.customerName ||
				customerId
			) as string;

			if (customerId) {
				customers.push({
					name: name || customerId,
					value: customerId,
				});
			}
		}
	} catch (error) {
		// Extract the actual error message for logging
		const errorMessage = error instanceof Error
			? error.message
			: JSON.stringify(error);
		console.error('[DattoBackup] Error fetching SaaS domains:', errorMessage);
		// Return empty array - user can still use expressions to specify customer ID manually
		// The n8n UI will show "No options found" which indicates the API call failed
	}

	console.log(`[DattoBackup] Returning ${customers.length} SaaS customers`);
	return customers;
}
