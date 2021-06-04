"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.makeBackupFileCompatible = exports.isBackupFile = exports.getAllBackups = exports.getBackupRAW = exports.loadBackup = exports.deleteBackup = exports.backupInfo = exports.createBackup = void 0;
var discord_js_1 = require("discord.js");
var fs_1 = require("fs");
var path_1 = require("path");
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function uuid_short() {
    return 'xxxxxxx-xxx-xxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function createBackup(guild, creatorID, path, name) {
    if (path === void 0) { path = "/backup/"; }
    if (name === void 0) { name = "#{GEN}#"; }
    return new Promise(function (resolve) {
        // @ts-ignore
        if (fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + name + ".axbs1")) {
            throw new Error("Backup already exist!");
        }
        //base guild
        var guild_backup = {
            version: 1,
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
        var backup_id = name.replace(/#{GEN}#/g, uuidv4()).replace(/#{GEN_SHORT}#/g, uuid_short());
        //Create Backup
        // @ts-ignore
        fs_1.writeFile("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", new Buffer.from(JSON.stringify(guild_backup)), 'utf8', function () {
        });
        resolve({
            id: backup_id,
            // @ts-ignore
            path: "" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1"
        });
    });
}
exports.createBackup = createBackup;
function backupInfo(backup_id, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            resolve({
                exists: false
            });
        }
        else {
            // @ts-ignore
            var size_1 = fs_1.statSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1").size / (1024 * 1024);
            // @ts-ignore
            fs_1.readFile("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", 'utf8', function (err, data) {
                if (err)
                    return reject(err);
                var data_json = JSON.parse(data);
                resolve({
                    size: size_1,
                    backup_id: backup_id,
                    guild_base_id: data_json.backuper.id,
                    createdAt: data_json.backuper.createdAt,
                    owner_id: data_json.backuper.owner_id,
                    author_id: data_json.backuper.creatorId,
                    exists: true
                });
            });
        }
    });
}
exports.backupInfo = backupInfo;
function deleteBackup(backup_id, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            resolve({
                exists: false
            });
        }
        else {
            // @ts-ignore
            fs_1.unlink("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", function (err) {
                if (err)
                    return reject(err);
                resolve({
                    backup_id: backup_id,
                    deleted: true,
                    exists: true
                });
            });
        }
    });
}
exports.deleteBackup = deleteBackup;
function loadBackup(backup_id, guild, path, debug) {
    if (path === void 0) { path = "/backup/"; }
    if (debug === void 0) { debug = false; }
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            resolve({
                exists: false
            });
        }
        else {
            // @ts-ignore
            fs_1.readFile("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", 'utf8', function (err, data) {
                if (err)
                    return reject(err);
                var backup = JSON.parse(data);
                var roles = new discord_js_1.Collection();
                var channels = new discord_js_1.Collection();
                if (debug)
                    console.log("Deleting roles...");
                var i = 0;
                var max_roo = guild.roles.cache.size;
                guild.roles.cache.each(function (role) {
                    if (!role.managed && role.name !== '@everyone') {
                        setTimeout(function () {
                            if (debug)
                                console.log("Deleted " + role.name + " | " + i++ + "/" + max_roo);
                            role["delete"]();
                            //i++
                            if (i === max_roo) {
                                if (debug)
                                    console.log("PART 1.1");
                                part1_1();
                            }
                        }, 300);
                    }
                    else {
                        i++;
                    }
                    if (i === max_roo) {
                        if (debug)
                            console.log("PART 1.1");
                        part1_1();
                    }
                });
                function part1_1() {
                    var i = 0;
                    if (debug)
                        console.log("Creating roles...");
                    var broles = backup.roles.sort(function (a, b) {
                        return b.rawPosition - a.rawPosition;
                    });
                    var _loop_1 = function (role) {
                        //console.log(`Attempt to ${role.name}`)
                        if (!role.managed && role.name !== "@everyone") {
                            setTimeout(function () {
                                if (debug)
                                    console.log("Creating role...");
                                guild.roles.create({
                                    data: {
                                        name: role.name,
                                        color: role.color,
                                        hoist: role.hoist,
                                        mentionable: role.mentionable,
                                        //position: role.rawPosition,
                                        permissions: role.permissions
                                    }
                                }).then(function (new_role) {
                                    if (debug)
                                        console.log("Created " + role.name + " | " + i + "/" + broles.length);
                                    roles.set(role.id, {
                                        old_id: role.id,
                                        new_id: new_role.id
                                    });
                                    i++;
                                    var _loop_2 = function (member) {
                                        if (!guild.members.cache.get(member.id)) {
                                            return "continue";
                                        }
                                        else {
                                            setTimeout(function () {
                                                var _a, _b;
                                                // @ts-ignore
                                                if (debug)
                                                    console.log("Adding role");
                                                (_b = (_a = guild.members.cache.get(member.id)) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.add(new_role.id);
                                            }, 200);
                                        }
                                    };
                                    for (var _i = 0, _a = role.members; _i < _a.length; _i++) {
                                        var member = _a[_i];
                                        _loop_2(member);
                                    }
                                    if (i === broles.length) {
                                        if (debug)
                                            console.log("PART 2");
                                        part2();
                                    }
                                });
                            }, 400);
                        }
                        else if (role.name === '@everyone') {
                            if (debug)
                                console.log("Passing everyone | " + i + "/" + broles.length);
                            guild.roles.everyone.edit({
                                permissions: role.permissions
                            }).then(function (new_role) {
                                //console.log(`Created ${role.name}`)
                                roles.set(role.id, {
                                    old_id: role.id,
                                    new_id: new_role.id
                                });
                                i++;
                                if (i === broles.length) {
                                    if (debug)
                                        console.log("PART 2");
                                    part2();
                                }
                            });
                        }
                        else if (role.managed) {
                            if (debug)
                                console.log("Passing " + role.name + " | " + i + "/" + broles.length);
                            i++;
                            if (i === broles.length) {
                                if (debug)
                                    console.log("PART 2");
                                part2();
                            }
                        }
                        if (i === broles.length) {
                            if (debug)
                                console.log("PART 2");
                            part2();
                        }
                    };
                    for (var _i = 0, broles_1 = broles; _i < broles_1.length; _i++) {
                        var role = broles_1[_i];
                        _loop_1(role);
                    }
                }
                function part2() {
                    if (debug)
                        console.log("Deleting Channels...");
                    var max_chan = guild.channels.cache.size;
                    var io = 0;
                    guild.channels.cache.each(function (channel) {
                        if (channel.deletable) {
                            setTimeout(function () {
                                io++;
                                if (debug)
                                    console.log("Deleted " + channel.name + " | " + io + "/" + max_chan);
                                channel["delete"]();
                                //io++
                                if (io === max_chan - 1) {
                                    if (debug)
                                        console.log("PART 2.1");
                                    part2_1();
                                }
                            }, 300);
                        }
                        if (io === max_chan - 1) {
                            if (debug)
                                console.log("PART 2.1");
                            part2_1();
                        }
                    });
                }
                function part2_1() {
                    var i = 0;
                    // @ts-ignore
                    var bchannels = backup.channels.sort(function (a, b) {
                        return b.rawPosition - a.rawPosition;
                    });
                    bchannels.forEach(function (channel) {
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
                                    // @ts-ignore
                                    type: channel.type,
                                    position: channel.rawPosition,
                                    permissionOverwrites: permissions
                                }).then(function (new_channel) {
                                    channels.set(channel.id, {
                                        old_id: channel.id,
                                        new_id: new_channel.id
                                    });
                                    i++;
                                    if (i === bchannels.length) {
                                        if (debug)
                                            console.log("PART 2.2");
                                        part2_2();
                                    }
                                });
                            }, 400);
                        }
                        else {
                            i++;
                        }
                        if (i === bchannels.length) {
                            if (debug)
                                console.log("PART 2.2");
                            part2_2();
                        }
                    });
                }
                function part2_2() {
                    var i = 0;
                    var bchannels = backup.channels.sort(function (a, b) {
                        return a.rawPosition - b.rawPosition;
                    });
                    bchannels.forEach(function (channel) {
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
                                if (channel.type.toLowerCase() === "news") {
                                    channel.type = "text";
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
                                    rateLimitPerUser: parseInt("" + (channel.rateLimitPerUser !== '' ? channel.rateLimitPerUser : 0)),
                                    permissionOverwrites: permissions,
                                    parent: parent
                                });
                                i++;
                                if (i === bchannels.length) {
                                    if (debug)
                                        console.log("PART 3");
                                    part3();
                                }
                            }, 400);
                        }
                        else {
                            i++;
                        }
                        if (i === bchannels.length) {
                            if (debug)
                                console.log("PART 3");
                            part3();
                        }
                    });
                }
                function part3() {
                    var ie = 0;
                    var max_emot = guild.emojis.cache.size;
                    guild.emojis.cache.each(function (emoji) {
                        if (emoji.deletable) {
                            setTimeout(function () {
                                emoji["delete"]();
                                ie++;
                                if (ie === max_emot - 1) {
                                    if (debug)
                                        console.log("PART 3.1");
                                    part3_1();
                                }
                            }, 100);
                        }
                    });
                    if (ie === max_emot) {
                        if (debug)
                            console.log("PART 3.1");
                        part3_1();
                    }
                }
                function part3_1() {
                    var _loop_3 = function (emoji) {
                        setTimeout(function () {
                            guild.emojis.create(emoji.url, emoji.name, {
                                roles: emoji.roles || []
                            });
                        }, 100);
                    };
                    for (var _i = 0, _a = backup.emoji; _i < _a.length; _i++) {
                        var emoji = _a[_i];
                        _loop_3(emoji);
                    }
                    var _loop_4 = function (ban) {
                        setTimeout(function () {
                            guild.members.ban(ban.id, {
                                reason: ban.reason
                            });
                        }, 100);
                    };
                    for (var _b = 0, _c = backup.bans; _b < _c.length; _b++) {
                        var ban = _c[_b];
                        _loop_4(ban);
                    }
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
                        bans: backup.bans,
                        exists: true
                    });
                }
            });
        }
    });
}
exports.loadBackup = loadBackup;
function getBackupRAW(backup_id, path) {
    if (path === void 0) { path = "/backup/"; }
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            resolve({
                exists: false
            });
        }
        else {
            // @ts-ignore
            fs_1.readFile("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", 'utf8', function (err, data) {
                if (err)
                    return reject(err);
                var data_json = JSON.parse(data);
                resolve({
                    backup_id: backup_id,
                    // @ts-ignore
                    path: "" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1",
                    backup: data_json,
                    exists: true
                });
            });
        }
    });
}
exports.getBackupRAW = getBackupRAW;
function getAllBackups(path) {
    if (path === void 0) { path = '/backup/'; }
    return new Promise(function (resolve) {
        // @ts-ignore
        var files = fs_1.readdirSync("" + path_1.dirname(require.main.filename) + path);
        var backups = [];
        var start = Date.now();
        var count = 0;
        var count2 = 0;
        var count3 = 0;
        files.forEach(function (e) {
            try {
                var fileName_1 = e.split('.')[0];
                if (e.endsWith('axbs1')) {
                    // @ts-ignore
                    var size_2 = fs_1.statSync("" + path_1.dirname(require.main.filename) + path + fileName_1 + ".axbs1").size / (1024 * 1024);
                    // @ts-ignore
                    fs_1.readFile("" + path_1.dirname(require.main.filename) + path + fileName_1 + ".axbs1", 'utf8', function (err, data) {
                        if (err)
                            return console.error(err);
                        var data_json = JSON.parse(data);
                        backups.push({
                            backup_id: fileName_1,
                            // @ts-ignore
                            path: "" + path_1.dirname(require.main.filename) + path + fileName_1 + ".axbs1",
                            guild_base_id: data_json.backuper.id,
                            createdAt: data_json.backuper.createdAt,
                            owner_id: data_json.backuper.owner_id,
                            author_id: data_json.backuper.creatorId,
                            size: size_2
                        });
                        count++;
                        count2++;
                        if (count2 === files.length) {
                            var finish = Date.now();
                            resolve({
                                backups: backups,
                                time_elapsed: finish - start,
                                fetched_backups: count
                            });
                        }
                    });
                }
                else {
                    count2++;
                }
                if (count2 === files.length) {
                    var finish = Date.now();
                    resolve({
                        backups: backups,
                        time_elapsed: finish - start,
                        fetched_backups: count
                    });
                }
            }
            catch (error) {
                throw new Error("Failed to fetch file " + e + ": " + (error.stack || error));
            }
        });
    });
}
exports.getAllBackups = getAllBackups;
function isBackupFile(backup_id, path, makeItCompatible) {
    var _this = this;
    if (path === void 0) { path = '/backup/'; }
    if (makeItCompatible === void 0) { makeItCompatible = false; }
    return new Promise(function (resolve, reject) {
        var extension = "absx1";
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            // @ts-ignore
            if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".json")) {
                resolve({
                    exists: false
                });
            }
            else {
                extension = "json";
            }
        }
        // @ts-ignore
        fs_1.readFile("" + path_1.dirname(require.main.filename) + path + backup_id + "." + extension, 'utf8', function (err, data) { return __awaiter(_this, void 0, void 0, function () {
            var data_json, isB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err)
                            return [2 /*return*/, reject(err)];
                        data_json = JSON.parse(data);
                        return [4 /*yield*/, INTERNAL_isBackupFile(data_json)];
                    case 1:
                        isB = _a.sent();
                        if (!isB.isActualBackup) return [3 /*break*/, 7];
                        if (!(extension === "json")) return [3 /*break*/, 5];
                        if (!makeItCompatible) return [3 /*break*/, 3];
                        return [4 /*yield*/, makeBackupFileCompatible(backup_id, path).then(function (r) {
                                if (r.reformated) {
                                    resolve({
                                        isBackupFile: false,
                                        isCompatible: true,
                                        isReformated: true,
                                        exists: true
                                    });
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        resolve({
                            isBackupFile: false,
                            isCompatible: true,
                            isReformated: false,
                            exists: true
                        });
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        resolve({
                            isBackupFile: true,
                            isCompatible: true,
                            isReformated: false,
                            exists: true
                        });
                        _a.label = 6;
                    case 6: return [3 /*break*/, 10];
                    case 7:
                        if (!isB.isReformatable) return [3 /*break*/, 10];
                        if (!makeItCompatible) return [3 /*break*/, 9];
                        return [4 /*yield*/, makeBackupFileCompatible(backup_id, path).then(function (r) {
                                if (r.reformated) {
                                    resolve({
                                        isBackupFile: false,
                                        isCompatible: true,
                                        isReformated: true,
                                        exists: true
                                    });
                                }
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        resolve({
                            isBackupFile: false,
                            isCompatible: true,
                            isReformated: false,
                            exists: true
                        });
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        }); });
    });
}
exports.isBackupFile = isBackupFile;
function makeBackupFileCompatible(backup_id, path, deleteOld) {
    var _this = this;
    if (path === void 0) { path = '/backup/'; }
    if (deleteOld === void 0) { deleteOld = true; }
    return new Promise(function (resolve, reject) {
        var extension = "absx1";
        // @ts-ignore
        if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1")) {
            // @ts-ignore
            if (!fs_1.existsSync("" + path_1.dirname(require.main.filename) + path + backup_id + ".json")) {
                resolve({
                    reformated: false,
                    deletedOld: false,
                    exists: false
                });
            }
            else {
                extension = "json";
            }
        }
        // @ts-ignore
        fs_1.readFile("" + path_1.dirname(require.main.filename) + path + backup_id + "." + extension, 'utf8', function (err, data) { return __awaiter(_this, void 0, void 0, function () {
            var data_json, isB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err)
                            return [2 /*return*/, reject(err)];
                        data_json = JSON.parse(data);
                        return [4 /*yield*/, INTERNAL_isBackupFile(data_json)];
                    case 1:
                        isB = _a.sent();
                        if (isB.isReformatable) {
                            Object.assign({ version: 1 }, data_json);
                            // @ts-ignore
                            fs_1.writeFile("" + path_1.dirname(require.main.filename) + path + backup_id + ".axbs1", new Buffer.from(JSON.stringify(data_json)), 'utf8', function () {
                            });
                            if (deleteOld) {
                                // @ts-ignore
                                fs_1.unlink("" + path_1.dirname(require.main.filename) + path + backup_id + ".json", function (err) {
                                    if (err)
                                        return reject(err);
                                });
                                resolve({
                                    reformated: true,
                                    deletedOld: true,
                                    exists: true
                                });
                            }
                            resolve({
                                reformated: true,
                                deletedOld: false,
                                exists: true
                            });
                        }
                        else {
                            resolve({
                                reformated: false,
                                deletedOld: false,
                                exists: true
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
}
exports.makeBackupFileCompatible = makeBackupFileCompatible;
/**
 * @param {Object} backup_content
 * @return Promise<Object>
 */
function INTERNAL_isBackupFile(backup_content) {
    return new Promise(function (resolve) {
        var proof_object = {
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
        var proof_object_without_version = {
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
        if (!INTERNAL_hasSameProps(backup_content, proof_object_without_version)) {
            if (!INTERNAL_hasSameProps(backup_content, proof_object)) {
                resolve({
                    isActualBackup: false,
                    isReformatable: false
                });
            }
            else {
                resolve({
                    isActualBackup: true,
                    isReformatable: undefined
                });
            }
        }
        else {
            resolve({
                isActualBackup: false,
                isReformatable: true
            });
        }
    });
}
function INTERNAL_hasSameProps(obj1, obj2) {
    return Object.keys(obj1).every(function (prop) {
        return obj2.hasOwnProperty(prop);
    });
}
