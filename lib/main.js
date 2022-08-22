"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupSystem = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
class BackupSystem {
    constructor(path = "/backup/") {
        this.path = path.replace(/\//g, "\\");
    }
    prepareRoles(roleManager, guildId) {
        return new Promise((resolve) => {
            let roles = [];
            roleManager.cache.each((role) => {
                let role_members = [];
                role.members.each((member) => {
                    role_members.push({
                        id: member.user.id,
                        flags: member.user.flags
                    });
                });
                if (!role.managed && role.id !== guildId)
                    roles.push({
                        id: role.id,
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        rawPosition: role.position,
                        permissions: role.permissions,
                        managed: role.managed,
                        mentionable: role.mentionable,
                        members: role_members,
                        tags: role.tags,
                        icon: role.icon
                    });
            });
            resolve(roles);
        });
    }
    prepareChannels(channelManager) {
        return new Promise((resolve) => {
            let channels = [];
            channelManager.cache.each((channel) => {
                var _a, _b, _c;
                let permissionsOverwrites = [];
                if (!(channel instanceof discord_js_1.ThreadChannel)) {
                    channel.permissionOverwrites.cache.each((permission) => {
                        permissionsOverwrites.push({
                            id: permission.id,
                            type: permission.type,
                            deny: permission.deny,
                            allow: permission.allow
                        });
                    });
                    let threads = [];
                    if (channel.threads) {
                        channel.threads.cache.each((thread) => {
                            threads.push({
                                id: thread.id,
                                type: thread.type,
                                name: thread.name,
                                ownerId: thread.ownerId,
                                joinable: thread.joinable,
                                editable: thread.editable,
                                locked: thread.locked,
                                parentID: thread.parentId,
                                manageable: thread.manageable,
                                rateLimitPerUser: thread.rateLimitPerUser,
                                autoArchiveDuration: thread.autoArchiveDuration,
                                archived: thread.archived
                            });
                        });
                    }
                    channels.push({
                        id: channel.id,
                        type: channel.type,
                        name: channel.name,
                        rawPosition: channel.rawPosition,
                        parentID: channel.parentId,
                        manageable: channel.manageable,
                        rateLimitPerUser: ((_a = channel) === null || _a === void 0 ? void 0 : _a.rateLimitPerUser) || 0,
                        topic: ((_b = channel) === null || _b === void 0 ? void 0 : _b.topic) || "",
                        nsfw: ((_c = channel) === null || _c === void 0 ? void 0 : _c.nsfw) || false,
                        permissionsOverwrites: permissionsOverwrites,
                        threads: threads,
                        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration
                    });
                }
            });
            resolve(channels);
        });
    }
    prepareEmojis(emojiManager) {
        return new Promise((resolve) => {
            let emojis = [];
            emojiManager.cache.each((emoji) => {
                let roles = [];
                emoji.roles.cache.each((role) => {
                    roles.push(role.id);
                });
                emojis.push({
                    name: emoji.name,
                    url: emoji.url,
                    deletable: emoji.deletable,
                    roles: roles
                });
            });
            resolve(emojis);
        });
    }
    prepareBans(banManager) {
        return new Promise((resolve) => {
            let bans = [];
            banManager.cache.each((ban) => {
                bans.push({
                    id: ban.user.id,
                    reason: ban.reason
                });
            });
            resolve(bans);
        });
    }
    createCategories(categories, channelManager, roleCorrespondence, interval = 150) {
        return new Promise((resolve) => {
            const categoriesCorrespondence = new Map();
            let i = 0;
            for (const category of categories.sort((a, b) => a.rawPosition - b.rawPosition)) {
                setTimeout(async () => {
                    for (const perms of category.permissionsOverwrites) {
                        if (perms.type === "role") {
                            const indx = category.permissionsOverwrites.findIndex((perm) => perm.id === perms.id);
                            if (!roleCorrespondence.get(perms.id))
                                continue;
                            perms.id = roleCorrespondence.get(perms.id);
                            category.permissionsOverwrites[indx] = perms;
                        }
                    }
                    let channel = await channelManager.create(category.name, {
                        type: "GUILD_CATEGORY",
                        permissionOverwrites: category.permissionsOverwrites,
                        nsfw: category.nsfw,
                        topic: category.topic,
                        rateLimitPerUser: category.rateLimitPerUser,
                    });
                    categoriesCorrespondence.set(category.id, channel.id);
                    i++;
                    if (i === categories.length)
                        resolve(categoriesCorrespondence);
                }, interval);
            }
        });
    }
    ;
    createChannels(channels, channelManager, categoriesCorrespondence, roleCorrespondence, interval = 150) {
        return new Promise((resolve) => {
            const channelsCorrespondence = new Map();
            for (const channel of channels.sort((a, b) => a.rawPosition - b.rawPosition)) {
                setTimeout(async () => {
                    let categoryId = categoriesCorrespondence.get(channel.parentID);
                    for (const perms of channel.permissionsOverwrites) {
                        if (perms.type === "role") {
                            const indx = channel.permissionsOverwrites.findIndex((perm) => perm.id === perms.id);
                            if (!roleCorrespondence.get(perms.id))
                                continue;
                            perms.id = roleCorrespondence.get(perms.id);
                            channel.permissionsOverwrites[indx] = perms;
                        }
                    }
                    // @ts-ignore
                    const channe = await channelManager.create(channel.name, {
                        type: channel.type,
                        nsfw: channel.nsfw,
                        parent: categoryId,
                        permissionOverwrites: channel.permissionsOverwrites,
                        topic: channel.topic,
                        rateLimitPerUser: channel.rateLimitPerUser,
                        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration
                    });
                    channelsCorrespondence.set(channel.id, channe.id);
                }, interval);
            }
            resolve(channelsCorrespondence);
        });
    }
    ;
    createRoles(roles, roleManager, membersManager, interval = 150) {
        return new Promise((resolve) => {
            const rolesCorrespondence = new Map();
            let i = 0;
            for (const role of roles.sort((a, b) => b.rawPosition - a.rawPosition)) {
                setTimeout(async () => {
                    const roleObj = await roleManager.create({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        mentionable: role.mentionable,
                        permissions: role.permissions,
                        //position: role.rawPosition+1,
                        icon: role.icon,
                    });
                    membersManager.cache.each((member) => {
                        if (role.members.find(u => u.id === member.id)) {
                            member.roles.add(roleObj);
                        }
                    });
                    rolesCorrespondence.set(role.id, roleObj.id);
                    i++;
                    if (i === roles.length)
                        resolve(rolesCorrespondence);
                }, interval);
            }
        });
    }
    ;
    createEmojis(emotes, emojiManager, interval = 150) {
        return new Promise((resolve) => {
            emotes.forEach((emoji) => {
                setTimeout(async () => {
                    await emojiManager.create(emoji.url, emoji.name, {
                        roles: emoji.roles
                    }).catch(() => { });
                }, interval);
            });
            resolve();
        });
    }
    ;
    createBans(bans, banManager, interval = 150) {
        return new Promise((resolve) => {
            bans.forEach(async (ban) => {
                setTimeout(async () => {
                    await banManager.create(ban.id, {
                        reason: (ban.reason || "") + " (Backup)"
                    });
                }, interval);
            });
            resolve();
        });
    }
    ;
    changeGuild(backup, guild) {
        return new Promise((resolve) => {
            if (backup.guild.name)
                guild.setName(backup.guild.name);
            if (backup.guild.icon)
                guild.setIcon(backup.guild.icon);
            if (backup.guild.verificationLevel)
                guild.setVerificationLevel(backup.guild.verificationLevel);
            if (backup.guild.explicitContentFilter)
                guild.setExplicitContentFilter(backup.guild.explicitContentFilter);
            if (backup.guild.defaultMessageNotifications)
                guild.setDefaultMessageNotifications(backup.guild.defaultMessageNotifications);
            if (backup.guild.afkChannelID)
                guild.setAFKChannel(backup.guild.afkChannelID);
            if (backup.guild.afkTimeout)
                guild.setAFKTimeout(backup.guild.afkTimeout);
            if (backup.guild.systemChannelID)
                guild.setSystemChannel(backup.guild.systemChannelID);
            if (backup.guild.rulesChannelID)
                guild.setRulesChannel(backup.guild.rulesChannelID);
            if (backup.guild.publicUpdatesChannelID)
                guild.setPublicUpdatesChannel(backup.guild.publicUpdatesChannelID);
            if (backup.guild.discoverySplash)
                guild.setDiscoverySplash(backup.guild.discoverySplash);
            if (backup.guild.systemChannelFlags)
                guild.setSystemChannelFlags(backup.guild.systemChannelFlags);
            if (backup.guild.splash)
                guild.setSplash(backup.guild.splash);
            if (backup.guild.banner)
                guild.setBanner(backup.guild.banner);
            resolve();
        });
    }
    load(backupID, guild, order = "channels_roles&create_emojis&delete_emojis&bans&guild") {
        return new Promise((resolve) => {
            if (!this.verifyExistence(backupID, "axbs2")) {
                // Check older version
                if (!this.verifyExistence(backupID, "axbs1")) {
                    this.createError("FILE_DOESNT_EXIST", { id: backupID });
                }
                else {
                    // Convert to new version
                    this.convertBackup(backupID).then(() => {
                        resolve(this.load(backupID, guild, order));
                    });
                }
            }
            else {
                this.getBackup(backupID).then((backup) => {
                    this.loadBackup(backup, guild, order).then(() => {
                        resolve(backup);
                    });
                });
            }
        });
    }
    loadBackup(backup, guild, order = "channels_roles&create_emojis&delete_emojis&bans&guild") {
        return new Promise(async () => {
            const orderArray = order.split("&");
            for (const order of orderArray) {
                switch (order) {
                    case "channels_roles":
                        // delete roles
                        for (const role of guild.roles.cache.values()) {
                            if (role.managed || !role.editable)
                                continue;
                            await new Promise(resolve => {
                                setTimeout(async () => {
                                    role.delete().catch(() => {
                                    });
                                    resolve(true);
                                }, 150);
                            });
                        }
                        //while(guild.roles.cache.filter(r => !r.managed && r.id !== guild.id).size > 1) {}
                        // create roles
                        this.createRoles(backup.roles, guild.roles, guild.members, 150).then(async (rolesCorrespondence) => {
                            // delete channels
                            for (const channel of guild.channels.cache.values()) {
                                await setTimeout(async () => {
                                    channel.delete().catch(() => {
                                        console.error("Error deleting channel " + channel.id);
                                    });
                                }, 150);
                            }
                            // create categories
                            rolesCorrespondence.set(backup.guild._id, guild.id);
                            this.createCategories(backup.channels.filter((c) => c.type === "GUILD_CATEGORY"), guild.channels, rolesCorrespondence).then((categoriesCorrespondence) => {
                                // create channels
                                this.createChannels(backup.channels.filter((c) => c.type === "GUILD_TEXT" || c.type === "GUILD_NEWS" || c.type === "GUILD_VOICE"), guild.channels, categoriesCorrespondence, rolesCorrespondence);
                            });
                        });
                        break;
                    case "create_emojis":
                        // create emojis
                        this.createEmojis(backup.emoji, guild.emojis, 150);
                        break;
                    case "delete_emojis":
                        // delete emojis
                        guild.emojis.cache.forEach((emoji) => {
                            setTimeout(async () => {
                                emoji.delete();
                            }, 150);
                        });
                        break;
                    case "bans":
                        // create bans
                        this.createBans(backup.bans, guild.bans, 150);
                        break;
                    case "guild":
                        // change guild
                        this.changeGuild(backup, guild);
                        break;
                }
            }
        });
    }
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    uuid_short() {
        return 'xxxxxxx-xxx-xxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    create(guild, creatorID, name = "#{GEN}#") {
        return new Promise(async (resolve) => {
            var _a, _b;
            const backup_id = name.replace(/#{GEN}#/g, this.uuidv4()).replace(/#{GEN_SHORT}#/g, this.uuid_short());
            if (!this.verifyExistence(backup_id)) {
                let backup = {
                    version: 2,
                    backuper: {
                        id: guild.id,
                        owner_id: guild.ownerId,
                        createdAt: Date.now(),
                        creatorId: creatorID
                    },
                    guild: {
                        _id: guild.id,
                        _ownerId: guild.ownerId,
                        name: guild.name,
                        icon: guild.icon,
                        splash: guild.splash,
                        discoverySplash: guild.discoverySplash,
                        afkTimeout: guild.afkTimeout,
                        afkChannelID: guild.afkChannelId,
                        systemChannelFlags: guild.systemChannelFlags,
                        systemChannelID: guild.systemChannelId,
                        verificationLevel: guild.verificationLevel,
                        explicitContentFilter: guild.explicitContentFilter,
                        mfaLevel: guild.mfaLevel,
                        defaultMessageNotifications: guild.defaultMessageNotifications,
                        vanityURLCode: guild.vanityURLCode,
                        description: guild.description,
                        banner: guild.banner,
                        rulesChannelID: guild.rulesChannelId,
                        publicUpdatesChannelID: guild.publicUpdatesChannelId,
                        preferredLocale: guild.preferredLocale,
                    },
                    roles: await this.prepareRoles(guild.roles, guild.id),
                    channels: await this.prepareChannels(guild.channels),
                    emoji: await this.prepareEmojis(guild.emojis),
                    bans: await this.prepareBans(guild.bans)
                };
                fs_1.writeFile(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${backup_id}.axbs2`, new Buffer.from(JSON.stringify(backup)), 'utf8', function () {
                });
                resolve({
                    id: backup_id,
                    path: `${path_1.dirname(((_b = require.main) === null || _b === void 0 ? void 0 : _b.filename) || "/")}${this.path}${backup_id}.axbs2`,
                    backup: backup
                });
            }
            else {
                this.createError("FILE_ALREADY_EXISTS", { id: backup_id });
            }
        });
    }
    getBackupInfo(backupID) {
        return new Promise(async (resolve) => {
            var _a;
            if (this.verifyExistence(backupID)) {
                const backup = (await this.getBackup(backupID));
                const size = fs_1.statSync(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${backupID}.axbs2`).size / (1024 * 1024);
                resolve({
                    size: size,
                    backup_id: backupID,
                    createdAt: backup.backuper.createdAt,
                    authorId: backup.backuper.creatorId,
                    guild: {
                        id: backup.guild._id,
                        owner_id: backup.guild._ownerId,
                    },
                    exists: true
                });
            }
            else {
                resolve({
                    exists: false
                });
            }
        });
    }
    deleteBackup(backupID) {
        return new Promise((resolve, reject) => {
            var _a;
            if (this.verifyExistence(backupID)) {
                fs_1.unlink(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${backupID}.axbs2`, (err) => {
                    if (err)
                        return reject(err);
                    resolve({
                        backup_id: backupID,
                        deleted: true,
                        exists: true
                    });
                });
            }
            else {
                this.createError("FILE_DOESNT_EXIST", { id: backupID });
            }
        });
    }
    isBackupFile(backupID) {
        return new Promise(async (resolve) => {
            if (this.verifyExistence(backupID)) {
                // V2
                const backupContent = await this.getBackup(backupID);
                if (await this.isV2BackupFile(backupContent)) {
                    resolve({
                        isValidBackupFile: true,
                        isOldTimer: false,
                        version: 2,
                        convertible: false
                    });
                }
                else {
                    resolve({
                        isValidBackupFile: false,
                        isOldTimer: false,
                        version: null,
                        convertible: false
                    });
                }
            }
            else if (this.verifyExistence(backupID, 'axbs1')) {
                // V1
                const backupContent = await this.getBackup(backupID, 'axbs1');
                if (await this.isV1BackupFile(backupContent)) {
                    resolve({
                        isValidBackupFile: false,
                        isOldTimer: true,
                        version: 1,
                        convertible: true
                    });
                }
                else {
                    resolve({
                        isValidBackupFile: false,
                        isOldTimer: false,
                        version: null,
                        convertible: false
                    });
                }
            }
            else {
                resolve({
                    isValidBackupFile: false,
                    isOldTimer: false,
                    version: null,
                    convertible: false
                });
            }
        });
    }
    convertBackup(backupID) {
        return new Promise(async (resolve) => {
            var _a, _b, _c;
            if ((await this.isBackupFile(backupID)).convertible) {
                const backup = await this.getBackup(backupID, 'axbs1');
                const newBackup = this.convert(backup);
                fs_1.unlink(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${backupID}.axbs1`, () => {
                });
                fs_1.writeFile(`${path_1.dirname(((_b = require.main) === null || _b === void 0 ? void 0 : _b.filename) || "/")}${this.path}${backupID}.axbs2`, new Buffer.from(JSON.stringify(newBackup)), 'utf8', function () {
                });
                resolve({
                    id: backupID,
                    path: `${path_1.dirname(((_c = require.main) === null || _c === void 0 ? void 0 : _c.filename) || "/")}${this.path}${backupID}.axbs2`,
                    backup: newBackup
                });
            }
            else {
                this.createError('UNCONVERTIBLE_BACKUP');
            }
        });
    }
    convert(oldBackup) {
        let newBackup = {
            version: 2,
            backuper: oldBackup.backuper,
            guild: {
                name: oldBackup.name,
                _id: oldBackup.backuper.id,
                _ownerId: oldBackup.backuper.owner_id,
                icon: oldBackup.icon,
                splash: oldBackup.splash,
                discoverySplash: oldBackup.discoverySplash,
                afkTimeout: oldBackup.afkTimeout,
                afkChannelID: oldBackup.afkChannelID,
                systemChannelFlags: oldBackup.systemChannelFlags,
                systemChannelID: oldBackup.systemChannelID,
                verificationLevel: oldBackup.verificationLevel,
                explicitContentFilter: oldBackup.explicitContentFilter,
                mfaLevel: oldBackup.mfaLevel,
                defaultMessageNotifications: oldBackup.defaultMessageNotifications,
                vanityURLCode: oldBackup.vanityURLCode,
                description: oldBackup.description,
                banner: oldBackup.banner,
                rulesChannelID: oldBackup.rulesChannelID,
                publicUpdatesChannelID: oldBackup.publicUpdatesChannelID,
                preferredLocale: oldBackup.preferredLocale
            },
            roles: [],
            channels: [],
            bans: oldBackup.bans,
            emoji: oldBackup.emoji
        };
        oldBackup.channels.forEach((channel) => {
            Object.assign({ threads: [] }, channel);
            newBackup.channels.push(channel);
        });
        oldBackup.roles.forEach((role) => {
            Object.assign({ tags: null }, role);
            newBackup.roles.push(role);
        });
        return newBackup;
    }
    getBackup(backupID, end = 'axbs2') {
        return new Promise((resolve, reject) => {
            var _a;
            if (this.verifyExistence(backupID, end)) {
                fs_1.readFile(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${backupID}.${end}`, 'utf8', function (err, data) {
                    if (err)
                        return reject(err);
                    const data_json = JSON.parse(data);
                    resolve(data_json);
                });
            }
            else {
                this.createError("FILE_DOESNT_EXIST", { id: backupID });
            }
        });
    }
    verifyExistence(id, end = 'axbs2') {
        var _a;
        return !!fs_1.existsSync(`${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${id}.${end}`);
    }
    createError(error, other) {
        var _a, _b;
        let error_text = "UNKNOWN ERROR";
        switch (error) {
            case 'FILE_ALREADY_EXISTS':
                error_text = `File ${path_1.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "/")}${this.path}${other["id"]}.axbs2 already exists!`;
                break;
            case 'FILE_DOESNT_EXIST':
                error_text = `File ${path_1.dirname(((_b = require.main) === null || _b === void 0 ? void 0 : _b.filename) || "/")}${this.path}${other["id"]}.axbs2 doesn't exist!`;
                break;
            case 'IS_NOT_BACKUP_TYPE_FILE':
                error_text = `Backup ${other["id"]} is not a backup type File`;
                break;
            case 'UNCONVERTIBLE_BACKUP':
                error_text = `Unconvertible Backup File`;
                break;
        }
        throw new Error(error_text);
    }
    isConvertible(backupContent) {
        return new Promise(async (resolve) => {
            if (backupContent.version === 1) {
                resolve(await this.isV1BackupFile(backupContent));
            }
            else if (backupContent.version === 2) {
                if ((await this.isV2BackupFile(backupContent))) {
                    resolve("ALREADY OPERATIONAL");
                }
                else {
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }
        });
    }
    static findBackupVersion(backupContent) {
        if (backupContent.version) {
            return backupContent.version;
        }
        else {
            return -1;
        }
    }
    isV1BackupFile(backupContent) {
        return new Promise(async (resolve) => {
            const v1BackupContent = {
                version: null,
                backuper: {
                    id: null,
                    owner_id: null,
                    createdAt: null,
                    creatorId: null
                },
                name: null,
                icon: null,
                splash: null,
                discoverySplash: null,
                region: null,
                afkTimeout: null,
                afkChannelID: null,
                systemChannelFlags: null,
                systemChannelID: null,
                verificationLevel: null,
                explicitContentFilter: null,
                mfaLevel: null,
                defaultMessageNotifications: null,
                vanityURLCode: null,
                description: null,
                banner: null,
                rulesChannelID: null,
                publicUpdatesChannelID: null,
                preferredLocale: null,
                roles: null,
                channels: null,
                emoji: null,
                bans: null
            };
            resolve(await this.hasSameProps(backupContent, v1BackupContent));
        });
    }
    isV2BackupFile(backupContent) {
        return new Promise(async (resolve) => {
            const v2BackupContent = {
                version: null,
                backuper: {
                    id: null,
                    owner_id: null,
                    createdAt: null,
                    creatorId: null
                },
                guild: {
                    _id: null,
                    _ownerId: null,
                    name: null,
                    banner: null,
                    discoverySplash: null,
                    icon: null,
                    splash: null,
                    afkTimeout: null,
                    afkChannelID: null,
                    systemChannelFlags: null,
                    systemChannelID: null,
                    verificationLevel: null,
                    explicitContentFilter: null,
                    mfaLevel: null,
                    defaultMessageNotifications: null,
                    vanityURLCode: null,
                    description: null,
                    rulesChannelID: null,
                    publicUpdatesChannelID: null,
                    preferredLocale: null,
                },
                roles: null,
                channels: null,
                emoji: null,
                bans: null,
            };
            resolve(await this.hasSameProps(backupContent, v2BackupContent));
        });
    }
    hasSameProps(obj1, obj2) {
        return new Promise((resolve) => {
            Object.keys(obj1).every(function (prop) {
                if (!obj2.hasOwnProperty(prop)) {
                    resolve(false);
                }
            });
            resolve(true);
        });
    }
}
exports.BackupSystem = BackupSystem;
module.exports = BackupSystem;
