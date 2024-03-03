import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

// const XBREPLAY_API_URL = (gamertag, count) => `https://api.v2.xboxreplay.net/media/players/${gamertag}/gameclips${count ? `?count=${count}` : ''}`;
// const AVTY_API_URL = (id, count) => `https://avty.xboxlive.com/users/xuid(${id})/activity/history/unshared?activityTypes=GameDVR${count?`&numItems=${count}` : ''}`;
// const CLIPS_API_URL = (id, count) => `https://gameclipsmetadata.xboxlive.com/users/xuid(${id})/clips${count ? `?maxItems=${count}` : ''}`;
const PUBLIC_API_URL = (count) => `https://gameclipsmetadata.xboxlive.com/public/trending/clips?qualifier=created${count ? `?maxItems=${count}` : ''}`;
const TITLE_API_URL = (titleId, count) => `https://gameclipsmetadata.xboxlive.com/public/titles/${titleId}/clips?qualifier=created${count ? `&maxItems=${count}` : ''}`;
const GAMERTAG_2_XUID_URL = gamertag => `https://profile.xboxlive.com/users/gt(${gamertag})/settings`;

// https://gamerdvr.com/gamer/pazguillexx/videos
// https://xboxclips.co/pazguillexx/clips


function fetchClips(url, token, lang, store) {
  return fetch(url, {
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
      console.log(response);
      throw { code: response.status, statusText: response.statusText };
    }
  })
  .catch(err => { throw err; });
}

export default async function fetchUserClips(xuid, token, lang, store, gamertag, count, trending, titleId) {
  try {
    if (trending || titleId) {
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

      const url = trending ? PUBLIC_API_URL(count) : TITLE_API_URL(titleId, count);
      return await fetchClips(url, token, lang, store)
        .then(res => {
          return res.gameClips.map(clip => {
            return {
              clipId: clip.gameClipId,
              title: clip.titleName,
              titleId: clip.titleId,
              poster: `https://images.weserv.nl/?output=webp&url=${clip.thumbnails[1].uri}`,
              url: clip.gameClipUris[0].uri,
            }
          });
        });
    } else {

      return fetch(`https://xboxclips.co/${gamertag}/clips`).then(response => response.text()).then(text => {
        const parser = new DOMParser();
        const document = parser.parseFromString(text, 'text/html');
        const clips = Array.from(document.querySelectorAll('.download-wrap a')).map(a => {
          return {
            title: a.children[0].innerText.replace('\n\nVideo\n\n', '').trimEnd(),
            poster: `https://images.weserv.nl/?output=webp&url=${a.dataset.bg.replace('url(', '').replace(')', '')}`,
            url: a.dataset.url,
          }
        });
        return clips;
      });

    // return fetch('https://mediahub.xboxlive.com/gameclips/search', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `XBL3.0 x=${token}`,
    //     'x-xbl-contract-version': '2',
    //     'Accept-Language': `${lang}-${store}`,
    //     'Accept-Encoding': 'gzip',
    //   },
    //   body: JSON.stringify({
    //     max: 100,
    //     query: `OwnerXuid eq ${id}`,
    //   }),
    // })
    // .then(response => {
    //   if (response.ok) {
    //     return response.json();
    //   } else {
    //     throw { code: response.status, statusText: response.statusText };
    //   }
    // })
    // .catch(err => { throw err; });


      // const allClips = await Promise.all([
      //   fetchClips(CLIPS_API_URL(id, count), token, lang, store),
      //   fetchClips(API_URL(id, count), token, lang, store),
      // ]);

      // const activityItems = allClips[1].activityItems.map(clip => {
      //   return {
      //     clipId: clip.clipId,
      //     title: clip.contentTitle,
      //     titleId: clip.titleId,
      //     poster: `https://images.weserv.nl/?output=webp&url=${clip.clipThumbnail}`,
      //     url: clip.downloadUri,
      //   }
      // });

      // const gameClips = allClips[0].gameClips.map(clip => {
      //   return {
      //     clipId: clip.gameClipId,
      //     title: clip.titleName,
      //     titleId: clip.titleId,
      //     poster: `https://images.weserv.nl/?output=webp&url=${clip.thumbnails[1].uri}`,
      //     url: clip.gameClipUris[0].uri,
      //   }
      // });

      // const clips = [...activityItems, ...gameClips].reduce((acc, clip) => {
      //   if (acc.findIndex(c => c.clipId === clip.clipId) === -1) {
      //     acc.push(clip);
      //   }
      //   return acc;
      // }, []);

      // return clips;
    }
  } catch (err) {
    return err;
  }
};
