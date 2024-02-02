const API_URL = xuid => `https://peoplehub.xboxlive.com/users/me/people/xuids(${xuid})/decoration/detail,preferredColor,presenceDetail,multiplayerSummary`;

export default async function fetchUserDetail(xuid, token, lang, store) {
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
    .then(response => response.people[0])
    .catch(err => { throw { error: err.response }; });

  } catch (err) {
    return err;
  }
};
