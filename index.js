const {
  Plugin,
  Structure
} = require("moonlink.js");

class Lyrics extends Plugin {
  constructor() {
    super();
    this.name = "Lyrics";
    this._manager;
    this.initialized = false;
  }

  load(manager) {
    if (this.initialized) return;
    this._manager = manager;
    this._manager.emit("debug", `@Moonlink(Lyrics) - Plugin "Lyrics" has been loaded successfully`);
    this.initialized = true;
    this.injectCodes();
  }

  injectCodes() {
    Structure.extend("MoonlinkRestFul", MoonlinkRest => class extends MoonlinkRest {
      async searchLyrics(name) {
        return (await this.get("lyrics/search/" + name));
      }

      async getLyrics(id) {
        return (await this.get("lyrics/" + id));
      }

      async getPlayerLyrics(guildId) {
        return (await this.get(`sessions/${this.sessionId}/players/${guildId}/lyrics`));
      }
    });
    Structure.extend("MoonlinkPlayer", MoonlinkPlayer => class extends MoonlinkPlayer {
      async lyrics() {
        if (!this.current) return null;
        if (this.get("lyrics") && this.get("lyrics").identifier !== this.current.identifier) {
          let lyricIds = await this.node.rest.searchLyrics(`${this.current.title} - ${this.current.author}`) || {};
          for (const lyricObj of lyricIds) {
            if (this.get("lyrics") && this.get("lyrics").identifier == this.current.identifier && this.get("lyrics").lyricObj !== null) return this.get("lyrics").lyricObj;
            let {
              videoId
            } = lyricObj;
            let lyric = await this.node.rest.getLyrics(videoId);
            console.log(lyric, lyricObj, lyricIds)
            if (lyric.status !== 404) {
              this.set("lyrics", {
                identifier: this.current.identifier,
                lyricObj: lyric,
              });
            }
          }
          if (!this.get("lyrics") || this.get("lyrics").identifier !== this.current.identifier) {
            this.set("lyrics", {
              identifier: this.current.identifier,
              lyricObj: null,
            });
          }
          return this.get("lyrics").lyricObj;
        } else if (this.get("lyrics") && this.get("lyrics").identifier == this.current.identifier) {
          return this.get("lyrics").lyricObj;
        } else if (!this.get("lyrics")) {
          this.set("lyrics", {});
          return this.lyrics();
        }
        return this.get("lyrics").lyricObj;
      }
    });
  }
}

module.exports = {
  Lyrics
};