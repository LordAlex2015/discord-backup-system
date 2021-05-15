import {Collection, DefaultMessageNotifications, Guild, SystemChannelFlags, UserFlags} from 'discord.js';
import {existsSync, readFile, statSync, unlink, writeFile, readdirSync, readFileSync} from 'fs';
import {dirname} from 'path';

declare const Buffer: { from: new (arg0: string) => string | NodeJS.ArrayBufferView; }

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function createBackup(guild: Guild, creatorID: string, path = "/backup/") {
    return new Promise((resolve) => {
        //base guild
        let guild_backup: {
            backuper: {
                id: string,
                owner_id: string,
                createdAt: number,
                creatorId: string
            },
            name: string,
            icon: string | null,
            splash: string | null,
            discoverySplash: string | null,
            region: string,
            afkTimeout: number,
            afkChannelID: string | null,
            systemChannelFlags: Readonly<SystemChannelFlags>,
            systemChannelID: string | null,
            verificationLevel: string,
            explicitContentFilter: string,
            mfaLevel: number,
            defaultMessageNotifications: number | DefaultMessageNotifications,
            vanityURLCode: string | null,
            description: string | null,
            banner: string | null,
            rulesChannelID: string | null,
            publicUpdatesChannelID:string | null,
            preferredLocale: string,
            roles: any[],
            channels: any[],
            emoji: any[],
            bans: any[]
        } = {
            backuper: {
                id: guild.id,
                owner_id: guild.ownerID,
                createdAt: Date.now(),
                creatorId: creatorID
            },
            name: guild.name,
            icon: guild.icon,
            splash: guild.splash,
            discoverySplash: guild.discoverySplash,
            region: guild.region,
            afkTimeout: guild.afkTimeout,
            afkChannelID: guild.afkChannelID,
            systemChannelFlags: guild.systemChannelFlags,
            systemChannelID: guild.systemChannelID,
            verificationLevel: guild.verificationLevel,
            explicitContentFilter: guild.explicitContentFilter,
            mfaLevel: guild.mfaLevel,
            defaultMessageNotifications: guild.defaultMessageNotifications,
            vanityURLCode: guild.vanityURLCode,
            description: guild.description,
            banner: guild.banner,
            rulesChannelID: guild.rulesChannelID,
            publicUpdatesChannelID: guild.publicUpdatesChannelID,
            preferredLocale: guild.preferredLocale,
            roles: [],
            channels: [],
            emoji: [],
            bans: []
        }
        //Roles Manager
        guild.roles.cache.each((role) => {
            let role_members: { id: string; flags: Readonly<UserFlags> | null; }[] = [];
            role.members.each((member) => {
                role_members.push({
                    id: member.user.id,
                    flags: member.user.flags
                })
            })
            guild_backup.roles.push({
                id: role.id,
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                rawPosition: role.rawPosition,
                permissions: role.permissions,
                managed: role.managed,
                mentionable: role.mentionable,
                members: role_members,
            })
        })

        //Channels Manager
        guild.channels.cache.each((channel) => {
            let permissionsOverwrites: object[] = [];
            channel.permissionOverwrites.each((permission) => {
                permissionsOverwrites.push({
                    id: permission.id,
                    type: permission.type,
                    deny: permission.deny,
                    allow: permission.allow
                })
            })

            // @ts-ignore
            guild_backup.channels.push({
                id: channel.id,
                type: channel.type,
                name: channel.name,
                rawPosition: channel.rawPosition,
                parentID: channel.parentID,
                manageable: channel.manageable,
                // @ts-ignore
                rateLimitPerUser: `${(channel.rateLimitPerUser ? channel.rateLimitPerUser : 0)}`,
                // @ts-ignore
                topic: `${(channel.topic ? channel.topic : "")}`,
                // @ts-ignore
                nsfw: `${(channel.nsfw ? channel.nsfw : false)}`,
                permissionsOverwrites: permissionsOverwrites
            })
        });

        //Emoji Manager
        guild.emojis.cache.each((emoji) => {
            let roles: string[] = [];
            emoji.roles.cache.each((role) => {
                roles.push(role.id)
            })

            guild_backup.emoji.push({
                name: emoji.name,
                url: emoji.url,
                deletable: emoji.deletable,
                roles: roles
            })
        })

        //Bans Manager
        guild.fetchBans().then(bans => {
            bans.each(ban => {
                guild_backup.bans.push({
                    id: ban.user.id,
                    reason: ban.reason
                })
            })
        })

        const backup_id = uuidv4();
        //Create Backup
        // @ts-ignore
        writeFile(`${dirname(require.main.filename)}${path}${backup_id}.json`, new Buffer.from(JSON.stringify(guild_backup)), 'utf8', function () {
        });

        resolve({
            id: backup_id,
            // @ts-ignore
            path: `${dirname(require.main.filename)}${path}${backup_id}.json`
        })
    })
}

