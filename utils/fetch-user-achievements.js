const API_URL = (xuid, titleId) => `https://achievements.xboxlive.com/users/xuid(${xuid})/achievements?titleId=${titleId}`;

export default async function fetchUserAchievements(xuid, token, titleId, lang, store) {
  try {
    return await fetch(API_URL(xuid, titleId), {
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
