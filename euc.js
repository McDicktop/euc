const mongoose = require('mongoose');

const EucSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
    },
    imgs: {
        type: [Array],

    },
    sn: {
        type: String,
        required: true,
    },
    specs: {
        power: {
            type: Number,

        },
        capacity: {
            type: Number,
        },
        maxSpeed: {
            type: Number,
        },
        isSuspension: {
            type: Boolean,
        },
    },
    mileage: {
        type: Number,
        default: 0,
    },
    tyre: {
        isRegular: {
            type: Boolean,
            default: true,
        },
        model: {
            type: String,
            default: '',
        },
    },
    pads: {
        isExists: {

        },
        isRegular: {

        },
        model: {

        },
    },
    seat: {
        isExists: {

        },
        isRegular: {

        },
        model: {

        },
    },
    rating: {

    },
    rents: {
        type: [{
            renter: {

            },
            rendPeriod: {

            },
            
        }]
    },
    // daysInRent: {

    // },
    // renters: {
    //     type: [String]
    // }

});

module.exports = mongoose.model('Euc', EucSchema);