export function backupInfo(backup_id: String, path = "/backup/") {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if(!existsSync(`${dirname(require.main.filename)}${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            // @ts-ignore
            const size = statSync(`${dirname(require.main.filename)}${path}${backup_id}.json`).size / (1024 * 1024);
            // @ts-ignore
            readFile(`${dirname(require.main.filename)}${path}${backup_id}.json`, 'utf8', function (err, data) {
                if (err) return reject(err);
                const data_json = JSON.parse(data);
                resolve({
                    size: size,
                    backup_id: backup_id,
                    guild_base_id: data_json.backuper.id,
                    createdAt: data_json.backuper.createdAt,
                    owner_id: data_json.backuper.owner_id,
                    author_id: data_json.backuper.creatorId,
                    exists: true
                })
            })
        }
    })
}

export function deleteBackup(backup_id: String, path = "/backup/") {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if(!existsSync(`${dirname(require.main.filename)}${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            // @ts-ignore
            unlink(`${dirname(require.main.filename)}${path}${backup_id}.json`, (err) => {
                if (err) return reject(err);
                resolve({
                    backup_id: backup_id,
                    deleted: true,
                    exists: true
                })
            });
        }
    })
}

export function loadBackup(backup_id: String, guild: Guild, path = "/backup/", debug = false) {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if(!existsSync(`${dirname(require.main.filename)}${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            // @ts-ignore
            readFile(`${dirname(require.main.filename)}${path}${backup_id}.json`, 'utf8', function (err, data) {
                if (err) return reject(err);
                const backup = JSON.parse(data);
                let roles = new Collection();
                let channels = new Collection();
                if(debug) console.log("Deleting roles...")
                let i = 0;
                const max_roo = guild.roles.cache.size;
                guild.roles.cache.each((role: { managed: any; name: string; delete: () => void; }) => {
                    if (!role.managed && role.name !== '@everyone') {
                        setTimeout(function () {
                            if(debug) console.log(`Deleted ${role.name} | ${i++}/${max_roo}`)
                            role.delete();
                            //i++
                            if(i === max_roo) {
                                if(debug) console.log("PART 1.1");
                                part1_1();
                            }
                        }, 300)
                    } else {
                        i++
                    }
                    if(i === max_roo) {
                        if(debug) console.log("PART 1.1");
                        part1_1();
                    }
                });

                function part1_1() {
                    let i = 0;
                    if(debug) console.log("Creating roles...")
                    const broles = backup.roles.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                        return b.rawPosition - a.rawPosition;
                    });
                    for (const role of broles) {
                        //console.log(`Attempt to ${role.name}`)
                        if (!role.managed && role.name !== "@everyone") {
                            setTimeout(function () {
                                if(debug) console.log("Creating role...")
                                guild.roles.create({
                                    data: {
                                        name: role.name,
                                        color: role.color,
                                        hoist: role.hoist,
                                        mentionable: role.mentionable,
                                        //position: role.rawPosition,
                                        permissions: role.permissions
                                    }
                                }).then((new_role) => {
                                    if(debug) console.log(`Created ${role.name} | ${i}/${broles.length}`)
                                    roles.set(role.id, {
                                        old_id: role.id,
                                        new_id: new_role.id
                                    });
                                    i++
                                    for (const member of role.members) {

                                        if(!guild.members.cache.get(member.id)) {
                                            continue;
                                        } else {
                                            setTimeout(function () {
                                                // @ts-ignore
                                                if(debug) console.log("Adding role")
                                                guild.members.cache.get(member.id)?.roles?.add(new_role.id)
                                            }, 200)
                                        }
                                    }

                                    if(i === broles.length) {
                                        if(debug) console.log("PART 2")
                                        part2();
                                    }
                                })

                            }, 400)
                        } else if (role.name === '@everyone') {
                            if(debug) console.log(`Passing everyone | ${i}/${broles.length}`)
                            guild.roles.everyone.edit({
                                permissions: role.permissions
                            }).then((new_role) => {
                                //console.log(`Created ${role.name}`)
                                roles.set(role.id, {
                                    old_id: role.id,
                                    new_id: new_role.id
                                });
                                i++;
                                if(i === broles.length) {
                                    if(debug) console.log("PART 2")
                                    part2();
                                }
                            })
                        } else if(role.managed) {
                            if(debug) console.log(`Passing ${role.name} | ${i}/${broles.length}`)
                            i++
                            if(i === broles.length) {
                                if(debug) console.log("PART 2")
                                part2();
                            }
                        }
                        if(i === broles.length) {
                            if(debug) console.log("PART 2")
                            part2();
                        }
                    }
                }

                function part2() {
                    if(debug) console.log("Deleting Channels...")
                    const max_chan = guild.channels.cache.size;
                    let io = 0;
                    guild.channels.cache.each(channel => {
                        if (channel.deletable) {
                            setTimeout(function () {
                                io++
                                if(debug) console.log(`Deleted ${channel.name} | ${io}/${max_chan}`)
                                channel.delete();
                                //io++
                                if(io === max_chan-1) {
                                    if(debug) console.log("PART 2.1")
                                    part2_1();
                                }
                            }, 300)
                        }
                        if(io === max_chan-1) {
                            if(debug) console.log("PART 2.1")
                            part2_1();
                        }
                    });

                }
                function part2_1() {
                    let i = 0;
                    // @ts-ignore
                    const bchannels = backup.channels.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                        return b.rawPosition - a.rawPosition;
                    });
                    bchannels.forEach((channel: { type: string; permissionsOverwrites: any; name: string; rawPosition: any; id: unknown; }) => {
                        //console.log(`Attempt to ${channel.name}`)
                        if (channel.type === "category") {
                            setTimeout(function () {
                                let permissions = [];
                                for (const permission of channel.permissionsOverwrites) {
                                    if (!roles.get(permission.id)) {
                                        continue;
                                    } else {
                                        permissions.push({
                                            // @ts-ignore
                                            id: `${roles.get(permission.id) ? roles.get(permission.id).new_id : null}`,
                                            type: permission.type,
                                            allow: permission.allow,
                                            deny: permission.deny
                                        })
                                    }
                                }
                                //console.log(`Creating ${channel.name}`)
                                guild.channels.create(channel.name, {
                                    // @ts-ignore
                                    type: channel.type,
                                    position: channel.rawPosition,
                                    permissionOverwrites: permissions
                                }).then((new_channel) => {
                                    channels.set(channel.id, {
                                        old_id: channel.id,
                                        new_id: new_channel.id
                                    })
                                    i++
                                    if(i === bchannels.length) {
                                        if(debug) console.log("PART 2.2")
                                        part2_2();
                                    }
                                })
                            }, 400)
                        } else {
                            i++
                        }
                        if(i === bchannels.length) {
                            if(debug) console.log("PART 2.2")
                            part2_2();
                        }
                    })
                }
                function part2_2() {
                    let i = 0;
                    const bchannels = backup.channels.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                        return a.rawPosition - b.rawPosition;
                    });
                    bchannels.forEach((channel: { type: string; permissionsOverwrites: any; parentID: unknown; name: string; rawPosition: any; topic: any; nsfw: any; bitrate: any; userLimit: any; rateLimitPerUser: string; }) => {
                        //console.log(`Attempt to ${channel.name}`)
                        if (channel.type !== "category") {
                            setTimeout(function () {
                                let permissions = [];
                                for (const permission of channel.permissionsOverwrites) {
                                    if (!roles.get(permission.id)) {
                                        continue;
                                    } else {
                                        // @ts-ignore
                                        permissions.push({
                                            // @ts-ignore
                                            id: `${roles.get(permission.id) ? roles.get(permission.id).new_id : null}`,
                                            type: permission.type,
                                            allow: permission.allow,
                                            deny: permission.deny
                                        })
                                    }
                                }
                                //console.log(`Creating ${channel.name}`)
                                let parent = null;
                                if (channels.get(channel.parentID)) {
                                    // @ts-ignore
                                    parent = channels.get(channel.parentID).new_id;
                                }
                                if(channel.type.toLowerCase() === "news") {
                                    channel.type = "text"
                                }
                                //console.log(channel.type)
                                guild.channels.create(channel.name, {
                                    // @ts-ignore
                                    type: channel.type,
                                    //position: channel.rawPosition,
                                    topic: channel.topic,
                                    nsfw: channel.nsfw,
                                    bitrate: channel.bitrate,
                                    userLimit: channel.userLimit,
                                    rateLimitPerUser: parseInt(`${channel.rateLimitPerUser !== '' ? channel.rateLimitPerUser : 0}`),
                                    permissionOverwrites: permissions,
                                    parent: parent
                                })
                                i++
                                if(i === bchannels.length) {
                                    if(debug) console.log("PART 3")
                                    part3();
                                }
                            }, 400)
                        } else {
                            i++

                        }
                        if(i === bchannels.length) {
                            if(debug) console.log("PART 3")
                            part3();
                        }
                    })
                }

                function part3() {
                    let ie = 0;
                    const max_emot = guild.emojis.cache.size;
                    guild.emojis.cache.each(emoji => {
                        if (emoji.deletable) {
                            setTimeout(function () {
                                emoji.delete();
                                ie++;
                                if(ie === max_emot-1) {
                                    if(debug) console.log("PART 3.1");
                                    part3_1();
                                }
                            }, 100)
                        }
                    });
                    if(ie === max_emot) {
                        if(debug) console.log("PART 3.1");
                        part3_1();
                    }

                }

                function part3_1() {
                    for (const emoji of backup.emoji) {
                        setTimeout(function () {
                            guild.emojis.create(emoji.url, emoji.name, {
                                roles: emoji.roles || []
                            })
                        }, 100)
                    }

                    for (const ban of backup.bans) {
                        setTimeout(function () {
                            guild.members.ban(ban.id, {
                                reason: ban.reason
                            })
                        }, 100)
                    }
                    let afkChannel = null;
                    let systemChannel = null;
                    let rulesChannel = null;
                    let publicUpdatesChannel = null;
                    if (channels.get(backup.afkChannelID)) {
                        // @ts-ignore
                        afkChannel = channels.get(backup.afkChannelID).new_id;
                    }
                    if (channels.get(backup.systemChannelID)) {
                        // @ts-ignore
                        systemChannel = channels.get(backup.systemChannelID).new_id;
                    }
                    if (channels.get(backup.rulesChannelID)) {
                        // @ts-ignore
                        rulesChannel = channels.get(backup.rulesChannelID).new_id;
                    }
                    if (channels.get(backup.publicUpdatesChannelID)) {
                        // @ts-ignore
                        publicUpdatesChannel = channels.get(backup.publicUpdatesChannelID).new_id;
                    }

                    guild.edit({
                        name: backup.name,
                        region: backup.region,
                        verificationLevel: backup.verificationLevel,
                        explicitContentFilter: backup.explicitContentFilter,
                        afkChannel: afkChannel,
                        systemChannel: systemChannel,
                        afkTimeout: backup.afkTimeout,
                        icon: backup.icon,
                        splash: backup.splash,
                        discoverySplash: backup.discoverySplash,
                        banner: backup.banner,
                        defaultMessageNotifications: backup.defaultMessageNotifications,
                        systemChannelFlags: backup.systemChannelFlags,
                        rulesChannel: rulesChannel,
                        publicUpdatesChannel: publicUpdatesChannel,
                        preferredLocale: backup.preferredLocale
                    })

                    resolve({
                        backup_id: backup_id,
                        reversed_roles: roles,
                        reversed_channels: channels,
                        bans: backup.bans,
                        exists: true
                    })
                }

            })
        }
    })
}

export function getBackupRAW(backup_id: String, path = "/backup/") {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if(!existsSync(`${dirname(require.main.filename)}${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            // @ts-ignore
            readFile(`${dirname(require.main.filename)}${path}${backup_id}.json`, 'utf8', function (err, data) {
                if (err) return reject(err);
                const data_json = JSON.parse(data);
                resolve({
                    backup_id: backup_id,
                    // @ts-ignore
                    path: `${dirname(require.main.filename)}${path}${backup_id}.json`,
                    backup: data_json,
                    exists: true
                })
            })
        }
    })
}

