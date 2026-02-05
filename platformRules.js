"use strict";

const PLATFORM_RULES = {
  instagram: {
    domains: ["instagram.com"],
    removeAll: true,
    name: "Instagram",
  },
  spotify: {
    domains: ["open.spotify.com"],
    removeAll: false,
    removeSelected: [
      "si",
      "sp_cid",
      "go",
      "dl_branch",
    ],
    name: "Spotify",
  },
  tiktok: {
    domains: ["tiktok.com"],
    removeAll: false,
    removeSelected: [
      "_t",
      "_r",
      "ttclid",
      "sec_uid",
      "u_code",
    ],
    name: "TikTok",
  },
  youtube: {
    domains: ["youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"],
    removeAll: false,
    keepSelected: ["v", "t", "list", "start", "end", "index"],
    removeSelected: [
      "si",
      "pp",
      "feature",
    ],
    name: "YouTube",
  },
  twitter: {
    domains: ["twitter.com", "x.com", "mobile.twitter.com", "mobile.x.com"],
    removeAll: true,
    name: "Twitter/X",
  },
  facebook: {
    domains: ["facebook.com", "fb.com", "m.facebook.com"],
    removeAll: false,
    keepSelected: ["story_fbid", "id", "u"],
    removeSelected: [
      "fbclid",
      "mibextid",
      "eav",
      "__tn__",
      "ref",
      "paipv",
    ],
    name: "Facebook",
  },
  reddit: {
    domains: ["reddit.com", "redd.it", "old.reddit.com", "new.reddit.com"],
    removeAll: false,
    keepSelected: ["context", "depth"],
    removeSelected: [
      "share_id",
      "ref",
      "ref_source",
      "fbclid",
      "gclid",
    ],
    name: "Reddit",
  },
  linkedin: {
    domains: ["linkedin.com", "lnkd.in"],
    removeAll: false,
    removeSelected: [
      "trk",
      "li_fat_id",
      "lipi",
      "trkInfo",
      "rcm",
      "origin",
    ],
    name: "LinkedIn",
  },
  pinterest: {
    domains: ["pinterest.com", "pin.it"],
    removeAll: false,
    removeSelected: [
      "source",
    ],
    name: "Pinterest",
  },
  twitch: {
    domains: ["twitch.tv", "clips.twitch.tv"],
    removeAll: false,
    removeSelected: [
      "tt_content",
      "tt_medium",
    ],
    name: "Twitch",
  },
  soundcloud: {
    domains: ["soundcloud.com", "on.soundcloud.com"],
    removeAll: false,
    removeSelected: [],
    name: "SoundCloud",
  },
  vimeo: {
    domains: ["vimeo.com"],
    removeAll: false,
    removeSelected: [],
    name: "Vimeo",
  },
};
