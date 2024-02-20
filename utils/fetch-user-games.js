const API_URL = (xuid, count) => `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/gamepass,achievement,detail,stats,friendswhoplayed,productId,titleRecord${count ? `?maxItems=${count}` : ''}`; // image maxItems=${100}&skipitems=0
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

export default async function fetchUserGames(xuid, token, lang, store, gamertag, count) {
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

    return await fetch(API_URL(id, count), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `XBL3.0 x=${token}`,
        'x-xbl-contract-version': '2',
        Host: 'titlehub.xboxlive.com',
        Connection: 'Keep-Alive',
        'Accept-Language': `${lang}-${store}`,
        'Accept-Encoding': 'gzip',
      },
    })
    .then(res => res.json())
    .then(res => {
      // return res;
      return res.titles.reduce(function(filtered, game) {
        if (game.productId) {
          filtered.push({
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
                url: `https://images.weserv.nl/?output=webp&url=${game.displayImage}`,
                type: 'boxart',
              },
            },
            achievement: game.achievement,
          });
        }
        return filtered;
      }, []);
    })
    .catch(err => { throw { error: err.response }; });

  } catch (err) {
    return err;
  }
};
