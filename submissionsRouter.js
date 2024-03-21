

const express = require('express');
const router = express.Router();
const db = require('./db'); // Your MySQL pool connection setup
const redisClient = require('./redisClient'); // Redis client setup

// Endpoint to submit a new entry
router.post('/submit', async (req, res) => {
  const { username, code_language, stdin, source_code } = req.body;
  const query = 'INSERT INTO submissions (username, code_language, stdin, source_code) VALUES (?, ?, ?, ?)';
  
  db.query(query, [username, code_language, stdin, source_code], async (error, results) => {
    if (error) {
      console.error('Database error in /submit:', error);
      return res.status(500).send({ message: 'Error submitting entry' });
    }
    
    try {
      // Invalidate the cache when a new submission is made
      await redisClient.DEL('submissionsCache');
      console.log('Cache invalidated successfully.');
    } catch (err) {
      console.error('Redis error when invalidating cache:', err);
    }

    res.status(200).send({ message: 'Submission successful', id: results.insertId });
  });
});
// Endpoint to fetch all submissions with caching
// Endpoint to fetch all submissions with caching
router.get('/submissions', async (req, res) => {
  const cacheKey = 'submissionsCache';

  try {
    // Attempt to fetch cached data using the correct method name
    const cachedSubmissions = await redisClient.GET(cacheKey);
    if (cachedSubmissions) {
      console.log('Serving data from cache');
      return res.json(JSON.parse(cachedSubmissions));
    }
    
    // If cache miss, query database
    const query = 'SELECT id, username, code_language, stdin, SUBSTRING(source_code, 1, 100) AS source_code, submission_time FROM submissions';
    db.query(query, async (error, results) => {
      if (error) {
        console.error('Database error in /submissions:', error);
        return res.status(500).send({ message: 'Error fetching submissions' });
      }

      // Cache the result and set an expiration time
      await redisClient.SETEX(cacheKey, 3600, JSON.stringify(results)); // Expires in 1 hour
      console.log('Serving data from database and updating cache');
      res.json(results);
    });
  } catch (error) {
    console.error('Error in /submissions route:', error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.delete('/submission/:id', async (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM submissions WHERE id = ?';

  db.query(deleteQuery, [id], async (error, results) => {
    if (error) {
      console.error('Database error in /submission/:id', error);
      return res.status(500).send({ message: 'Error deleting submission' });
    }

    if (results.affectedRows > 0) {
      try {
        // Invalidate the cache when a submission is deleted
        await redisClient.DEL('submissionsCache');
        console.log('Cache invalidated successfully.');
      } catch (err) {
        console.error('Redis error when invalidating cache:', err);
        // Even if cache invalidation fails, you might choose to continue the operation
      }

      res.status(200).send({ message: 'Submission deleted successfully' });
    } else {
      res.status(404).send({ message: 'Submission not found' });
    }
  });
});


router.delete('/submissions', async (req, res) => {
  const deleteAllQuery = 'DELETE FROM submissions';

  db.query(deleteAllQuery, async (error, results) => {
    if (error) {
      console.error('Database error in /submissions delete all:', error);
      return res.status(500).send({ message: 'Error deleting all submissions' });
    }

    if (results.affectedRows > 0) {
      try {
        // Invalidate the cache when all submissions are deleted
        await redisClient.DEL('submissionsCache');
        console.log('All submissions cache invalidated successfully.');
      } catch (err) {
        console.error('Redis error when invalidating all submissions cache:', err);
        // Even if cache invalidation fails, you might choose to continue the operation
      }

      res.status(200).send({ message: 'All submissions deleted successfully' });
    } else {
      res.status(404).send({ message: 'No submissions to delete' });
    }
  });
});


module.exports = router;
