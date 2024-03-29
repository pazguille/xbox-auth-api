import Joi from 'joi';
import fetchUserAchievements from '@/utils/fetch-user-achievements.js';
import cors from '@/utils/cors.js';

const cookieSchema = Joi.object({
  xuid: Joi.string().required(),
  token: Joi.string().required(),
});

const paramsSchema = Joi.object({
  titleId: Joi.string(),
  gamertag: Joi.string(),
  skipitems: Joi.number().default(0),
  count: Joi.number(),
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

  if (error) {
    return Response.json(error.details.map(err => ({
      param: err.path,
      type: err.type,
      message: err.message,
    })), { status: 400 });
  }

  const results = await fetchUserAchievements(xuid, token, query.lang, query.store, query.gamertag, query.skipitems, query.count, query.titleId);

  return Response.json(results, {
    status: results.code || 200,
    headers: {
      ...cors(ctx),
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
};
