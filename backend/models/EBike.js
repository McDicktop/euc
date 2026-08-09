const PMV = require("./pmv.js");
const mongoose = require("mongoose");

const EBike = PMV.discriminator(
    "e_bike",
    new mongoose.Schema({
        details: {
            brand: String,
            model: String,
            wheelDiameter: Number, // (Inch)
            power: Number, // (W - engine power)
            capacity: Number, // (Wh - battery capacity)*
            voltage: Number, // (V - battery voltage)
            maxSpeed: Number, // (km/h)
            frameMaterial: String, // (Aluminum, Carbon, Steel)
            driveType: String, // (Hub motor, Mid-drive) - тип привода
            hasSuspension: Boolean, // наличие амортизации
            hasPedalAssist: Boolean, // (PAS) наличие ассистента педалей
            gearsCount: Number, // количество механических передач
            hasBasket: Boolean,
            frameSize: Number, // ????
        },
    }),
);

const EUC = PMV.discriminator(
    "euc",
    new mongoose.Schema({
        details: {
            brand: String,
            model: String,

            wheelDiameter: Number, // (Inch)

            power: Number, //(W - engine power)
            capacity: Number, // (Wh - battery capacity)
            voltage: Number, // (V - battery voltage)

            maxSpeed: Number, // (Km/h)

            hasSeat: Boolean,
            hasSuspension: Boolean,
        },
    }),
);

const EScooter = PMV.discriminator(
    "e_scooter",
    new mongoose.Schema({

        details: {
            brand: String,
            model: String,
            wheelDiameter: Number, // (Inch)
            power: Number, // (W - engine power)
            capacity: Number, // (Wh - battery capacity)
            voltage: Number, // (V - battery voltage)
            maxSpeed: Number, // (km/h)
            driveType: String, // (AWD, Rear, Front) - полный, задний или передний привод
            weight: Number, // (kg) - критично для самокатов
            maxLoad: Number, // (kg) - максимальная нагрузка
            hasSeat: Boolean,
            hasSuspension: Boolean,
            isFoldable: Boolean, // складывается ли самокат
            deckWitdthCm: Number, // ????
        },
    }),
);

module.exports = { EBike, EUC, EScooter };
