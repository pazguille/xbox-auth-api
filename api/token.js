import Joi from 'joi';
import {
  getAuthorizeUrl,
  exchangeCodeForAccessToken,
  exchangeRpsTicketForUserToken,
  exchangeTokenForXSTSToken,
} from '@/utils/auth.js';
import cors from '@/utils/cors.js';

const schema = Joi.object({
  auth: Joi.boolean().default(false),
  code: Joi.string(),
}).or('auth', 'code');

const clientId = 'e32e38f6-fcbc-4775-83d8-8981c29bcfc9';
const redirectUri = 'http://localhost:8081/api/token';
const scope = 'XboxLive.signin XboxLive.offline_access';
const secretId = 'fh08Q~yK6MmQw4hF~GDqzNSboNOwkdTX9Aemecvw';

export default async (ctx) => {
  const { value: query, error } = schema.validate(ctx.searchParams);

  if (error) {
    return Response.json(error.details.map(err => ({
      param: err.path,
      type: err.type,
      message: err.message,
    })), { status: 400 });
  }

  if (query.auth) {
    const authorizeUrl = getAuthorizeUrl({
      clientId,
      redirectUri,
      scope,
    });

    return new Response(null, {
      status: 307,
      headers: {
        ...cors,
        Location: authorizeUrl,
      },
   });
  }

  if (query.code) {
    const exchangeCodeResponse = await exchangeCodeForAccessToken({
      code: query.code,
      clientId,
      redirectUri,
      scope,
      secretId,
    });

    const rpsTicket = exchangeCodeResponse.access_token;
    // const refreshToken = exchangeCodeResponse.refresh_token; // May be undefined

    const userTokenResponse = await exchangeRpsTicketForUserToken(rpsTicket);
    const user = await exchangeTokenForXSTSToken(userTokenResponse.Token);

    const data = {
      xuid: user.DisplayClaims.xui[0].xid,
      nickname: user.DisplayClaims.xui[0].gtg,
      token: `${user.DisplayClaims.xui[0].uhs};${user.Token}`,
    };

    const authHeaders = new Headers({ ...cors });
    authHeaders.append('Set-Cookie', `nickname=${data.nickname}; Path=/; Secure; SameSite=Strict; Expires=${new Date(user.NotAfter).toUTCString()}`);
    authHeaders.append('Set-Cookie', `xuid=${data.xuid}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(user.NotAfter).toUTCString()}`);
    authHeaders.append('Set-Cookie', `token=${encodeURIComponent(data.token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(user.NotAfter).toUTCString()}`);
    authHeaders.append('Cache-Control', 'public, no-store, max-age=0');

    return Response.json(data, {
      status: 200,
      headers: authHeaders,
    });
  }


};
