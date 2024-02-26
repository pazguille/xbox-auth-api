import cors from '@/utils/cors.js';

export default async (ctx) => {
  const headers = new Headers({ ...cors(ctx) });
  headers.append('Set-Cookie', `nickname=; Domain=.xstoregames.com; Path=/; Secure; SameSite=None; Expires=${new Date(-1).toUTCString()}`);
  headers.append('Set-Cookie', `xuid=; Domain=.xstoregames.com; Path=/; HttpOnly; Secure; SameSite=None; Expires=${new Date(-1).toUTCString()}`);
  headers.append('Set-Cookie', `token=; Domain=.xstoregames.com; Path=/; HttpOnly; Secure; SameSite=None; Expires=${new Date(-1).toUTCString()}`);
  headers.append('Cache-Control', 'private, no-store, max-age=0');
  headers.append('Location', 'https://xstoregames.com');

  return new Response(null, {
    status: 307,
    headers,
 });
};
