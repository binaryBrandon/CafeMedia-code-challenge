const fs = require('fs');
const csv = require('csv-parser');

var topPosts = [];
var otherPosts = [];
var maxRank = 0;
var once = false;
var bestPost, header;
const inFile = 'posts.csv';
const topFile = 'top_posts.csv';
const otherFile = 'other_posts.csv';
const dailyTopFile = 'daily_top_posts.csv'; //possible typo: should this be "daily top post" singular?


function readPosts(inFile) {
  fs.createReadStream(inFile) //create a data stream from input
    .pipe(csv()) //pipe stream to csv() function from csv-parser
    .on('headers', (headers) => { //read current headers to var
      header = headers + '\n'; //append header var with newline so can be reused for output header
    })
    .on('data', (post) => { //do following on data
      //first, find top posts. views > 9k, comments > 10, privacy === public, title length < 40
      if (post.views > 9000 && post.comments > 10 && post.privacy === 'public' && post.title.length < 40) {
        topPosts.push(post.id); //push post ID of posts which pass logic to array
        if (post.likes > maxRank) { //check if this post has higher like count than previous max
          maxRank = post.likes; //if it does, update highest like count
          bestPost = post; //also set bestPost to current post object
        }
      } else {
        otherPosts.push(post.id); //otherwise, go to "other" array
        if (post.likes > maxRank) { //must be repeated here; there is chance most liked post has few views, less than 10 comments, etc.
          maxRank = post.likes;
          bestPost = post;
        }
      }
    })
    .on('end', () => { //once read completes
      writeOut(topPosts, topFile); //call function to write posts' IDs to file
      writeOut(otherPosts, otherFile); //call function to write other posts' IDs to file
      writeOut(bestPost, dailyTopFile); //call function to write the best post to file
    });
}

function writeOut(outData, dest) { //outData is data to write, dest is file name to write to
  if (Array.isArray(outData)) { //if outData is array, use join
    fs.writeFile(dest, outData.join("\n"), err => { //use .join to "cast" array into string with elements separated by newlines
      if (err) {
        console.log('Something went wrong printing this array', err);
      } else {
        console.log('File saved');
      }
    });
  } else { //should be modular to turn any single post object into array, then print with header
    outArray = Object.values(outData); //turn object into array
    fs.writeFileSync(dest, header, err => { //header is string with newline on end
      if (err) {
        console.log('Something went wrong printing the header', err);
      } else {
        console.log('File saved');
      }
    })
    fs.appendFile(dest, outArray.join(","), err => { //use .join to "cast" array into string with elements separated by commas
      if (err) {
        console.log('Something went wrong printing this object as an array', err);
      } else {
        console.log('File updated');
      }
    });
  }
}


readPosts(inFile);
