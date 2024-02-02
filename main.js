import { Router } from 'acorn';

import token from '@/api/token.js';
import user from '@/api/user.js';
import games from '@/api/games.js';
import clips from '@/api/clips.js';

const app = new Router();

app.get('/', () => Response.redirect('https://github.com/pazguille/xbox-auth-api/blob/deno/README.md', 301));
app.get('/favicon.ico', ctx => new Response(null, { status: 204 }));
app.get('/api/token', token);
app.get('/api/user', user);
app.get('/api/games', games);
app.get('/api/clips', clips);

app.listen({ port: Deno.env.get('PORT') || 8081 });
