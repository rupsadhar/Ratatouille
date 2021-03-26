const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chef'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    address: {
        type: String,
        requied: true
    },
    photo: {
        type: String
    },
    cuisines: {
        type: [String]
    },
    openHours: [
        {
            open: Boolean,
            day: String,
            openTime: Date,
            closeTime: Date
        }
    ],
    menu: {
        categories: {
            type: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    dishes: {
                        type: [
                            {
                                name: {
                                    type: String,
                                    required: true
                                },
                                price: {
                                    type: Number,
                                    required: true
                                },
                                description: {
                                    type: String
                                },
                                photo: {
                                    type: String
                                },
                                cuisine: {
                                    type: [String]
                                },
                                discount: {
                                    isSet: Boolean,
                                    percent: Number
                                },
                                veg: {
                                    type: Boolean,
                                    required: true
                                }
                            }
                        ],
                        required: true
                    },
                    subCategories: {
                        type: [
                            {
                                name: {
                                    type: String,
                                    required: true
                                },
                                dishes: {
                                    type: [
                                        {
                                            name: {
                                                type: String,
                                                required: true
                                            },
                                            price: {
                                                type: Number,
                                                required: true
                                            },
                                            description: {
                                                type: String
                                            },
                                            photo: {
                                                type: String
                                            },
                                            cuisine: {
                                                type: [String]
                                            },
                                            discount: {
                                                isSet: Boolean,
                                                percent: Number
                                            },
                                            veg: {
                                                type: Boolean,
                                                required: true
                                            }
                                        }
                                    ],
                                    required: true
                                }
                            }
                        ]
                    }
                }
            ],
            required: true
        }
    }
});

module.exports = Shop = mongoose.model('shop', ShopSchema);
