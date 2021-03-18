const express = require('express');
const router = express.Router();
const chefauth = require('../../middleware/chefauth');
const { check, validationResult } = require('express-validator');

const Shop = require('../../models/Shop');
const Chef = require('../../models/Chef');

// @route    GET api/shop/me
// @desc     Get current chefs shop
// @access   Private

router.get('/me', chefauth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ chef: req.chef.id });
        if (!shop) {
            return res
                .status(400)
                .json({ msg: 'There is no shop for this chef' });
        }

        res.json(shop);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/shop
// @desc     Create or update chefs shop
// @access   Private

router.post(
    '/',
    chefauth,
    check('name', 'Name is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, address, description, photo, cuisines } = req.body;

        //Build shop object
        const shopFields = {};
        shopFields.chef = req.chef.id;
        shopFields.name = name;
        shopFields.address = address;
        if (description) shopFields.description = description;
        if (photo) shopFields.photo = photo;
        if (cuisines) {
            shopFields.cuisines = cuisines
                .split(',')
                .map((cuisine) => cuisine.trim());
        }

        try {
            let shop = await Shop.findOne({ chef: req.chef.id });

            if (shop) {
                //Update
                shop = await Shop.findOneAndUpdate(
                    { chef: req.chef.id },
                    { $set: shopFields },
                    { new: true }
                );

                return res.json(shop);
            }

            //Create
            shop = new Shop(shopFields);

            await shop.save();
            res.json(shop);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    GET api/shop
// @desc     Get all shops
// @access   Public

router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find();
        res.json(shops);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/shop/chef/:chef_id
// @desc     Get shop by chef ID
// @access   Public

router.get('/chef/:chef_id', async (req, res) => {
    try {
        const shop = await Shop.findOne({ chef: req.params.chef_id });

        if (!shop) return res.status(400).json({ msg: 'Shop not found' });

        res.json(shop);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Shop not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/shop
// @desc     Delete shop and chef
// @access   Private

router.delete('/', chefauth, async (req, res) => {
    try {
        // Remove shop
        await Shop.findOneAndRemove({ chef: req.chef.id });
        // Remove chef
        await Chef.findOneAndRemove({ _id: req.chef.id });

        res.json({ msg: 'Chef deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/shop/menu
// @desc     Add shop menu
// @access   Private

router.put(
    '/menu',
    chefauth,
    check('categories').custom((categories) => {
        if (categories.length === 0) throw new Error('Menu cannot be empty');
        else {
            categories.forEach((category) => {
                if (!category.name || category.name.length === 0)
                    throw new Error('Category name cannot be empty');
                else if (category.dishes.length === 0)
                    throw new Error('Each Category must have one dish atleast');
                else if (category.dishes.length > 0) {
                    category.dishes.forEach((dish) => {
                        if (!dish.name || dish.name.length === 0)
                            throw new Error('Dish name cannot be empty');
                        else if (dish.price === undefined)
                            throw new Error('Dish has to have a price');
                        else if (dish.price < 0)
                            throw new Error('Dish price cannot be negative');
                        else if (dish.veg === undefined)
                            throw new Error(
                                'Dish needs to be tagged as Veg or Non-Veg'
                            );
                    });
                } else if (category.subCategories.length > 0) {
                    category.subCategories.forEach((subCategory) => {
                        if (!subCategory.name || subCategory.name.length === 0)
                            throw new Error('SubCategory name cannot be empty');
                        else if (subCategory.dishes.length === 0)
                            throw new Error(
                                'Each SubCategory must have atleast one dish'
                            );
                        else if (subCategory.dishes.length > 0) {
                            subCategory.dishes.forEach((dish) => {
                                if (!dish.name || dish.name.length === 0)
                                    throw new Error(
                                        'Dish name cannot be empty'
                                    );
                                else if (dish.price === undefined)
                                    throw new Error('Dish has to have a price');
                                else if (dish.price < 0)
                                    throw new Error(
                                        'Dish price cannot be negative'
                                    );
                                else if (dish.veg === undefined)
                                    throw new Error(
                                        'Dish needs to be tagged as Veg or Non-Veg'
                                    );
                            });
                        }
                    });
                }
            });
        }

        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const menu = req.body;

        try {
            const shop = await Shop.findOne({ chef: req.chef.id });

            console.log(menu.categories);
            shop.menu = menu;

            await shop.save();

            res.json(shop);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Update(Add/Delete/Change) stuff in shop menu

module.exports = router;
