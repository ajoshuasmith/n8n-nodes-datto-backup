import type { INodeProperties } from 'n8n-workflow';

export const volumeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['volume'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get assets for a specific volume on a device',
				action: 'Get a volume',
			},
		],
		default: 'get',
	},
];

export const volumeFields: INodeProperties[] = [
	// ----------------------------------
	//         volume:get
	// ----------------------------------
	{
		displayName: 'Device Serial Number Name or ID',
		name: 'serialNumber',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['get'],
			},
		},
		description: 'The serial number of the BCDR device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Volume Name',
		name: 'volumeName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., C:, D:, /dev/sda1',
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['get'],
			},
		},
		hint: 'Use Windows format (C:) or Linux format (/dev/sda1)',
		description: 'The name of the volume to retrieve assets for',
	},
];
