import type {
	ICredentialDataDecryptedObject,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
} from 'n8n-workflow';

export async function testDattoCredentials(
	this: ICredentialTestFunctions,
	credential: ICredentialDataDecryptedObject,
): Promise<INodeCredentialTestResult> {
	const publicKey = (credential.publicKey as string).trim();
	const secretKey = (credential.secretKey as string).trim();

	const authHeader = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString('base64')}`;

	try {
		await this.helpers.request({
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
		});

		return {
			status: 'OK',
			message: 'Connection successful!',
		};
	} catch (error) {
		return {
			status: 'Error',
			message: `Connection failed: ${(error as Error).message}`,
		};
	}
}
