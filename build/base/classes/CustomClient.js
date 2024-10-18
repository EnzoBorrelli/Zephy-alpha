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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Handler_1 = __importDefault(require("./Handler"));
const mongoose_1 = require("mongoose");
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
class CustomClient extends discord_js_1.Client {
    constructor() {
        super({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.GuildMessageReactions,
            ],
        });
        this.config = require(`${process.cwd()}/data/config.json`); //process.cwd look for the specific path
        this.handler = new Handler_1.default(this);
        this.commands = new discord_js_1.Collection();
        this.subCommands = new discord_js_1.Collection();
        this.cooldowns = new discord_js_1.Collection();
        this.developmentMode = process.argv.slice(2).includes("--development");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.developmentMode ? "development" : "production"} mode enabled`);
            yield this.initializeI18n();
            this.LoadHandlers();
            this.login(this.developmentMode ? this.config.devToken : this.config.token).catch((err) => console.error(err));
            (0, mongoose_1.connect)(this.developmentMode ? this.config.devMongoUrl : this.config.mongoUrl)
                .then(() => console.log("connected to db"))
                .catch((err) => console.error(err));
        });
    }
    LoadHandlers() {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
    initializeI18n() {
        return __awaiter(this, void 0, void 0, function* () {
            yield i18next_1.default.use(i18next_fs_backend_1.default).init({
                initImmediate: false,
                lng: "en",
                fallbackLng: "en",
                backend: {
                    loadPath: "./src/locales/{{lng}}.json",
                },
                debug: true,
            });
            console.log("i18Next initialize with lang:", i18next_1.default.language);
        });
    }
}
exports.default = CustomClient;
