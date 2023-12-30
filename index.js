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
        return (await this.node.rest.getPlayerLyrics(this.guildId));
      }
    });
  }
}

module.exports = {
  Lyrics
};