export function getAllBackups(path = '/backup/') {
    return new Promise(resolve => {
        // @ts-ignore
        const files = readdirSync(`${dirname(require.main.filename)}${path}`);
        let backups: {
            backup_id: string;
            // @ts-ignore
            path: string; guild_base_id: string; createdAt: string; owner_id: string; author_id: string; size: number;
        }[] = [];
        const start = Date.now()
        let count = 0
        let count2 = 0
        let count3 = 0
        files.forEach((e) => {
            try {
                const fileName = e.split('.')[0];
                if(e.endsWith('json')) {
                    count3++
                }
                if(e.endsWith('json')) {
                    // @ts-ignore
                    const size = statSync(`${dirname(require.main.filename)}${path}${fileName}.json`).size / (1024 * 1024);
                console.log("H")
                    // @ts-ignore
                   readFile(`${dirname(require.main.filename)}${path}${fileName}.json`, 'utf8', function(err, data) {
                        if (err) return console.error(err);
                        console.log("HE")
                        const data_json = JSON.parse(data);
                        backups.push({
                            backup_id: fileName,
                            // @ts-ignore
                            path: `${dirname(require.main.filename)}${path}${fileName}.json`,
                            guild_base_id: data_json.backuper.id,
                            createdAt: data_json.backuper.createdAt,
                            owner_id: data_json.backuper.owner_id,
                            author_id: data_json.backuper.creatorId,
                            size: size
                        })
                       console.log("HEY")
                        count++
                         count2++
                       if(count2 === files.length && count3 === count3) {
                           const finish = Date.now()
                           resolve({
                               backups: backups,
                               time_elapsed: finish - start,
                               fetched_backups: count,
                               fetched_files: count2,
                               fetched_json_files: count3
                           })
                       }
                    })
                } else {
                    count2++
                }
                if(count2 === files.length && count3 === count3) {
                    const finish = Date.now()
                    resolve({
                        backups: backups,
                        time_elapsed: finish - start,
                        fetched_backups: count,
                        fetched_files: count2,
                        fetched_json_files: count3
                    })
                }
            } catch (error) {
                throw new Error(`Failed to fetch file ${e}: ${error.stack || error}`)
            }
        });

    })
}
