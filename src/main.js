"use strict";
exports.__esModule = true;
exports.loadBackup = exports.deleteBackup = exports.backupInfo = exports.createBackup = void 0;
var discord_js_1 = require("discord.js");
var fs_1 = require("fs");
function createBackup(guild, creatorID, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve) {
        //base guild
        var guild_backup = {
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
        };
        //Roles Manager
        guild.roles.cache.each(function (role) {
            var role_members = [];
            role.members.each(function (member) {
                role_members.push({
                    id: member.user.id,
                    flags: member.user.flags
                });
            });
            guild_backup.roles.push({
                id: role.id,
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                rawPosition: role.rawPosition,
                permissions: role.permissions,
                managed: role.managed,
                mentionable: role.mentionable,
                members: role_members
            });
        });
        //Channels Manager
        guild.channels.cache.each(function (channel) {
            var permissionsOverwrites = [];
            channel.permissionOverwrites.each(function (permission) {
                permissionsOverwrites.push({
                    id: permission.id,
                    type: permission.type,
                    deny: permission.deny,
                    allow: permission.allow
                });
            });
            // @ts-ignore
            guild_backup.channels.push({
                id: channel.id,
                type: channel.type,
                name: channel.name,
                rawPosition: channel.rawPosition,
                parentID: channel.parentID,
                manageable: channel.manageable,
                // @ts-ignore
                rateLimitPerUser: "" + (channel.rateLimitPerUser ? channel.rateLimitPerUser : 0),
                // @ts-ignore
                topic: "" + (channel.topic ? channel.topic : ""),
                // @ts-ignore
                nsfw: "" + (channel.nsfw ? channel.nsfw : false),
                permissionsOverwrites: permissionsOverwrites
            });
        });
        //Emoji Manager
        guild.emojis.cache.each(function (emoji) {
            var roles = [];
            emoji.roles.cache.each(function (role) {
                roles.push(role.id);
            });
            guild_backup.emoji.push({
                name: emoji.name,
                url: emoji.url,
                deletable: emoji.deletable,
                roles: roles
            });
        });
        //Bans Manager
        guild.fetchBans().then(function (bans) {
            bans.each(function (ban) {
                guild_backup.bans.push({
                    id: ban.user.id,
                    reason: ban.reason
                });
            });
        });
        var backup_id = uuidv4();
        //Create Backup
        fs_1.writeFile("" + path + backup_id + ".json", new Buffer.from(JSON.stringify(guild_backup)), 'utf8', function () {
        });
        resolve({
            id: backup_id,
            path: "" + path + backup_id + ".json"
        });
    });
}
exports.createBackup = createBackup;
function backupInfo(backup_id, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        var size = fs_1.statSync(backup_id + ".json").size / (1024 * 1024);
        fs_1.readFile("" + path + backup_id + ".json", 'utf8', function (err, data) {
            if (err)
                return reject(err);
            var data_json = JSON.parse(data);
            resolve({
                size: size,
                backup_id: backup_id,
                guild_base_id: data_json.backuper.id,
                createdAt: data_json.backuper.createdAt,
                owner_id: data_json.backuper.owner_id,
                author_id: data_json.backup.author_id
            });
        });
    });
}
exports.backupInfo = backupInfo;
function deleteBackup(backup_id, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        fs_1.unlink("" + path + backup_id + ".json", function (err) {
            if (err)
                return reject(err);
            resolve({
                backup_id: backup_id,
                deleted: true
            });
        });
    });
}
exports.deleteBackup = deleteBackup;
function loadBackup(backup_id, guild, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        fs_1.readFile("" + path + backup_id + ".json", 'utf8', function (err, data) {
            if (err)
                return reject(err);
            var backup = JSON.parse(data);
            var roles = new discord_js_1.Collection();
            var channels = new discord_js_1.Collection();
            guild.roles.cache.each(function (role) {
                if (!role.managed && role.name !== '@everyone') {
                    setTimeout(function () {
                        //console.log(`Deleted ${role.name}`)
                        role["delete"]();
                    }, 100);
                }
            });
            var _loop_1 = function (role) {
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
                        }).then(function (new_role) {
                            //console.log(`Created ${role.name}`)
                            roles.set(role.id, {
                                old_id: role.id,
                                new_id: new_role.id
                            });
                            var _loop_4 = function (member) {
                                setTimeout(function () {
                                    var _a, _b;
                                    // @ts-ignore
                                    (_b = (_a = guild.members.cache.get(member.id)) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.add(new_role.id);
                                }, 100);
                            };
                            for (var _i = 0, _a = role.members; _i < _a.length; _i++) {
                                var member = _a[_i];
                                _loop_4(member);
                            }
                        });
                    }, 200);
                }
                else if (role.name === '@everyone') {
                    guild.roles.everyone.edit({
                        permissions: role.permissions
                    }).then(function (new_role) {
                        //console.log(`Created ${role.name}`)
                        roles.set(role.id, {
                            old_id: role.id,
                            new_id: new_role.id
                        });
                    });
                }
            };
            for (var _i = 0, _a = backup.roles; _i < _a.length; _i++) {
                var role = _a[_i];
                _loop_1(role);
            }
            setTimeout(function () {
                guild.channels.cache.each(function (channel) {
                    if (channel.deletable) {
                        setTimeout(function () {
                            channel["delete"]();
                        }, 100);
                    }
                });
                var _loop_5 = function (channel) {
                    //console.log(`Attempt to ${channel.name}`)
                    if (channel.type === "category") {
                        setTimeout(function () {
                            var permissions = [];
                            for (var _i = 0, _a = channel.permissionsOverwrites; _i < _a.length; _i++) {
                                var permission = _a[_i];
                                if (!roles.get(permission.id)) {
                                    continue;
                                }
                                else {
                                    permissions.push({
                                        // @ts-ignore
                                        id: "" + (roles.get(permission.id) ? roles.get(permission.id).new_id : null),
                                        type: permission.type,
                                        allow: permission.allow,
                                        deny: permission.deny
                                    });
                                }
                            }
                            //console.log(`Creating ${channel.name}`)
                            guild.channels.create(channel.name, {
                                type: channel.type,
                                position: channel.rawPosition,
                                permissionOverwrites: permissions
                            }).then(function (new_channel) {
                                channels.set(channel.id, {
                                    old_id: channel.id,
                                    new_id: new_channel.id
                                });
                            });
                        }, 200);
                    }
                };
                // @ts-ignore
                for (var _i = 0, _a = backup.channels; _i < _a.length; _i++) {
                    var channel = _a[_i];
                    _loop_5(channel);
                }
                setTimeout(function () {
                    var _loop_6 = function (channel) {
                        //console.log(`Attempt to ${channel.name}`)
                        if (channel.type !== "category") {
                            setTimeout(function () {
                                var permissions = [];
                                for (var _i = 0, _a = channel.permissionsOverwrites; _i < _a.length; _i++) {
                                    var permission = _a[_i];
                                    if (!roles.get(permission.id)) {
                                        continue;
                                    }
                                    else {
                                        // @ts-ignore
                                        permissions.push({
                                            // @ts-ignore
                                            id: "" + (roles.get(permission.id) ? roles.get(permission.id).new_id : null),
                                            type: permission.type,
                                            allow: permission.allow,
                                            deny: permission.deny
                                        });
                                    }
                                }
                                //console.log(`Creating ${channel.name}`)
                                var parent = null;
                                if (channels.get(channel.parentID)) {
                                    // @ts-ignore
                                    parent = channels.get(channel.parentID).new_id;
                                }
                                guild.channels.create(channel.name, {
                                    type: channel.type,
                                    position: channel.rawPosition,
                                    topic: channel.topic,
                                    nsfw: channel.nsfw,
                                    bitrate: channel.bitrate,
                                    userLimit: channel.userLimit,
                                    rateLimitPerUser: parseInt("" + (channel.rateLimitPerUser !== '' ? channel.rateLimitPerUser : 0)),
                                    permissionOverwrites: permissions,
                                    parent: parent
                                });
                            }, 200);
                        }
                    };
                    // @ts-ignore
                    for (var _i = 0, _a = backup.channels; _i < _a.length; _i++) {
                        var channel = _a[_i];
                        _loop_6(channel);
                    }
                }, 1000);
            }, 3000);
            guild.emojis.cache.each(function (emoji) {
                if (emoji.deletable) {
                    setTimeout(function () {
                        emoji["delete"]();
                    }, 100);
                }
            });
            var _loop_2 = function (emoji) {
                setTimeout(function () {
                    guild.emojis.create(emoji.url, emoji.name, {
                        roles: emoji.roles
                    });
                }, 100);
            };
            for (var _b = 0, _c = backup.emoji; _b < _c.length; _b++) {
                var emoji = _c[_b];
                _loop_2(emoji);
            }
            var _loop_3 = function (ban) {
                setTimeout(function () {
                    guild.members.ban(ban.id, {
                        reason: ban.reason
                    });
                }, 100);
            };
            for (var _d = 0, _e = backup.bans; _d < _e.length; _d++) {
                var ban = _e[_d];
                _loop_3(ban);
            }
            setTimeout(function () {
                var afkChannel = null;
                var systemChannel = null;
                var rulesChannel = null;
                var publicUpdatesChannel = null;
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
                });
                resolve({
                    backup_id: backup_id,
                    reversed_roles: roles,
                    reversed_channels: channels,
                    bans: backup.bans
                });
            }, 10000);
        });
    });
}
exports.loadBackup = loadBackup;
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
