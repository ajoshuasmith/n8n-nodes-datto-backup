import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { testDattoCredentials } from './CredentialTester';

export class DattoBackupApi implements ICredentialType {
	name = 'dattoBackupApi';

	displayName = 'Datto Backup API';

	documentationUrl = 'https://portal.dattobackup.com/integrations/api';

	icon = {
		light: 'file:../nodes/DattoBackup/dattobackup.svg',
		dark: 'file:../nodes/DattoBackup/dattobackup.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Public API Key',
			name: 'publicKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Public API Key from Datto Partner Portal (Admin > Integrations > API Keys)',
		},
		{
			displayName: 'Secret API Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Secret API Key from Datto Partner Portal (Admin > Integrations > API Keys)',
		},
	];

	test = {
		request: {
			baseURL: 'https://api.datto.com/v1',
			url: '/bcdr/device',
			method: 'GET' as const,
			qs: {
				_page: 1,
				_perPage: 1,
			},
		},
	};

	// Custom credential tester that runs in full Node.js context
	testedBy = {
		credentialType: 'dattoBackupApi',
		testRequest: testDattoCredentials,
	};
}
