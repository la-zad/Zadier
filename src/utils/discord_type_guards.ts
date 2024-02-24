import type {
    APIInteractionDataResolvedChannel,
    APIInteractionDataResolvedGuildMember,
    APIRole,
    GuildBasedChannel,
    GuildMember,
    GuildTextBasedChannel,
    Role,
} from 'discord.js';

export function isRoleNotAPIRole(arg?: Role | APIRole | null): arg is Role {
    return is<Role, APIRole>(arg, 'guild');
}

export function isGuildMemberNotAPIGuildMember(
    arg?: GuildMember | APIInteractionDataResolvedGuildMember | null,
): arg is GuildMember {
    return is<GuildMember, APIInteractionDataResolvedGuildMember>(arg, 'user');
}

export function isGuildBasedChannelNotAPIGuildBasedChannel(
    arg?: GuildBasedChannel | APIInteractionDataResolvedChannel | null,
): arg is GuildBasedChannel {
    return is<GuildBasedChannel, APIInteractionDataResolvedChannel>(arg, 'guild');
}

export function isGuildTextBasedChannelNotGuildBasedChannel(
    arg?: GuildTextBasedChannel | GuildBasedChannel | null,
): arg is GuildTextBasedChannel {
    return is<GuildTextBasedChannel, GuildBasedChannel>(arg, 'messages');
}

/**
 * Returns a union type of key names that can be used to discriminate two types.
 */
type PossibleDiscriminent<T, U> = keyof ExtractNonNull<ExtractNonOptionnal<ExtractProps<UniqueProps<T, U>>>>;

function is<T, U>(arg: T | U | null | undefined, discriminent: PossibleDiscriminent<T, U>): arg is T {
    return Object.prototype.hasOwnProperty.call(arg, discriminent);
}
