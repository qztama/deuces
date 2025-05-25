import { WSContext } from './types';

export function getPrintFriendlyWSContext(ctx: WSContext) {
    const { ws, ...printFriendlyWSContext } = ctx;
    return printFriendlyWSContext;
}
