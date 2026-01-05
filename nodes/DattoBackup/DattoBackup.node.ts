import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	getDevices,
	getSaasCustomers,
} from './GenericFunctions';

import { operationHandlers } from './OperationHandlers';

import {
	deviceOperations,
	deviceFields,
	agentOperations,
	agentFields,
	alertOperations,
	alertFields,
	assetOperations,
	assetFields,
	shareOperations,
	shareFields,
	volumeOperations,
	volumeFields,
	vmRestoreOperations,
	vmRestoreFields,
	activityLogOperations,
	activityLogFields,
	saasDomainOperations,
	saasDomainFields,
	saasSeatOperations,
	saasSeatFields,
	saasApplicationOperations,
	saasApplicationFields,
	dtcAssetOperations,
	dtcAssetFields,
	dtcRmmTemplateOperations,
	dtcRmmTemplateFields,
	dtcStoragePoolOperations,
	dtcStoragePoolFields,
} from './descriptions';

export class DattoBackup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Datto Backup',
		name: 'dattoBackup',
		icon: 'file:dattobackup.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Datto BCDR API for backup monitoring and management',
		defaults: {
			name: 'Datto Backup',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dattoBackupApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Activity Log',
						value: 'activityLog',
						description: 'User activity audit log',
					},
					{
						name: 'Agent',
						value: 'agent',
						description: 'Backup agents on protected systems',
					},
					{
						name: 'Alert',
						value: 'alert',
						description: 'Device alerts and notifications',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Combined agents and shares for a device',
					},
					{
						name: 'Device',
						value: 'device',
						description: 'BCDR hardware and cloud devices',
					},
					{
						name: 'DTC Asset',
						value: 'dtcAsset',
						description: 'Direct-to-Cloud assets (endpoint backup)',
					},
					{
						name: 'DTC RMM Template',
						value: 'dtcRmmTemplate',
						description: 'RMM deployment templates',
					},
					{
						name: 'DTC Storage Pool',
						value: 'dtcStoragePool',
						description: 'Storage pool usage information',
					},
					{
						name: 'SaaS Application',
						value: 'saasApplication',
						description: 'SaaS Protection backup data',
					},
					{
						name: 'SaaS Domain',
						value: 'saasDomain',
						description: 'SaaS Protection domains',
					},
					{
						name: 'SaaS Seat',
						value: 'saasSeat',
						description: 'SaaS Protection seats',
					},
					{
						name: 'Share',
						value: 'share',
						description: 'Network shares being backed up',
					},
					{
						name: 'VM Restore',
						value: 'vmRestore',
						description: 'Virtual machine restore operations',
					},
					{
						name: 'Volume',
						value: 'volume',
						description: 'Storage volumes on a device',
					},
				],
				default: 'device',
			},
			// Device
			...deviceOperations,
			...deviceFields,
			// Agent
			...agentOperations,
			...agentFields,
			// Alert
			...alertOperations,
			...alertFields,
			// Asset
			...assetOperations,
			...assetFields,
			// Share
			...shareOperations,
			...shareFields,
			// Volume
			...volumeOperations,
			...volumeFields,
			// VM Restore
			...vmRestoreOperations,
			...vmRestoreFields,
			// Activity Log
			...activityLogOperations,
			...activityLogFields,
			// SaaS Domain
			...saasDomainOperations,
			...saasDomainFields,
			// SaaS Seat
			...saasSeatOperations,
			...saasSeatFields,
			// SaaS Application
			...saasApplicationOperations,
			...saasApplicationFields,
			// DTC Asset
			...dtcAssetOperations,
			...dtcAssetFields,
			// DTC RMM Template
			...dtcRmmTemplateOperations,
			...dtcRmmTemplateFields,
			// DTC Storage Pool
			...dtcStoragePoolOperations,
			...dtcStoragePoolFields,
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getDevices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getDevices.call(this);
			},
			async getSaasCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getSaasCustomers.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const handlerKey = `${resource}:${operation}`;
				const handler = operationHandlers[handlerKey];

				if (!handler) {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${handlerKey}`);
				}

				const responseData = await handler.call(this, i);

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
