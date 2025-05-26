"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSensor = exports.updateSensor = exports.getSensor = exports.getSensors = exports.addSensor = exports.deleteFarm = exports.updateFarm = exports.getFarm = exports.getFarms = exports.createFarm = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
// Farm Controllers
const createFarm = async (req, res) => {
    try {
        const { name, location, size, cropType } = req.body;
        const farm = await prisma.farm.create({
            data: {
                name,
                location,
                size,
                cropType,
                userId: req.user.userId
            }
        });
        res.status(201).json({
            success: true,
            farm
        });
    }
    catch (error) {
        logger_1.default.error('Error in createFarm:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating farm'
        });
    }
};
exports.createFarm = createFarm;
const getFarms = async (req, res) => {
    try {
        const farms = await prisma.farm.findMany({
            where: {
                userId: req.user.userId
            }
        });
        res.json({
            success: true,
            farms
        });
    }
    catch (error) {
        logger_1.default.error('Error in getFarms:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farms'
        });
    }
};
exports.getFarms = getFarms;
const getFarm = async (req, res) => {
    try {
        const farm = await prisma.farm.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            include: {
                sensors: true
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        res.json({
            success: true,
            farm
        });
    }
    catch (error) {
        logger_1.default.error('Error in getFarm:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farm'
        });
    }
};
exports.getFarm = getFarm;
const updateFarm = async (req, res) => {
    try {
        const { name, location, size, cropType } = req.body;
        const farm = await prisma.farm.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const updatedFarm = await prisma.farm.update({
            where: { id: req.params.id },
            data: {
                name,
                location,
                size,
                cropType
            }
        });
        res.json({
            success: true,
            farm: updatedFarm
        });
    }
    catch (error) {
        logger_1.default.error('Error in updateFarm:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating farm'
        });
    }
};
exports.updateFarm = updateFarm;
const deleteFarm = async (req, res) => {
    try {
        const farm = await prisma.farm.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        await prisma.farm.delete({
            where: { id: req.params.id }
        });
        res.json({
            success: true,
            message: 'Farm deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error in deleteFarm:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting farm'
        });
    }
};
exports.deleteFarm = deleteFarm;
// Sensor Controllers
const addSensor = async (req, res) => {
    try {
        const { type, value } = req.body;
        const { farmId } = req.params;
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const sensor = await prisma.sensor.create({
            data: {
                type,
                value,
                farmId
            }
        });
        res.status(201).json({
            success: true,
            sensor
        });
    }
    catch (error) {
        logger_1.default.error('Error in addSensor:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding sensor'
        });
    }
};
exports.addSensor = addSensor;
const getSensors = async (req, res) => {
    try {
        const { farmId } = req.params;
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const sensors = await prisma.sensor.findMany({
            where: { farmId }
        });
        res.json({
            success: true,
            sensors
        });
    }
    catch (error) {
        logger_1.default.error('Error in getSensors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensors'
        });
    }
};
exports.getSensors = getSensors;
const getSensor = async (req, res) => {
    try {
        const { farmId, id } = req.params;
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const sensor = await prisma.sensor.findFirst({
            where: {
                id,
                farmId
            }
        });
        if (!sensor) {
            return res.status(404).json({
                success: false,
                message: 'Sensor not found'
            });
        }
        res.json({
            success: true,
            sensor
        });
    }
    catch (error) {
        logger_1.default.error('Error in getSensor:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensor'
        });
    }
};
exports.getSensor = getSensor;
const updateSensor = async (req, res) => {
    try {
        const { type, value } = req.body;
        const { farmId, id } = req.params;
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const sensor = await prisma.sensor.findFirst({
            where: {
                id,
                farmId
            }
        });
        if (!sensor) {
            return res.status(404).json({
                success: false,
                message: 'Sensor not found'
            });
        }
        const updatedSensor = await prisma.sensor.update({
            where: { id },
            data: {
                type,
                value
            }
        });
        res.json({
            success: true,
            sensor: updatedSensor
        });
    }
    catch (error) {
        logger_1.default.error('Error in updateSensor:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sensor'
        });
    }
};
exports.updateSensor = updateSensor;
const deleteSensor = async (req, res) => {
    try {
        const { farmId, id } = req.params;
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: req.user.userId
            }
        });
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }
        const sensor = await prisma.sensor.findFirst({
            where: {
                id,
                farmId
            }
        });
        if (!sensor) {
            return res.status(404).json({
                success: false,
                message: 'Sensor not found'
            });
        }
        await prisma.sensor.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Sensor deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error in deleteSensor:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sensor'
        });
    }
};
exports.deleteSensor = deleteSensor;
//# sourceMappingURL=farm.controller.js.map