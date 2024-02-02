const API_URL = xuid => `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titleHistory/decoration/GamePass,achievement,detail`;

export default async function fetchUserGames(xuid, token, lang, store) {
  try {
    return await fetch(API_URL(xuid), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `XBL3.0 x=${token}`,
        'x-xbl-contract-version': '2',
        'Accept-Language': `${lang}-${store}`,
        'Accept-Encoding': 'gzip',
      },
    })
    .then(response => response.json())
    .then(response => response)
    .catch(err => { throw { error: err.response }; });

  } catch (err) {
    return err;
  }
};
