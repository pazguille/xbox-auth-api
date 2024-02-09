const API_URL = xuid => `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/gamepass,achievement,detail,stats,friendswhoplayed,productId`; // image
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

export default async function fetchUserGames(xuid, token, lang, store, gamertag) {
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
        'x-xbl-contract-version': '2',
        // "x-xbl-client-name": "XboxApp",
        // "x-xbl-client-type": "UWA",
        // "x-xbl-client-version": "39.39.22001.0",
        'Accept-Language': `${lang}-${store}`,
        'Accept-Encoding': 'gzip',
      },
    })
    .then(res => res.json())
    .then(res => {
      // return res;
      return res.titles.map(game => ({
        id: game.productId,
        title: game.name,
        titleId: game.titleId,
        lastTimePlayed: game.titleHistory.lastTimePlayed,
        developer: game.detail.developerName,
        publisher: game.detail.publisherName,
        // category: game.detail.genres[0],
        // platforms: game.devices,
        release_date: game.detail.releaseDate,
        game_pass: game.gamePass.isGamePass,
        description: game.detail.description,
        images: {
          boxart: {
            url: game.displayImage.replace('http', 'https'),
            type: 'boxart',
          },
        },
        achievement: game.achievement,
      }));
    })
    .catch(err => { throw { error: err.response }; });

  } catch (err) {
    return err;
  }
};
