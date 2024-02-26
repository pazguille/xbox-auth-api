// const API_URL = (xuid, count) => `https://gameclipsmetadata.xboxlive.com/users/xuid(${xuid})/clips${count ? `?maxItems=${count}` : ''}`;
const API_URL = (id, count) => `https://avty.xboxlive.com/users/xuid(${id})/activity/history/unshared?activityTypes=GameDVR${count?`&numItems=${count}` : ''}`;
const PUBLIC_API_URL = (count) => `https://gameclipsmetadata.xboxlive.com/public/trending/clips?qualifier=created${count ? `?maxItems=${count}` : ''}`;
const TITLE_API_URL = (titleId, count) => `https://gameclipsmetadata.xboxlive.com/public/titles/${titleId}/clips?qualifier=created${count ? `&maxItems=${count}` : ''}`;
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
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw { code: response.status, statusText: response.statusText };
        }
      })
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
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw { code: response.status, statusText: response.statusText };
      }
    })
    .then(res => {
      return res.activityItems.map(clip => {
        return {
          title: clip.contentTitle,
          titleId: clip.titleId,
          poster: `https://images.weserv.nl/?output=webp&url=${clip.clipThumbnail}`,
          url: clip.downloadUri,
        }
      });
    })
    .catch(err => { throw err; });

  } catch (err) {
    return err;
  }
};
