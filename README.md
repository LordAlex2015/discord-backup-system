# Discord Backup System
### By: ArviX#8443

**Created for [0rion Project.](https://discord.gg/RChBAj8Qep)**

## Installation
`npm install discord-backup-system`

## Usage

### Create a Backup
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.createBackup(message.guild, message.author.id, '/backup/').then(backupData => {
    message.channel.send(`This is your backup: \`${backupData.id}\``)
});
```
#### Usage

| Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| guild | Guild | Guild To Backup | None |
| authorId | Snowflake | Author of the backup | None |
| path | String | Path to save the backup | /backup/ |

#### Result

| Params | Type | Explication | 
| ----- |------| ------- | 
| id | String | Backup Id | 
| path | String | Backup Path (Path/backup_id.json) |

### Backup Info
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.backupInfo(backup_id, '/backup/').then(backupData => {
    message.channel.send(`Backup Size: ${Math.floor(backupData.size)} MB`)
});
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id to give info | None |
| path | String | Path to save the backup | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- | 
| size | Number | Size in MB | 
| backup_id | String | Backup Id |
| createdAt | Number | Creation timestamp |
| guild_base_id | Snowflake | Backup guild id |
| owner_id | Snowflake | Backup Guild owner id |
| author_id | Snowflake | Backup creator id |

### Backup Delete
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.deleteBackup(backup_id, "/backup/");
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id to give info | None |
| path | String | Path to save the backup | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- | 
| deleted | Bool | Deleted or not | 
| backup_id | String | Backup Id |

### Load Backup
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.loadBackup(backup_id, message.guild, '/backup/');
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id to give info | None |
| guild | Guild | Guild to load backup | None |
| path | String | Path to save the backup | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| backup_id | String | Backup Id |
| reversed_roles | Collection | Roles Equivalent |
| reversed_channels | Collection | Channels Equivalent |
| bans | Array | All Bans |

