import type {
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';

import {
	dattoApiRequest,
	dattoApiRequestAllItems,
	handleGetManyRequest,
} from './GenericFunctions';

export type OperationHandler = (this: IExecuteFunctions, index: number) => Promise<IDataObject | IDataObject[]>;

export const operationHandlers: { [key: string]: OperationHandler } = {
	// ----------------------------------------
	//              device
	// ----------------------------------------
	'device:get': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		return await dattoApiRequest.call(
			this,
			'GET',
			`/bcdr/device/${serialNumber}`,
		);
	},
	'device:getMany': async function (i: number) {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const options = this.getNodeParameter('options', i) as IDataObject;
		const qs: IDataObject = {};

		if (options.showHiddenDevices !== undefined) {
			qs.showHiddenDevices = options.showHiddenDevices ? '1' : '0';
		}
		if (options.showChildResellerDevices !== undefined) {
			qs.showChildResellerDevices = options.showChildResellerDevices ? '1' : '0';
		}
		if (options.sortBy) {
			qs._sort = options.sortBy;
		}
		if (options.sortOrder) {
			qs._order = options.sortOrder;
		}

		if (returnAll) {
			return await dattoApiRequestAllItems.call(
				this,
				'GET',
				'/bcdr/device',
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			qs._perPage = limit;
			const response = (await dattoApiRequest.call(
				this,
				'GET',
				'/bcdr/device',
				{},
				qs,
			)) as IDataObject;
			return (response.items as IDataObject[]) || [];
		}
	},

	// ----------------------------------------
	//              agent
	// ----------------------------------------
	'agent:getMany': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		return await handleGetManyRequest.call(this, i, `/bcdr/device/${serialNumber}/asset/agent`);
	},

	// ----------------------------------------
	//              alert
	// ----------------------------------------
	'alert:getMany': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		return await handleGetManyRequest.call(this, i, `/bcdr/device/${serialNumber}/alert`);
	},

	// ----------------------------------------
	//              asset
	// ----------------------------------------
	'asset:getMany': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		return await handleGetManyRequest.call(this, i, `/bcdr/device/${serialNumber}/asset`);
	},

	// ----------------------------------------
	//              share
	// ----------------------------------------
	'share:getMany': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		return await handleGetManyRequest.call(this, i, `/bcdr/device/${serialNumber}/asset/share`);
	},

	// ----------------------------------------
	//              volume
	// ----------------------------------------
	'volume:get': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		const volumeName = this.getNodeParameter('volumeName', i) as string;
		return await dattoApiRequest.call(
			this,
			'GET',
			`/bcdr/device/${serialNumber}/asset/volume`,
			{},
			{ volumeName },
		);
	},

	// ----------------------------------------
	//              vmRestore
	// ----------------------------------------
	'vmRestore:getMany': async function (i: number) {
		const serialNumber = this.getNodeParameter('serialNumber', i) as string;
		const responseData = await dattoApiRequest.call(
			this,
			'GET',
			`/bcdr/device/${serialNumber}/vm-restores`,
		);
		// Normalize response to array
		if (!Array.isArray(responseData)) {
			return (responseData as IDataObject).items as IDataObject[] || [responseData];
		}
		return responseData;
	},

	// ----------------------------------------
	//              activityLog
	// ----------------------------------------
	'activityLog:getMany': async function (i: number) {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i) as IDataObject;
		const qs: IDataObject = {};

		if (filters.clientName) {
			qs.clientName = filters.clientName;
		}
		if (filters.since) {
			qs.since = filters.since;
		}
		if (filters.sinceUnits) {
			qs.sinceUnits = filters.sinceUnits;
		}
		if (filters.targetType) {
			qs.targetType = filters.targetType;
		}
		if (filters.user) {
			qs.user = filters.user;
		}

		if (returnAll) {
			return await dattoApiRequestAllItems.call(
				this,
				'GET',
				'/report/activity-log',
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			qs._perPage = limit;
			const response = (await dattoApiRequest.call(
				this,
				'GET',
				'/report/activity-log',
				{},
				qs,
			)) as IDataObject;
			return (response.items as IDataObject[]) || [];
		}
	},

	// ----------------------------------------
	//              saasDomain
	// ----------------------------------------
	'saasDomain:getMany': async function (i: number) {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		// Fetch raw response to debug and handle different formats
		const response = await dattoApiRequest.call(this, 'GET', '/saas/domains');
		console.log('[DattoBackup] SaaS domains raw response:', JSON.stringify(response, null, 2));

		// Handle different possible response formats
		let items: IDataObject[] = [];
		if (Array.isArray(response)) {
			items = response as IDataObject[];
		} else if ((response as IDataObject).items) {
			items = (response as IDataObject).items as IDataObject[];
		} else if ((response as IDataObject).data) {
			items = (response as IDataObject).data as IDataObject[];
		} else {
			// Log unexpected structure for debugging
			console.log('[DattoBackup] Unexpected SaaS domains response structure, keys:', Object.keys(response));
			// Return the response as-is if it's an object (might be a single domain)
			if (response && typeof response === 'object' && !Array.isArray(response)) {
				items = [response as IDataObject];
			}
		}

		if (!returnAll) {
			const limit = this.getNodeParameter('limit', i) as number;
			return items.slice(0, limit);
		}
		return items;
	},

	// ----------------------------------------
	//              saasSeat
	// ----------------------------------------
	'saasSeat:getMany': async function (i: number) {
		const saasCustomerId = this.getNodeParameter('saasCustomerId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		// Fetch raw response to debug and handle different formats
		const response = await dattoApiRequest.call(this, 'GET', `/saas/${saasCustomerId}/seats`);
		console.log('[DattoBackup] SaaS seats raw response:', JSON.stringify(response, null, 2));

		// Handle different possible response formats
		let items: IDataObject[] = [];
		if (Array.isArray(response)) {
			items = response as IDataObject[];
		} else if ((response as IDataObject).items) {
			items = (response as IDataObject).items as IDataObject[];
		} else if ((response as IDataObject).seats) {
			items = (response as IDataObject).seats as IDataObject[];
		} else if ((response as IDataObject).data) {
			items = (response as IDataObject).data as IDataObject[];
		} else {
			console.log('[DattoBackup] Unexpected SaaS seats response structure, keys:', Object.keys(response));
			if (response && typeof response === 'object' && !Array.isArray(response)) {
				items = [response as IDataObject];
			}
		}

		if (!returnAll) {
			const limit = this.getNodeParameter('limit', i) as number;
			return items.slice(0, limit);
		}
		return items;
	},

	// ----------------------------------------
	//              saasApplication
	// ----------------------------------------
	'saasApplication:getMany': async function (i: number) {
		const saasCustomerId = this.getNodeParameter('saasCustomerId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		// Fetch raw response to debug and handle different formats
		const response = await dattoApiRequest.call(this, 'GET', `/saas/${saasCustomerId}/applications`);
		console.log('[DattoBackup] SaaS applications raw response:', JSON.stringify(response, null, 2));

		// Handle different possible response formats
		let items: IDataObject[] = [];
		if (Array.isArray(response)) {
			items = response as IDataObject[];
		} else if ((response as IDataObject).items) {
			items = (response as IDataObject).items as IDataObject[];
		} else if ((response as IDataObject).applications) {
			items = (response as IDataObject).applications as IDataObject[];
		} else if ((response as IDataObject).data) {
			items = (response as IDataObject).data as IDataObject[];
		} else {
			console.log('[DattoBackup] Unexpected SaaS applications response structure, keys:', Object.keys(response));
			if (response && typeof response === 'object' && !Array.isArray(response)) {
				items = [response as IDataObject];
			}
		}

		if (!returnAll) {
			const limit = this.getNodeParameter('limit', i) as number;
			return items.slice(0, limit);
		}
		return items;
	},

	// ----------------------------------------
	//              dtcAsset
	// ----------------------------------------
	'dtcAsset:get': async function (i: number) {
		const clientId = this.getNodeParameter('clientId', i) as string;
		const assetUuid = this.getNodeParameter('assetUuid', i) as string;
		return await dattoApiRequest.call(
			this,
			'GET',
			`/dtc/${clientId}/assets/${assetUuid}`,
		);
	},
	'dtcAsset:getMany': async function (i: number) {
		return await handleGetManyRequest.call(this, i, '/dtc/assets');
	},
	'dtcAsset:getManyByClient': async function (i: number) {
		const clientId = this.getNodeParameter('clientId', i) as string;
		return await handleGetManyRequest.call(this, i, `/dtc/${clientId}/assets`);
	},

	// ----------------------------------------
	//              dtcRmmTemplate
	// ----------------------------------------
	'dtcRmmTemplate:getMany': async function (i: number) {
		const responseData = await dattoApiRequest.call(
			this,
			'GET',
			'/dtc/rmm-templates',
		);
		// Normalize response to array
		if (!Array.isArray(responseData)) {
			return (responseData as IDataObject).items as IDataObject[] || [responseData];
		}
		return responseData;
	},

	// ----------------------------------------
	//              dtcStoragePool
	// ----------------------------------------
	'dtcStoragePool:getMany': async function (i: number) {
		const responseData = await dattoApiRequest.call(
			this,
			'GET',
			'/dtc/storage-pool',
		);
		// Normalize response to array
		if (!Array.isArray(responseData)) {
			return (responseData as IDataObject).items as IDataObject[] || [responseData];
		}
		return responseData;
	},
};
