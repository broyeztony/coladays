const jwt = require('jsonwebtoken')

class AuthMiddleware {

	constructor(agServer){

		this.pemCert = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJeROsC0vAV65VMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV
BAMTFWNvbGFkYXlzLmV1LmF1dGgwLmNvbTAeFw0yMTEwMDEyMTI1MjFaFw0zNTA2
MTAyMTI1MjFaMCAxHjAcBgNVBAMTFWNvbGFkYXlzLmV1LmF1dGgwLmNvbTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJuO7p3FyTPKLbV0rp0AAxOzt303
BN+TJ1oCxlHh3YuuoXGpaFbx87RrWBXevcThJrzgT+bp8PBRY/09Y3O5JfrY5Fw8
e98YzKfTGz3412kjVhiIvZgov+zkt/rT3edxywuNCYKAXYUu/aFpaUo7kAyfLkfS
K4wfaMTVp5mgyf4OVF88ka3ukEkDlbxqkat7aVKdAAR8IYdSlwAe24ar90IvPxX1
zC/Nv7cjf9Pt/BfS4ncAWTp6H1uc7JjNEp6zPTmOXC2ILPabaXqLYtMWJkvZUM38
k8PwkDXTod8uLi4LzZJHOYchOWsN4ahna+ezuPIoZHqayhdv5ygZoSr8k7MCAwEA
AaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUMysz9p8ROZwV9M7CA19f
d0n32i0wDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQBdC8XK/lRz
WmYsY/5/yhDd7j4Tfx2XcVml1gsBK0s/ddNKHVckmZQFELySVhK4+57iyFQJsCM9
Vtw1BJ5Zxexrst3V2WHcmIFXS80aTzs2MDdD07byo1k6BauEx8e5UC3cBAbwqpVS
CKXd6ePz2VifyQy29Qq7TX7AwQdXyBnrjjVhOGh4fY85ZJvPl/wEiopT5jwWPd/G
8BPnGcqqtPiAfHXCPsD5QoZbR4iTCroIejaH1jsmtStPUkLFgwftkieQjixjjd93
H3AJTeb/Phljqr5Gq+wBiHE5siUbD6K0a+F8CsiFheV04gK8aE9fAYUw8SPNaXmR
+d0VCWmPIgyR
-----END CERTIFICATE-----`

		this.agServer = agServer
		this.register()
	}

	verify (authToken) {
		try {
			return jwt.verify(authToken, this.pemCert, { algorithm: 'RS256' })
		}
		catch(err) {
			console.log('@@ the authToken did not pass verification.')
			return false;
		}
	}

	register() {

		this.agServer.setMiddleware(this.agServer.MIDDLEWARE_INBOUND, async (middlewareStream) => {
			for await (let action of middlewareStream) {
				switch(action.type) {
					case action.SUBSCRIBE:
					case action.INVOKE:
							if(!action.data || !action.data.authToken || !this.verify(action.data.authToken)) {
								let error = new Error('The authToken is invalid.')
								error.name = 'UnauthorizedActionError';
								action.block(error);
								continue;
							}
						break;
					case action.TRANSMIT:
						break;
				}

				action.allow();
			} // forOf
		})
	}
}

module.exports = {
	AuthMiddleware
}