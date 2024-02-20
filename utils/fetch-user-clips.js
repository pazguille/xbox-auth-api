const API_URL = (xuid, count) => `https://gameclipsmetadata.xboxlive.com/users/xuid(${xuid})/clips?maxItems=${count}`;
const PUBLIC_API_URL = (count) => `https://gameclipsmetadata.xboxlive.com/public/trending/clips?qualifier=created&maxItems=${count}`;
const TITLE_API_URL = (titleId, count) => `https://gameclipsmetadata.xboxlive.com/public/titles/${titleId}/clips?qualifier=created&maxItems=${count}`;
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

export default async function fetchUserClips(xuid, token, lang, store, gamertag, count, trending, titleId) {
  try {
    let id;
    if (gamertag) {
      id = await fetch(GAMERTAG_2_XUID_URL(gamertag), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `XBL3.0 x=${token}`,
          'x-xbl-contract-version': '3',
          'Accept-Language': `${lang}-${store}`,
          'Accept-Encoding': 'gzip',
        },
      })
      .then(response => response.json())
      .then(response => response.profileUsers[0].id);
    } else {
      id = xuid;
    }

    const url = trending ? PUBLIC_API_URL(count) : (titleId ? TITLE_API_URL(titleId, count) : API_URL(id, count));
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
