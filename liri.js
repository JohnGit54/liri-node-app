

require("dotenv").config();

var keys = require('./key.js');


var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);


var Twitter = require('twitter');
var client = new Twitter(keys.twitter);


var request = require('request');

var fs = require("fs");


// Store all of the arguments in an array
var nodeArgs = process.argv;

var userTitle = ""; //this will hold either the requsted song or movie title

// Loop through all the words in the node argument
// And do a little for-loop magic to handle the inclusion of "+"s
for (let i = 3; i < nodeArgs.length; i++) {
    userTitle = (userTitle + " " + nodeArgs[i]).trim();
}
//console.log("song or movie requested:", userTitle);

var requestType = process.argv[2];

switch (requestType) {
    case 'my-tweets':
        get_my_tweets();
        break;
    case 'post-tweet':
        post_tweet();
        break;
    case 'spotify-this-song':
        spotify_song(userTitle); // song name
        break;
    case 'movie-this':
        movie_this(userTitle);
        break;
    case 'do-what-it-says':
        do_what_it_says();
        break;
    default:
        console.log('Bad Request inputed');
}

//JohnPalumbo54
function get_my_tweets() {

    var params = {
        q: 'JohnPalumbo54',
        count: 20
    };
    client.get('search/tweets/', params, function (error, tweets, response) {
        var msg = "";
        if (!error) {
            var tstat = tweets.statuses;  //tstat -- tweet status
            tstat.forEach(element => {
                console.log(element.created_at, element.text);
                msg += '\n' + element.created_at + ' - ' + element.text;
            });
        } else {
            console.log(" error in tweet ", error);
        }
        writeLog("my Tweets", msg);
    });
}


//add tweets .
function post_tweet() {
    client.post('statuses/update', { status: "#23  - PayPal Has Been Quietly Getting Into the Traditional Banking Business" }, function (error, tweet, response) {
        if (error) throw error;
        console.log(tweet);  // Tweet body. 
    });
}


function spotify_song(songname) {

    if (songname == "") {
        songname = 'ace of base the sign';
    }

    spotify.search({ type: 'track', query: songname, limit: 10 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                var msg = "";
                for (let i = 0; i < element.items.length; i++) {
                    const ele = element.items[i];
                    var artist = ele.album.artists[0].name;
                    var sngnm = ele.name;
                    var song = ele.external_urls.spotify;
                    var preview = ele.preview_url;
                    var alb = ele.album.name;
                    msg = 'Artist: ' + artist + " , Album:   " + alb + "  Song Name: "
                        + sngnm + "\nSong URL:   " + song + " , \nPreview Url:  " + preview;
                    console.log(msg);
                    writeLog('SPOTIFY', msg);
                }
            }
        }


    });
}

function movie_this(userTitle) {

    var qsearch;  // for querystring- will hold title search and movie or id and movie    

    if (userTitle == "") {
        qsearch = 'i=tt0485947';  //mr nobody;  -if no movie was asked for --- return mr nobody.
    } else {
        qsearch = 't=' + userTitle;
    }

    var queryUrl = "http://www.omdbapi.com/?" + qsearch + "&apikey=trilogy&y=&plot=short&tomatoes=true&r=json";

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var oBody = JSON.parse(body);
            if (oBody.Response === 'False') {
                console.log("in false");
                return;
            }
            writeMovie(oBody);
        } else {
            console.log(" Error in Movie Request :", error);
        }


    })

    function writeMovie(oBody) {
        console.log(" This is function write Movie  - here is JSON of BODY", oBody);//bodyJson);
        var msg = '* Title of the movie: ' + oBody.Title + "\n* Year the movie came out: " + oBody.Year;
        msg += '\n* IMDB Rating of the movie: ' + oBody.imdbRating;
        msg += '\n* Rotten Tomatoes Rating of the movie: ' + oBody.Ratings[1].Value + "," + oBody.tomatoRating;
        msg += '\n* Country where the movie was produced: ' + oBody.Country + "\n* Language of the movie:" + oBody.Language;
        msg += '\n* Plot of the movie: ' + oBody.Plot + '\n* Actors in the movie: ' + oBody.Actors;
        writeLog("MOVIES", msg);
    }
}

function do_what_it_says() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            console.log("error in read file");
            return (console.log(err));
        }

        //console.log("read: ", data);


        //read random.txt - create dataArray (use bank.js)
        dataArray = data.split(",");
        switch (dataArray[0]) {
            case 'my-tweets':
                get_my_tweets();
                break;
            case 'post-tweet':
                post_tweet();
                break;
            case 'spotify-this-song':
                spotify_song(dataArray[1]); // song name
                break;
            case 'movie-this':
                movie_this(dataArray[1]);
                break;
            // case 'do-what-it-says':  can cause endless loop
            //     do_what_it_says();
            //     console.log('do what it says');
            //     break;
            default:
                console.log(' in do what it says-- Bad Request inputted');
        }

    })
}


function writeLog(requestType, value) {
    var date = new Date();
    var header = '\n********** header for: ' + requestType + ' ** ' + date + '*************\n'
    fs.appendFileSync('log.txt', header, 'utf8', function (err) {
        if (err) {
            console.log('Write Error ', requestType, err);
        }
    });
    fs.appendFileSync('log.txt', value, 'utf8', function (err) {
        if (err) {
            console.log('Write Error ', requestType, err);
        }
    });
    fs.appendFileSync('log.txt', '\n************************ footer for:' + requestType + "  ***********\n", 'utf8', function (err) {
        if (err) {
            console.log('Write Error ', requestType, err);
        }
    });

}