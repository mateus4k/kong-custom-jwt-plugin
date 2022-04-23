const jwt = require('jsonwebtoken');

class CustomJwtPlugin {
  constructor(config) {
    this.config = config;
  }

  async response(kong) {
    const status = await kong.response.getStatus();

    if (status !== 200) {
      await kong.response.exit(
        400,
        JSON.stringify({ message: 'Invalid response from upstream' })
      );
    }

    const [token, device, version] = await Promise.all([
      kong.request.getHeader('X-Token'),
      kong.request.getHeader('X-Device'),
      kong.request.getHeader('X-Version'),
    ]);

    const result = jwt.sign({ token, device, version }, this.config.secret, {
      expiresIn: 3600,
    });

    await kong.response.exit(status, JSON.stringify({ token: result }));
  }
}

module.exports = {
  Plugin: CustomJwtPlugin,
  Name: 'custom-jwt',
  Schema: [
    {
      secret: {
        type: 'string',
      },
    },
  ],
  Version: '1.0.0',
  Priority: 0,
};
