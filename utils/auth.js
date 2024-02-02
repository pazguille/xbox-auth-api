export function getAuthorizeUrl({ clientId, redirectUri, scope }) {
  return `https://login.live.com/oauth20_authorize.srf?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
}

export async function exchangeCodeForAccessToken({ code, clientId, redirectUri, scope, secretId}) {
  try {
    return fetch('https://login.live.com/oauth20_token.srf', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        scope,
        client_secret: secretId,
        grant_type: 'authorization_code',
      }),
    })
    .then(res => res.json())
    .then(res => res)
    .catch(err => { throw { error: err.response }; });
  } catch (err) {
    return err;
  }
}

export async function exchangeRpsTicketForUserToken(rpsTicket) {
  try {
    return fetch('https://user.auth.xboxlive.com/user/authenticate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Xbl-Contract-Version': '2',
      },
      body: JSON.stringify({
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT',
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: 'd=' + rpsTicket,
        }
      })
    })
    .then(res => res.json())
    .catch(err => { throw { error: err.response }; });
  } catch (err) {
    return err;
  }
}

export async function exchangeTokenForXSTSToken(token) {
  try {
    return fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Xbl-Contract-Version': '2',
      },
      body: JSON.stringify({
        RelyingParty: 'http://xboxlive.com',
        TokenType: 'JWT',
        Properties: {
            UserTokens: [token],
            DeviceToken: undefined,
            TitleToken: undefined,
            OptionalDisplayClaims: undefined,
            SandboxId: 'RETAIL'
        }
      })
    })
    .then(res => res.json())
    .catch(err => { throw { error: err.response }; });
  } catch (err) {
    return err;
  }
}
