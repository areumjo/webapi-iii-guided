const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Hubs Router, WHOOOO!'); // whenever we use this route (which is /api/hubs), print this out
  next();
})

// this only runs if the url has /api/hubs in it
router.get('/', (req, res) => {
  Hubs.find(req.query)
  .then(hubs => {
    res.status(200).json(hubs);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the hubs',
    });
  });
});

// /api/hubs/:id

router.get('/:id', validateId,  (req, res) => {
  res.status(200).json(req.hub);
  // no need to call database/check if id exist/try-catch
});

router.post('/', (req, res) => {
  Hubs.add(req.body)
  .then(hub => {
    res.status(201).json(hub);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error adding the hub',
    });
  });
});

router.delete('/:id', requiredBody, async (req, res) => {
  Hubs.remove(req.params.id)
  .then(count => {
    if (count > 0) {
      res.status(200).json({ message: 'The hub has been nuked' });
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error removing the hub',
    });
  });
});

router.put('/:id', validateId, requiredBody, async (req, res) => {
  Hubs.update(req.params.id, req.body)
  .then(hub => {
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error updating the hub',
    });
  });
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', validateId, async (req, res) => {
  Hubs.findHubMessages(req.params.id)
  .then(messages => {
    res.status(200).json(messages);
  })
  .catch (error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  });
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', validateId, requiredBody, async (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
  .then(message => {
    res.status(210).json(message);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  });
});

async function validateId(req, res, next) {
  try {
    const { id } = req.params;
    const hub = await Hubs.findById(id);
    if (hub) {
      req.hub = hub;
      next();
    } else {
      next({ message: 'Hub not found; invalid id'});
      // res.status(404).json({ message: 'Hub not found; invalid id'});
    }
  }
  catch (err) {
    res.status(500).json({ message: 'Failed to process request'});
  }
}
// write one error-handling middleware once, and place all endpoints that will need this fn (validateId - related to ID)
// put this fn, asyn to router endpoints as a parameter (can add more than one middleware as a parameter)


function requiredBody(req, res, next) {
  // want the body is defined and not an empty object || respond with status 400 and msg
  if (req.body && Object.keys(req.body).length) {
    // go on to the next bit of middleware
    next();
  } else {
    // when some error msg is inside of `next()` => jump to a error handler (skip over everything) bit of (global) middleware 
    next({ message: 'Please include request body'})
  }

} // post and put will need this fn
module.exports = router;
