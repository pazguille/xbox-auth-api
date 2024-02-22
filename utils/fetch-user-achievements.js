const API_URL = (xuid, skipitems, count) => `https://achievements.xboxlive.com/users/xuid(${xuid})/achievements?orderBy=UnlockTime&unlockedOnly=true&skipItems=${skipitems}&maxItems=${count}`;
const TITLE_API_URL = (xuid, titleId) => `https://achievements.xboxlive.com/users/xuid(${xuid})/achievements?titleId=${titleId}`;
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

export default async function fetchUserAchievements(xuid, token, lang, store, gamertag, skipitems, count, titleId) {
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

    const url = titleId ? TITLE_API_URL(id, titleId) : API_URL(id, skipitems, count);
    return await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `XBL3.0 x=${token}`,
        'x-xbl-contract-version': '2',
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
    .then(res => {
      return res.achievements.map(achievement => {
        return {
          title: achievement.titleAssociations[0].name,
          titleId: achievement.titleAssociations[0].id,
          state: achievement.progressState,
          name: achievement.name,
          description: achievement.description,
          image: `https://images.weserv.nl/?output=webp&url=${achievement.mediaAssets[0].url}`,
          timeUnlocked: achievement.progression.timeUnlocked,
          rewards: achievement?.rewards[0]?.value,
        }
      });
    })
    .catch(err => { throw err; });

  } catch (err) {
    return err;
  }
};
