import Joi from 'joi';
import fetchUserDetail from '@/utils/fetch-user-detail.js';
import cors from '@/utils/cors.js';

const cookieSchema = Joi.object({
  xuid: Joi.string().required(),
  token: Joi.string().required(),
});

const paramsSchema = Joi.object({
  lang: Joi.string().default('es'),
  store: Joi.string().default('ar'),
  gamertag: Joi.string(),
});

export default async (ctx) => {
  const xuid = await ctx.cookies.get('xuid');
  const token = decodeURIComponent(await ctx.cookies.get('token'));

  const { cookiesError } = cookieSchema.validate({ xuid, token });
  const { value: query, error } = paramsSchema.validate(ctx.searchParams);

  if (error || cookiesError) {
    return Response.json((error || cookiesError).details.map(err => ({
      param: err.path,
      type: err.type,
      message: err.message,
    })), { status: 400 });
  }

  const results = await fetchUserDetail(xuid, token, query.lang, query.store, query.gamertag);
  return Response.json(results, {
    status: results.code || 200,
    headers: {
      ...cors(ctx),
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
};
