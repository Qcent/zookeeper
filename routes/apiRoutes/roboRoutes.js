const router = require('express').Router();
//import highscore data
let { highscore } = require('../../data/roboHiScore');
//////////////////////////////
/* HIGH SCORE SERVER */

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Control-Allow-Methods",
            "POST, PUT, PATCH, GET, DELETE"
        )
        return res.status(200).json({})
    }
    next()
});
// add a route for the front end to request from
router.get('/roboserve', (req, res) => {
    // send the animals or filtered animals as json data in response

    res.json({ ip: '72.39.181.12' });
});
// add a route for the front end to request from
router.get('/roboscores', (req, res) => {
    // send the animals or filtered animals as json data in response

    res.json(highscore);
});
router.post('/roboscores', (req, res) => {
    // req.body is where our incoming content will be
    // if any data in req.body is incorrect, send 400 error back
    if (!validateRoboScore(req.body)) {
        res.status(400).send('The High Score is not properly formatted. ' + req.body);
        console.dir(req.body)
    } else {
        setNewHighScore(req.body)
            .then(data => {
                res.json(data);
            }).catch(err => {
                console.log(err);
                res.json(err);
            });
    }
});
const validateRoboScore = (hiScore) => {
    console.dir(hiScore)
    if (!hiScore.robot || typeof hiScore.robot !== 'string') {
        console.log(`Robot Error : ${typeof hiScore.robot}`);
        return false;
    }
    if (!hiScore.trainer || typeof hiScore.trainer !== 'string') {
        console.log(`Trainer Error : ${typeof hiScore.trainer}`);
        return false;
    }
    if (!hiScore.rounds || typeof parseInt(hiScore.rounds) !== 'number') {
        console.log(`Rounds Error : ${typeof parseInt(hiScore.rounds)}`);
        return false;
    }
    if (!hiScore.score || typeof parseInt(hiScore.score) !== 'number') {
        console.log(`Score Error : ${typeof parseInt(hiScore.score)}`);
        return false;
    }
    if (!hiScore.points || typeof parseInt(hiScore.points) !== 'number') {
        console.log(`Points Error : ${typeof parseInt(hiScore.points)}`);
        return false;
    }
    return true;
};
const setNewHighScore = newScore => {
    return new Promise((res, rej) => {
        if (newScore.points > highscore.points) {
            saveHighScore(newScore)
                .then(data => {
                    if (data.ok === true) {
                        res({
                            ok: true,
                            message: "New High Score Accepted!"
                        })
                    } else {
                        rej({
                            ok: false,
                            message: "Server Error -- Failed to write data!"
                        });
                    }
                })
        } else {
            rej({
                ok: false,
                message: "NEGATIVE! NOT HIGH ENOUGH"
            });
        }
    });
};
const saveHighScore = (newScore) => {

    console.log("NEW HIGH SCORE SUBMITED");
    console.dir(newScore);
    highscore = newScore;

    return new Promise((resolve, reject) => {
        fs.writeFile(
            path.join(__dirname, './data/roboHiScore.json'),
            JSON.stringify({ highscore: newScore }),
            err => {
                // if there's an error, reject the Promise and send the error to the Promise's `.catch()` method
                if (err) {
                    reject(err);
                    // return out of the function here to make sure the Promise doesn't accidentally execute the resolve() function as well
                    return;
                }

                console.log("HIGH SCORE WRITTEN TO DB!");
                // if everything went well, resolve the Promise and send the successful data to the `.then()` method
                resolve({
                    ok: true,
                    message: 'High Score Written'
                });
            });
    });



};
/** END OF HIGH SCORE **/
//////////////////////////////

module.exports = router;