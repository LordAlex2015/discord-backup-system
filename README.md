# Discord Backup System
### By: ArviX#8443

**Created for [0rion Project.](https://discord.gg/RChBAj8Qep)**

## Installation
`npm install discord-backup-system`

## Dev Note:

+ **I changed the file type to `axbs1`. To make the transition easier for you, I made some functions: `isBackupFile` and `makeBackupFileCompatible`.**
+ Added custom backup names!

## Usage

### Create a Backup
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.createBackup(message.guild, message.author.id, '/backup/', `${message.guild.id}-#{GEN_SHORT}#`).then(backupData => {
    message.channel.send(`This is your backup: \`${backupData.id}\``)
});
```
#### Usage

| Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| guild | Guild | Guild To Backup | None |
| authorId | Snowflake | Author of the backup | None |
| path | String | Path to save the backup | /backup/ |
| name | String | Backup Name (#{GEN}# to generated a random string and #{GEN_SHORT}# to generate a shorter strings) | Generated |

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
| path | String | Path | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- | 
| size | Number | Size in MB | 
| backup_id | String | Backup Id |
| createdAt | Number | Creation timestamp |
| guild_base_id | Snowflake | Backup guild id |
| owner_id | Snowflake | Backup Guild owner id |
| author_id | Snowflake | Backup creator id |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

### Raw Backup Info
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.getBackupRAW(backup_id, message.guild, '/backup/');
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id to give info | None |
| path | String | Path | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| backup_id | String | Backup Id |
| path | String | Backup file path |
| backup | Object | Backup file content |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

### Get All Backups
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.getAllBackups(backup_id, message.guild, '/backup/');
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| path | String | Path | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| backups | Array | Array of backups infos (Same as backupInfo) |
| time_elapsed | Number | Backup file path |
| fetched | Number | Total of backup files fetched |


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
| backup_id | String |  Backup Id | None |
| path | String | Path | /backup/ |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- | 
| deleted | Bool | Deleted or not | 
| backup_id | String | Backup Id |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

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
| backup_id | String |  Backup Id | None |
| guild | Guild | Guild to load backup | None |
| path | String | Path  | /backup/ 
| debug | Bool | Debug Mode | false |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| backup_id | String | Backup Id |
| reversed_roles | Collection | Roles Equivalent |
| reversed_channels | Collection | Channels Equivalent |
| bans | Array | All Bans |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

### Is A Backup File?
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.isBackupFile(backup_id, '/backup/', true);
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id | None |
| path | String | Path | /backup/ |
| makeItCompatible | Bool | If the backup is compatible, it will create a valid backup file (.axbs1) | false |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| isBackupFile | Bool | If the file is a valid backup file (.axbs1) |
| isCompatible | Bool | If the file is compatible to reformating |
| isReformated | Bool | If the file was reformated |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

### Make Backup File Compatible
```js
const backup = require('discord-backup-system');

// ... 
// Your Message Event / Command
backup.makeBackupFileCompatible(backup_id, '/backup/', true);
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id | None |
| path | String | Path | /backup/ |
| deleteOld | Bool | If the backup is compatible, it will create a valid backup file (.axbs1) | true |

#### Result

| Result Params | Type | Explication | 
| ----- |------| ------- |
| reformated | Bool | Is the file was reformated |
| deletedOld | Bool | If the old backup file was deleted |
| exists | Bool | Return if file exists (If Not only exists will be in results) |

