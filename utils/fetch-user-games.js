const API_URL = xuid => `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/gamepass,achievement,detail,stats,friendswhoplayed,productId`; // image

export default async function fetchUserGames(xuid, token, lang, store) {
  try {
    return await fetch(API_URL(xuid), {
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
            url: game.displayImage,
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
