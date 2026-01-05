import type { INodeProperties } from 'n8n-workflow';

export const dtcAssetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dtcAsset'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific direct-to-cloud asset',
				action: 'Get a DTC asset',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all direct-to-cloud assets',
				action: 'Get many DTC assets',
			},
			{
				name: 'Get Many by Client',
				value: 'getManyByClient',
				description: 'Get all direct-to-cloud assets for a specific client',
				action: 'Get many DTC assets by client',
			},
		],
		default: 'getMany',
	},
];

export const dtcAssetFields: INodeProperties[] = [
	// ----------------------------------
	//         dtcAsset:get
	// ----------------------------------
	{
		displayName: 'Client ID',
		name: 'clientId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., abc123-def456',
		displayOptions: {
			show: {
				resource: ['dtcAsset'],
				operation: ['get', 'getManyByClient'],
			},
		},
		hint: 'The client identifier from your Datto Partner Portal',
		description: 'The unique client ID associated with the direct-to-cloud assets',
	},
	{
		displayName: 'Asset UUID',
		name: 'assetUuid',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 550e8400-e29b-41d4-a716-446655440000',
		displayOptions: {
			show: {
				resource: ['dtcAsset'],
				operation: ['get'],
			},
		},
		hint: 'Get this from a previous "Get Many" operation',
		description: 'The unique UUID identifying the specific DTC asset',
	},

	// ----------------------------------
	//         dtcAsset:getMany / getManyByClient
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['dtcAsset'],
				operation: ['getMany', 'getManyByClient'],
			},
		},
		hint: 'Warning: may be slow for large datasets',
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['dtcAsset'],
				operation: ['getMany', 'getManyByClient'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
