import { Guild, Permissions, RoleManager, SystemChannelFlags, UserFlags, GuildChannelManager, GuildEmojiManager, GuildBanManager, RoleTagData, GuildMemberManager } from "discord.js";
export declare class BackupSystem {
    readonly path: string;
    constructor(path?: string);
    prepareRoles(roleManager: RoleManager, guildId: string): Promise<BackupRole[]>;
    prepareChannels(channelManager: GuildChannelManager): Promise<BackupChannel[]>;
    prepareEmojis(emojiManager: GuildEmojiManager): Promise<Emoji[]>;
    prepareBans(banManager: GuildBanManager): Promise<Ban[]>;
    createCategories(categories: BackupChannel[], channelManager: GuildChannelManager, roleCorrespondence: Map<string, string>, interval?: number): Promise<Map<string, string>>;
    createChannels(channels: BackupChannel[], channelManager: GuildChannelManager, categoriesCorrespondence: Map<string, string>, roleCorrespondence: Map<string, string>, interval?: number): Promise<Map<string, string>>;
    createRoles(roles: BackupRole[], roleManager: RoleManager, membersManager: GuildMemberManager, interval?: number): Promise<Map<string, string>>;
    createEmojis(emotes: Emoji[], emojiManager: GuildEmojiManager, interval?: number): Promise<void>;
    createBans(bans: Ban[], banManager: GuildBanManager, interval?: number): Promise<void>;
    changeGuild(backup: Backup, guild: Guild): Promise<void>;
    load(backupID: string, guild: Guild, order?: string): Promise<Backup>;
    private loadBackup;
    uuidv4(): string;
    uuid_short(): string;
    create(guild: Guild, creatorID: string, name?: string): Promise<{
        id: string;
        path: string;
        backup: Backup;
    }>;
    getBackupInfo(backupID: string): Promise<{
        size?: number;
        backup_id?: string;
        createdAt?: number;
        authorId?: string;
        guild?: {
            id?: string;
            owner_id?: string;
        };
        exists: boolean;
    }>;
    deleteBackup(backupID: string): Promise<{
        backup_id: string;
        deleted: boolean;
        exists: boolean;
    }>;
    isBackupFile(backupID: string): Promise<{
        isValidBackupFile: boolean;
        isOldTimer: boolean;
        version: number | null;
        convertible: boolean;
    }>;
    convertBackup(backupID: string): Promise<{
        id: string;
        path: string;
        backup: Backup;
    }>;
    private convert;
    private getBackup;
    private verifyExistence;
    private createError;
    private isConvertible;
    private static findBackupVersion;
    private isV1BackupFile;
    private isV2BackupFile;
    private hasSameProps;
}
export interface Backup {
    version: number;
    backuper: {
        id: string;
        owner_id: string;
        createdAt: number;
        creatorId: string;
    };
    guild: {
        _id: string;
        _ownerId: string;
        name: string;
        banner: string | null;
        discoverySplash: string | null;
        icon: string | null;
        splash: string | null;
        afkTimeout: number;
        afkChannelID: string | null;
        systemChannelFlags: Readonly<SystemChannelFlags>;
        systemChannelID: string | null;
        verificationLevel: number | "NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
        explicitContentFilter: number | "DISABLED" | "MEMBERS_WITHOUT_ROLES" | "ALL_MEMBERS";
        mfaLevel: "NONE" | "ELEVATED" | number;
        defaultMessageNotifications: number | "ALL_MESSAGES" | "ONLY_MENTIONS";
        vanityURLCode: string | null;
        description: string | null;
        rulesChannelID: string | null;
        publicUpdatesChannelID: string | null;
        preferredLocale: string;
    };
    roles: BackupRole[];
    channels: BackupChannel[];
    emoji: Emoji[];
    bans: Ban[];
}
export interface BackupRole {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    rawPosition: number;
    permissions: Readonly<Permissions>;
    managed: boolean;
    mentionable: boolean;
    members: RoleMember[];
    tags: RoleTagData | null;
    icon: string | null;
}
export interface RoleMember {
    id: string;
    flags: Readonly<UserFlags> | null;
}
export interface BackupChannel {
    id: string;
    type: "GUILD_CATEGORY" | "GUILD_NEWS" | "GUILD_STAGE_VOICE" | "GUILD_STORE" | "GUILD_TEXT" | "GUILD_VOICE";
    name: string;
    rawPosition: number;
    parentID: string | null;
    manageable: boolean;
    rateLimitPerUser: number;
    topic: string;
    nsfw: boolean;
    permissionsOverwrites: PermissionOverwrites[];
    threads?: Thread[];
    defaultAutoArchiveDuration?: number | string;
}
export interface PermissionOverwrites {
    id: string;
    type: "role" | "member";
    deny: Readonly<Permissions>;
    allow: Readonly<Permissions>;
}
export interface Emoji {
    name: string;
    url: string;
    deletable: boolean;
    roles: string[];
}
export interface Ban {
    id: string;
    reason: string | null | undefined;
}
export interface Thread {
    id: string;
    type: "GUILD_NEWS_THREAD" | "GUILD_PUBLIC_THREAD" | "GUILD_PRIVATE_THREAD";
    name: string;
    ownerId: string | null;
    joinable: boolean;
    editable: boolean;
    locked: boolean | null;
    parentID: string | null;
    manageable: boolean;
    rateLimitPerUser: number | null;
    autoArchiveDuration: number | string | null;
    archived: boolean | null;
}
