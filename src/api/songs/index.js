const OpenMusicHandler = require('./Handler');
const routes = require('./routes');

module.exports = {
  name: 'openmusic',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const openMusicHandler = new OpenMusicHandler(service, validator);
    server.route(routes(openMusicHandler));
  },
};