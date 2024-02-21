import type {
    APIInteractionDataResolvedGuildMember,
    APIRole,
    CacheType,
    CacheTypeReducer,
    GuildMember,
    Role,
} from 'discord.js';

export function isRole(arg: CacheTypeReducer<CacheType, Role, APIRole>): arg is Role {
    return is<Role, APIRole>(arg, 'members');
}

export function isGuildMember(
    arg: CacheTypeReducer<CacheType, GuildMember, APIInteractionDataResolvedGuildMember>,
): arg is GuildMember {
    return is<GuildMember, APIInteractionDataResolvedGuildMember>(arg, 'user');
}

/**
 * Returns a union type of key names that can be used to discriminate two types.
 */
type PossibleDiscriminent<T, U> = keyof ExtractNonNull<ExtractNonOptionnal<ExtractProps<UniqueProps<T, U>>>>;

function is<T, U>(
    arg: CacheTypeReducer<CacheType, T, U> | undefined,
    discriminent: PossibleDiscriminent<T, U>,
): arg is T {
    return Object.prototype.hasOwnProperty.call(arg, discriminent);
}
