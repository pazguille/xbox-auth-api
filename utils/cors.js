export default function cors (ctx) {
  const originHeader = ctx.request.headers.get('Origin');
  const origin = (originHeader !== null && originHeader.includes('https://dev.xstoregames.com:3030')) ? originHeader : 'https://xstoregames.com';

  return {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true'
  };
};
