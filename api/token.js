import Joi from 'joi';
import {
  getAuthorizeUrl,
  exchangeCodeForAccessToken,
  exchangeRpsTicketForUserToken,
  exchangeTokenForXSTSToken,
} from '@/utils/auth.js';
import cors from '@/utils/cors.js';
import { load } from "https://deno.land/std@0.214.0/dotenv/mod.ts";

const env = await load();

const schema = Joi.object({
  auth: Joi.boolean().default(false),
  code: Joi.string(),
}).or('auth', 'code');

// const redirectUri = 'http://localhost:8081/api/token';
const redirectUri = 'https://auth.xstoregames.com/api/token';
const scope = 'XboxLive.signin XboxLive.offline_access';
const clientId = env['CLIENT_ID'] || Deno.env.get('CLIENT_ID');
const secretId = env['SECRET_ID'] || Deno.env.get('SECRET_ID');

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
