# hirebot-ai-api

The backend service of Hirebot AI, responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates. Built with Node.js, using Express for RESTful APIs and MongoDB for data storage.

## API Documentation

This project uses Swagger to document the API endpoints. The documentation is automatically generated from JSDoc comments in the route files.

### Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

### Adding Documentation to Endpoints

To document an endpoint, add JSDoc comments with Swagger annotations above the route handler. For example:

```javascript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: Brief description of the endpoint
 *     description: Detailed description of what the endpoint does
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *         description: Description of the parameter
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   type: string
 *                   example: example value
 */
router.get('/resource', (req, res) => {
  // Route handler code
});
```

For more information on Swagger annotations, refer to the [swagger-jsdoc documentation](https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md).
