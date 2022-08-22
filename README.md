# Discord Backup System
### By: ArviX#8443

**Created for [0rion Project.](https://discord.gg/RChBAj8Qep)**

## Installation
`npm install discord-backup-system`

## Patch Note:

+ Backup files are now axbs2 format. The system will automatically convert axbs1 to axbs2 format if you were using an older version of the system.
+ The backup system is now a class. It will be needed to be initialized first.
+ You can now choose the order of the loading of the backup. *I recommend you to use the default order.*
+ The Backup ID is still editable.

## Usage

### Create a Backup
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.create(message.guild, message.author.id, `${message.guild.id}-#{GEN_SHORT}#`).then(backupData => {
    message.channel.send(`This is your backup: \`${backupData.id}\``)
});
```
#### Usage

| Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| guild | Guild | Guild To Backup | None |
| authorId | Snowflake | Author of the backup | None |
| name | String | Backup Name (#{GEN}# to generated a random string and #{GEN_SHORT}# to generate a shorter strings) | Generated |

#### Result

| Params | Type | Explication                        | 
| ----- |------|------------------------------------| 
| id | String | Backup Id                          | 
| path | String | Backup Path (Path/backup_id.axbs2) |
| backup | Backup | Backup Data                        |

### Backup Info
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.getBackupInfo(backup_id).then(backupData => {
    message.channel.send(`Backup Size: ${Math.floor(backupData.size)} MB`)
});
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id to give info | None |

#### Result

| Result Params | Type | Explication                                                               | 
|---------------|------|---------------------------------------------------------------------------| 
| size          | Number | Size in MB                                                                | 
| backup_id     | String | Backup Id                                                                 |
| createdAt     | Number | Creation timestamp                                                        |
| authorId      | String | The Creator of the backup ID                                              |
| Guild         | { id: string; owner_id: string } | The guild data                                                            |
| exists        | Bool | Return if file exists ( If Not, only exists param will be returned )      |


### ~~Get All Backups~~
```js
/* NOT IMPLEMENTED YET */
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.getAllBackups(backup_id, message.guild, '/backup/');
```

#### ~~Usage~~

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |

#### ~~Result~~

| Result Params | Type | Explication | 
| ----- |------| ------- |


### Backup Delete
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.deleteBackup(backup_id);
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id | None |

#### Result

| Result Params | Type | Explication                                                           | 
| ----- |------|-----------------------------------------------------------------------| 
| backup_id | String | Backup Id                                                             |
| deleted | Bool | Deleted or not                                                        |
| exists | Bool | Return if file exists (If Not, only exists param will be in returned) |

### Load Backup
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.load(backup_id, message.guild);
```

#### Usage

| Usage Params | Type   | Explication          | Default |
|--------------|--------|----------------------| ----- |
| backup_id    | String | Backup Id            | None |
| guild        | Guild  | Guild to load backup | None |
| order        | String | Order of loading     | channels_roles&create_emojis&delete_emojis&bans&guild |

#### Result

| Result Params | Type   | Explication | 
|---------------|--------|-------------|
| Backup        | Backup | Backup Data |


### Is A Backup File?
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.isBackupFile(backup_id);
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id | None |

#### Result

| Result Params | Type | Explication                 | 
| ----- |------|-----------------------------|
 | isValidBackupFile | Bool | Is Valid Backup File        |
| isOldTimer | Bool | Is Old Timer (axbs1 format) |
| version | Number / Null | Version of the backup |
| convertible | Bool | Is the file convertible to axbs2 |

### Make Backup File Compatible
```js
const BackupSystem = require('discord-backup-system');

client.BackupSystem = new BackupSystem("/backups/");
// ... 
// Your Message Event / Command
client.BackupSystem.convertBackup(backup_id);
```

#### Usage

| Usage Params | Type | Explication | Default |
| ----- |------| ------- | ----- |
| backup_id | String |  Backup Id | None |

#### Result

| Result Params | Type | Explication                        | 
| ----- |------|------------------------------------|
| id | String | Backup Id                          |
| path | String | Backup Path (Path/backup_id.axbs2) |
| backup | Backup | Backup Data                      |


