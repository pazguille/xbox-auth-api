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
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw { code: response.status, statusText: response.statusText };
      }
    })
    .then(response => {
      const user = response.people[0];
      return {
        xuid: user.xuid,
        displayName: user.displayName,
        gamertag: user.gamertag,
        modernGamertag: user.modernGamertag,
        uniqueModernGamertag: user.uniqueModernGamertag,
        displayPicRaw: user.displayPicRaw,
        gamerScore: user.gamerScore,
        presenceState: user.presenceState,
        presenceText: user.presenceText,
        lastSeenDateTimeUtc: user.lastSeenDateTimeUtc,
        preferredColor: user.preferredColor,
        titlePresence: user.titlePresence,
        location: user.detail.location,
        followers: user.detail.followerCount,
        following: user.detail.followingCount,
      }
    })
    .catch(err => { throw err; });

  } catch (err) {
    return err;
  }
};
