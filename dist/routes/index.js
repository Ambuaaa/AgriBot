"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const user_routes_1 = __importDefault(require("./user.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const weather_routes_1 = __importDefault(require("./weather.routes"));
const market_routes_1 = __importDefault(require("./market.routes"));
const auth_routes_1 = require("./auth.routes");
const crop_routes_1 = require("./crop.routes");
const whatsapp_routes_1 = require("./whatsapp.routes");
const setupRoutes = (app) => {
    // API version prefix
    const apiPrefix = '/api';
    // Mount routes
    app.use(`${apiPrefix}/users`, user_routes_1.default);
    app.use(`${apiPrefix}/chat`, chat_routes_1.default);
    app.use(`${apiPrefix}/weather`, weather_routes_1.default);
    app.use(`${apiPrefix}/market`, market_routes_1.default);
    app.use(`${apiPrefix}/auth`, auth_routes_1.authRoutes);
    app.use(`${apiPrefix}/crop`, crop_routes_1.cropRoutes);
    app.use(`${apiPrefix}/whatsapp`, whatsapp_routes_1.whatsappRoutes);
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map