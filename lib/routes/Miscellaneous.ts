/** @module REST/Miscellaneous */
import * as Routes from "../util/Routes";
import type RESTManager from "../rest/RESTManager";
import type { RawSticker, RawStickerPack, Sticker, StickerPack } from "../types/guilds";
import type { VoiceRegion } from "../types/voice";
import type { RESTApplication, RawClientApplication } from "../types";
import Application from "../structures/Application";
import ClientApplication from "../structures/ClientApplication";

/** Methods that don't fit anywhere else. Located at {@link Client#rest | Client#rest}{@link RESTManager#misc | .misc}. */
export default class Miscellaneous {
    #manager: RESTManager;
    constructor(manager: RESTManager) {
        this.#manager = manager;
    }

    /**
     * Get the currently authenticated bot's application info.
     * @caching This method **does not** cache its result.
     */
    async getApplication(): Promise<Application> {
        return this.#manager.authRequest<RESTApplication>({
            method: "GET",
            path:   Routes.APPLICATION
        }).then(data => new Application(data, this.#manager.client));
    }

    /**
     * Get the currently authenticated bot's application info as a bare {@link ClientApplication | ClientApplication}.
     * @caching This method **does not** cache its result.
     */
    async getClientApplication(): Promise<ClientApplication> {
        return this.#manager.authRequest<RawClientApplication>({
            method: "GET",
            path:   Routes.APPLICATION
        }).then(data => new ClientApplication(data, this.#manager.client));
    }

    /**
     * Get the nitro sticker packs.
     * @caching This method **does not** cache its result.
     */
    async getNitroStickerPacks(): Promise<Array<StickerPack>> {
        return this.#manager.authRequest<{ sticker_packs: Array<RawStickerPack>; }>({
            method: "GET",
            path:   Routes.NITRO_STICKER_PACKS
        }).then(data => data.sticker_packs.map(pack => ({
            bannerAssetID:  pack.banner_asset_id,
            coverStickerID: pack.cover_sticker_id,
            description:    pack.description,
            id:             pack.id,
            name:           pack.name,
            skuID:          pack.sku_id,
            stickers:       pack.stickers.map(sticker => this.#manager.client.util.convertSticker(sticker))
        })));
    }

    /**
     * Get a sticker.
     * @param stickerID The ID of the sticker to get.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached, or if the sticker is not a guild sticker.
     * @caches {@link Guild#stickers | Guild#stickers}
     */
    async getSticker(stickerID: string): Promise<Sticker> {
        return this.#manager.authRequest<RawSticker>({
            method: "GET",
            path:   Routes.STICKER(stickerID)
        }).then(data => data.guild_id === undefined ? this.#manager.client.util.convertSticker(data) : this.#manager.client.guilds.get(data.guild_id)?.stickers.update(data) ?? this.#manager.client.util.convertSticker(data));
    }

    /**
     * Get the list of usable voice regions.
     * @caching This method **does not** cache its result.
     */
    async getVoiceRegions(): Promise<Array<VoiceRegion>> {
        return this.#manager.authRequest<Array<VoiceRegion>>({
            method: "GET",
            path:   Routes.VOICE_REGIONS
        });
    }
}
