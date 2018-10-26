exports.answerWithError = function(err, req, res) {
  console.log(err);
  if (err.custom_code) {
    if (err.custom_code == 400) {
      return res.status(400).send('Bad request');
    } else if (err.custom_code == 401) {
      return res.status(401).send('Unauthorized');
    } else if (err.custom_code == 404) {
      return res.status(404).send('Not found');
    } else if (err.custom_code == 422) {
      return res.status(422).send(err.custom_message);
    }
  } else {
    return res.status(500).send('Internal error');
  }
}