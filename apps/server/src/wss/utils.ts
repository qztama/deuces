import { WSContext } from './types.js';

export function getPrintFriendlyWSContext(ctx: WSContext) {
    const { ws, ...printFriendlyWSContext } = ctx;
    return printFriendlyWSContext;
}
