import Joi from 'joi';
import fetchUserClips from '@/utils/fetch-user-clips.js';
import cors from '@/utils/cors.js';

const cookieSchema = Joi.object({
  xuid: Joi.string().required(),
  token: Joi.string().required(),
});

const paramsSchema = Joi.object({
  gamertag: Joi.string(),
  count: Joi.number().default(10),
  trending: Joi.boolean().default(false),
  titleId: Joi.string(),
  lang: Joi.string().default('es'),
  store: Joi.string().default('ar'),
}).or('titleId', 'gamertag');

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

  const results = await fetchUserClips(xuid, token, query.lang, query.store, query.gamertag, query.count, query.trending, query.titleId);

  return Response.json(results, {
    status: results.code || 200,
    headers: {
      ...cors,
      'Cache-Control': 'public, max-age=0, s-maxage=7200, stale-while-revalidate',
    },
  });
};
