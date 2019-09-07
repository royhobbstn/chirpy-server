const Twitter = require("twitter-lite");

const appRouter = function(app) {
  app.get("/getAuthTokens", async (req, res) => {
    if (!req.query.callback) {
      res
        .status(400)
        .send({ error: "Forgot to include ?callback={url} in querystring" });
    }

    const callback_url = decodeURIComponent(req.query.callback);

    const client = new Twitter({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET
    });

    client
      .getRequestToken(callback_url)
      .then(response => {
        res.status(200).send(response);
      })
      .catch(e => {
        console.log(e);
        res.status(500).send(e);
      });
  });

  app.post("/getAccessTokens", async (req, res) => {
    const client = new Twitter({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET
    });

    client
      .getAccessToken({
        key: req.body.key,
        secret: req.body.secret,
        verifier: req.body.verifier
      })
      .then(response => {
        const info = {
          accTkn: response.oauth_token,
          accTknSecret: response.oauth_token_secret,
          userId: response.user_id,
          screenName: response.screen_name
        };
        res.status(200).send(info);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(err);
      });
  });

  app.post("/getData", async (req, res) => {
    const logExcluded = false;

    const client = new Twitter({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token_key: req.body.key,
      access_token_secret: req.body.secret
    });

    return client
      .get("statuses/home_timeline", { count: 200, tweet_mode: "extended" })
      .then(response => {
        const json = response
          .filter(tweet => {
            const hasLink =
              tweet.full_text.includes("https") && tweet.entities.urls[0];
            if (!hasLink && logExcluded) {
              console.log(`EXCLUDED - NO LINKS: ${tweet.full_text}`);
            }
            return hasLink;
          })
          .filter(tweet => {
            const isTwitterLink =
              tweet.entities.urls[0] &&
              tweet.entities.urls[0].expanded_url.includes("twitter.com");
            if (isTwitterLink && logExcluded) {
              console.log(
                `EXCLUDED - TWITTER INTERNAL LINK: ${tweet.full_text} ${tweet.entities.urls[0].expanded_url}`
              );
            }
            return !isTwitterLink;
          })
          .filter(tweet => {
            const isTwitterLink =
              tweet.entities.urls[0] &&
              tweet.entities.urls[0].expanded_url.includes("instagram.com");
            if (isTwitterLink && logExcluded) {
              console.log(
                `EXCLUDED - INSTAGRAM LINK: ${tweet.full_text} ${tweet.entities.urls[0].expanded_url}`
              );
            }
            return !isTwitterLink;
          })
          .map(tweet => {
            return {
              id_str: tweet.id_str,
              full_text: tweet.full_text,
              truncated: tweet.truncated,
              entities: tweet.entities,
              user: {
                id_str: tweet.user.id_str,
                name: tweet.user.name,
                screen_name: tweet.user.screen_name
              }
            };
          });

        res.status(200).send(json);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send([]);
      });
  });
};

module.exports = appRouter;
