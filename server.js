const express = require('express');

const fs = require('fs');
const path = require('path');

// set default port to heroku environment variable or 3001
const PORT = process.env.PORT || 3001;

//instantiate the server
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
// set up front end data to be located in ./public
app.use(express.static('public'));

app.use((req, res, next) => {
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


//import animals data
const { animals } = require('./data/animals');

/* HIGH SCORE SERVER */
//import highscore data
let { highscore } = require('./data/roboHiScore');

// add a route for the front end to request from
app.get('/api/roboscores', (req, res) => {
    // send the animals or filtered animals as json data in response

    res.json(highscore);
});

app.post('/api/roboscores', (req, res) => {
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



    }
    /** END OF HIGH SCORE **/


//function to filer by query parameters
const filterByQuery = (query, animalsArray) => {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
};

const findById = (id, animalsArray) => {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

const createNewAnimal = (body, animalsArray) => {

    const animal = body;
    animalsArray.push(animal);

    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
};

const validateAnimal = (animal) => {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
};
/************** */
/***  ROUTES  ***/
/************** */

// add a route for the front end to request from
app.get('/api/animals', (req, res) => {
    // send the animals or filtered animals as json data in response
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

// add a second route with an :id for parameterName
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/animals', (req, res) => {
    // req.body is where our incoming content will be
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});

// Serve up the Index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


/**************/
/*** LISTEN ***/
/************ */

//set server to listen on port ${PORT}
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`)
});