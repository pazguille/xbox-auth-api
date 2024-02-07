const API_URL = xuid => `https://peoplehub.xboxlive.com/users/me/people/xuids(${xuid})/decoration/detail,preferredColor,presenceDetail,titlePresence`;
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

export default async function fetchUserDetail(xuid, token, lang, store, gamertag) {
  try {
    let id;
    if (gamertag) {
      id = await fetch(GAMERTAG_2_XUID_URL(gamertag), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `XBL3.0 x=${token}`,
          'x-xbl-contract-version': '2',
          'Accept-Language': `${lang}-${store}`,
          'Accept-Encoding': 'gzip',
        },
      })
      .then(response => response.json())
      .then(response => response.profileUsers[0].id);
    } else {
      id = xuid;
    }

    return await fetch(API_URL(id), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `XBL3.0 x=${token}`,
        'x-xbl-contract-version': '5',
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
