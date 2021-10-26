const router = require('express').Router();
const roboRoutes = require('../apiRoutes/roboRoutes');
const animalRoutes = require('../apiRoutes/animalRoutes');
const zookeeperRoutes = require('../apiRoutes/zookeeperRoutes');



router.use(roboRoutes);
router.use(animalRoutes);
router.use(zookeeperRoutes);


module.exports = router;