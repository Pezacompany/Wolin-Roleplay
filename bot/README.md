# Bot

## Setup

```bash
npm install
cp .env.example .env
npm run deploy-commands
npm start
```

For VPS production:

```bash
npm install --omit=dev
npm run deploy-commands
pm2 start ecosystem.config.cjs
pm2 save
```

The bot needs these Discord permissions:

- Manage Roles
- Use Slash Commands
- Read Messages/View Channels

The bot role must be higher than the `Obywatel` role and any role it needs to inspect.

