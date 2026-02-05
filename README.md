# CleanShare

Remove user tracking from social media share links.

CleanShare strips tracking parameters from URLs shared from social media platforms. All processing occurs client-side. No data leaves your browser.

## Supported Platforms

| Platform       | Tracking Parameters Removed                                     |
| -------------- | --------------------------------------------------------------- |
| **Instagram**  | `igsh`, `igshid`, `utm_*`, `fbclid`                             |
| **Spotify**    | `si`, `sp_cid`, `utm_*`, `go`, `dl_branch`                      |
| **TikTok**     | `_t`, `_r`, `ttclid`, `sec_uid`, `u_code`, `utm_*`              |
| **YouTube**    | `si`, `pp`, `feature`, `utm_*` (preserves `v`, `t`, `list`)     |
| **Twitter/X**  | `t`, `s`, `ref_src`, `utm_*`                                    |
| **Facebook**   | `fbclid`, `mibextid`, `eav`, `__tn__`, `ref`, `paipv`, `utm_*`  |
| **Reddit**     | `share_id`, `utm_*`, `ref`, `fbclid`, `gclid`                   |
| **LinkedIn**   | `trk`, `li_fat_id`, `lipi`, `trkInfo`, `rcm`, `origin`, `utm_*` |
| **Pinterest**  | `utm_*`, `source`                                               |
| **Twitch**     | `tt_content`, `tt_medium`, `utm_*`                              |
| **SoundCloud** | `utm_*`                                                         |
| **Vimeo**      | `utm_*`                                                         |

## Limitations

### TikTok Short Links

TikTok short links (`vm.tiktok.com`) embed tracking in server-side redirects.

**Workaround:**

1. Open the link in a browser
2. Copy the expanded URL from the address bar
3. Paste into CleanShare to remove tracking parameters

### Unknown Platforms

Unsupported URLs undergo standard tracking parameter removal (`utm_*`, `gclid`, `fbclid`, ...). Platform-specific tracking may remain undetected.

## Adding a New Platform

Edit `script.js` and add to `PLATFORM_RULES`:

```javascript
yourplatform: {
    domains: ['yourplatform.com'],
    removeAll: false,
    removeSelected: ['param1', 'param2'],
    keepSelected: ['id', 'slug'],
    name: 'Your Platform'
}
```
