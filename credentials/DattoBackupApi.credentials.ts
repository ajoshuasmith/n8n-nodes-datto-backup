import type {
	ICredentialDataDecryptedObject,
	ICredentialTestFunctions,
	ICredentialType,
	INodeCredentialTestResult,
	INodeProperties,
} from 'n8n-workflow';

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

	// Custom credential tester that runs in full Node.js context
	// This avoids n8n expression limitations with Buffer.from()
	testedBy = {
		credentialType: 'dattoBackupApi',
		testRequest: async function (
			this: ICredentialTestFunctions,
			credential: ICredentialDataDecryptedObject,
		): Promise<INodeCredentialTestResult> {
			const publicKey = (credential.publicKey as string).trim();
			const secretKey = (credential.secretKey as string).trim();

			// Construct Auth Header
			const authHeader = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString('base64')}`;

			// Debug Log (Server-side)
			console.log(`[DattoBackup] Testing connection for User: ${publicKey}`);
			console.log(`[DattoBackup] Auth Header Length: ${authHeader.length}`);

			try {
				const response = await this.helpers.request({
					method: 'GET',
					url: 'https://api.datto.com/v1/bcdr/device',
					qs: {
						_page: 1,
						_perPage: 1,
					},
					headers: {
						Authorization: authHeader,
					},
					json: true,
					resolveWithFullResponse: true, // Get full response to check headers/status
				});

				console.log(`[DattoBackup] Connection Successful! Status: ${response.statusCode}`);

				return {
					status: 'OK',
					message: 'Connection successful!',
				};
			} catch (error) {
				const err = error as any;
				console.error('[DattoBackup] Connection Failed:', err.message);

				// Enhanced Error Message for UI
				let uiMessage = `Connection failed: ${err.message}`;

				// Safely access response details
				if (err.response) {
					if (err.response.status) {
						uiMessage += ` (Status: ${err.response.status})`;
					}
					if (err.response.body && Array.isArray(err.response.body.messages)) {
						uiMessage += ` | Details: ${JSON.stringify(err.response.body.messages)}`;
					} else if (err.response.body) {
						// Log body if it's not the standard messages array
						console.error('[DattoBackup] Response Body:', JSON.stringify(err.response.body));
					}
				}

				return {
					status: 'Error',
					message: uiMessage,
				};
			}
		},
	};
}
