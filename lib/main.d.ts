import { Permissions, SystemChannelFlags, UserFlags, RoleTagData } from "discord.js";
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
