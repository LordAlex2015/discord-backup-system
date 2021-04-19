import {Collection, DefaultMessageNotifications, Guild, SystemChannelFlags, UserFlags} from 'discord.js';
import {existsSync, readFile, statSync, unlink, writeFile} from 'fs';

declare const Buffer: { from: new (arg0: string) => string | NodeJS.ArrayBufferView; }

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
        writeFile(`${path}${backup_id}.json`, new Buffer.from(JSON.stringify(guild_backup)), 'utf8', function () {
        });

        resolve({
            id: backup_id,
            path: `${path}${backup_id}.json`
        })
    })
}

export function backupInfo(backup_id: String, path = "/backup/") {
    return new Promise((resolve, reject) => {
        if(!existsSync(`${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            const size = statSync(`${backup_id}.json`).size / (1024 * 1024);
            readFile(`${path}${backup_id}.json`, 'utf8', function (err, data) {
                if (err) return reject(err);
                const data_json = JSON.parse(data);
                resolve({
                    size: size,
                    backup_id: backup_id,
                    guild_base_id: data_json.backuper.id,
                    createdAt: data_json.backuper.createdAt,
                    owner_id: data_json.backuper.owner_id,
                    author_id: data_json.backup.author_id,
                    exists: true
                })
            })
        }
    })
}

export function deleteBackup(backup_id: String, path = "/backup/") {
    return new Promise((resolve, reject) => {
        if(!existsSync(`${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            unlink(`${path}${backup_id}.json`, (err) => {
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

export function loadBackup(backup_id: String, guild: Guild, path = "/backup/") {
    return new Promise((resolve, reject) => {
        if(!existsSync(`${path}${backup_id}.json`)) {
            resolve({
                exists: false
            })
        } else {
            readFile(`${path}${backup_id}.json`, 'utf8', function (err, data) {
                if (err) return reject(err);
                const backup = JSON.parse(data);
                let roles = new Collection();
                let channels = new Collection();
                guild.roles.cache.each((role: { managed: any; name: string; delete: () => void; }) => {
                    if (!role.managed && role.name !== '@everyone') {
                        setTimeout(function () {
                            //console.log(`Deleted ${role.name}`)
                            role.delete();
                        }, 100)
                    }
                });
                for (const role of backup.roles.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                    return b.rawPosition - a.rawPosition;
                })) {
                    //console.log(`Attempt to ${role.name}`)
                    if (!role.managed && role.name !== "@everyone") {
                        setTimeout(function () {
                            guild.roles.create({
                                data: {
                                    name: role.name,
                                    color: role.color,
                                    hoist: role.hoist,
                                    mentionable: role.mentionable,
                                    position: role.rawPosition,
                                    permissions: role.permissions
                                }
                            }).then((new_role) => {
                                //console.log(`Created ${role.name}`)
                                roles.set(role.id, {
                                    old_id: role.id,
                                    new_id: new_role.id
                                });
                                for (const member of role.members) {
                                    setTimeout(function () {
                                        // @ts-ignore
                                        guild.members.cache.get(member.id)?.roles?.add(new_role.id)
                                    }, 100)
                                }
                            })
                        }, 200)
                    } else if (role.name === '@everyone') {
                        guild.roles.everyone.edit({
                            permissions: role.permissions
                        }).then((new_role) => {
                            //console.log(`Created ${role.name}`)
                            roles.set(role.id, {
                                old_id: role.id,
                                new_id: new_role.id
                            });
                        })
                    }
                }
                guild.channels.cache.each(channel => {
                    if (channel.deletable) {
                        setTimeout(function () {
                            channel.delete();
                        }, 100)
                    }
                });
                // @ts-ignore
                backup.channels.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                    return b.rawPosition - a.rawPosition;
                }).forEach((channel: { type: string; permissionsOverwrites: any; name: string; rawPosition: any; id: unknown; }) => {
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
                            })
                        }, 200)
                    }
                })
                backup.channels.sort(function (a: { rawPosition: number; }, b: { rawPosition: number; }) {
                    return b.rawPosition - a.rawPosition;
                }).forEach((channel: { type: string; permissionsOverwrites: any; parentID: unknown; name: string; rawPosition: any; topic: any; nsfw: any; bitrate: any; userLimit: any; rateLimitPerUser: string; }) => {
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
                            guild.channels.create(channel.name, {
                                // @ts-ignore
                                type: channel.type,
                                position: channel.rawPosition,
                                topic: channel.topic,
                                nsfw: channel.nsfw,
                                bitrate: channel.bitrate,
                                userLimit: channel.userLimit,
                                rateLimitPerUser: parseInt(`${channel.rateLimitPerUser !== '' ? channel.rateLimitPerUser : 0}`),
                                permissionOverwrites: permissions,
                                parent: parent
                            })
                        }, 200)
                    }
                })


                guild.emojis.cache.each(emoji => {
                    if (emoji.deletable) {
                        setTimeout(function () {
                            emoji.delete();
                        }, 100)
                    }
                });
                for (const emoji of backup.emoji) {
                    setTimeout(function () {
                        guild.emojis.create(emoji.url, emoji.name, {
                            roles: emoji.roles
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

                setTimeout(function () {
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
                }, 10000)
            })
        }
    })
}

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
