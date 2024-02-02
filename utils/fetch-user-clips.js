const API_URL = (xuid, limit) => `https://gameclipsmetadata.xboxlive.com/users/xuid(${xuid})/clips?maxItems=${limit}`;
const PUBLIC_API_URL = (limit) => `https://gameclipsmetadata.xboxlive.com/public/trending/clips?qualifier=created&skipItems=1&maxItems=${limit}`;

export default async function fetchUserClips(xuid, token, lang, store, limit, trending) {
  try {
    const url = trending ? PUBLIC_API_URL(limit) : API_URL(xuid, limit);
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `XBL3.0 x=${token}`,
        'x-xbl-contract-version': '2',
        'Accept-Language': `${lang}-${store}`,
        'Accept-Encoding': 'gzip',
      },
    })
    .then(response => response.json())
    .then(response => response.gameClips)
    .catch(err => { throw { error: err.response }; });

  } catch (err) {
    return err;
  }
};
