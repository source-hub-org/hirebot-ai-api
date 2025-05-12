/**
 * Common Swagger Schemas for Logic Tags and Logic Questions
 * @module routes/logic-common-schemas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LogicTag:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the tag
 *           example: 60d21b4667d0d8992e610c85
 *         name:
 *           type: string
 *           description: The name of the logic tag
 *           example: Logical Reasoning
 *         slug:
 *           type: string
 *           description: URL-friendly version of the tag name
 *           example: logical-reasoning
 *         description:
 *           type: string
 *           description: A description of what the tag represents
 *           example: Questions that test logical reasoning abilities
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the tag was created
 *           example: 2023-06-19T15:30:45.123Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the tag was last updated
 *           example: 2023-06-20T10:15:30.456Z
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         name: Logical Reasoning
 *         slug: logical-reasoning
 *         description: Questions that test logical reasoning abilities
 *         createdAt: 2023-06-19T15:30:45.123Z
 *         updatedAt: 2023-06-20T10:15:30.456Z
 *
 *     LogicTagInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the logic tag
 *           example: Logical Reasoning
 *         slug:
 *           type: string
 *           description: URL-friendly version of the tag name (optional, will be generated from name if not provided)
 *           example: logical-reasoning
 *         description:
 *           type: string
 *           description: A description of what the tag represents
 *           example: Questions that test logical reasoning abilities
 *
 *     Choice:
 *       type: object
 *       required:
 *         - text
 *         - is_correct
 *       properties:
 *         text:
 *           type: string
 *           description: The text of the choice
 *           example: Paris
 *         is_correct:
 *           type: boolean
 *           description: Whether this choice is correct
 *           example: true
 *
 *     LogicQuestion:
 *       type: object
 *       required:
 *         - question
 *         - level
 *         - tag_ids
 *         - type
 *         - answer_explanation
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the question
 *           example: 60d21b4667d0d8992e610c86
 *         question:
 *           type: string
 *           description: The text of the question
 *           example: If all roses are flowers and some flowers fade quickly, which of the following statements must be true?
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           description: The difficulty level of the question (1-6)
 *           example: 3
 *         tag_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tag IDs associated with this question
 *           example: ["60d21b4667d0d8992e610c85"]
 *         type:
 *           type: string
 *           enum: [multiple_choice, open_question]
 *           description: The type of question
 *           example: multiple_choice
 *         choices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Choice'
 *           description: Array of choices for multiple choice questions
 *         answer_explanation:
 *           type: string
 *           description: Explanation of the correct answer
 *           example: The statement "Some roses fade quickly" must be true because if all roses are flowers and some flowers fade quickly, then it's possible that some of those quickly fading flowers are roses.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the question was created
 *           example: 2023-06-19T15:30:45.123Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the question was last updated
 *           example: 2023-06-20T10:15:30.456Z
 *       example:
 *         _id: 60d21b4667d0d8992e610c86
 *         question: If all roses are flowers and some flowers fade quickly, which of the following statements must be true?
 *         level: 3
 *         tag_ids: ["60d21b4667d0d8992e610c85"]
 *         type: multiple_choice
 *         choices: [
 *           {
 *             text: "All roses fade quickly",
 *             is_correct: false
 *           },
 *           {
 *             text: "Some roses fade quickly",
 *             is_correct: false
 *           },
 *           {
 *             text: "No roses fade quickly",
 *             is_correct: false
 *           },
 *           {
 *             text: "Some roses might fade quickly",
 *             is_correct: true
 *           }
 *         ]
 *         answer_explanation: The statement "Some roses might fade quickly" must be true because if all roses are flowers and some flowers fade quickly, then it's possible that some of those quickly fading flowers are roses.
 *         createdAt: 2023-06-19T15:30:45.123Z
 *         updatedAt: 2023-06-20T10:15:30.456Z
 *
 *     LogicQuestionInput:
 *       type: object
 *       required:
 *         - question
 *         - level
 *         - tag_ids
 *         - type
 *         - answer_explanation
 *       properties:
 *         question:
 *           type: string
 *           description: The text of the question
 *           example: If all roses are flowers and some flowers fade quickly, which of the following statements must be true?
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           description: The difficulty level of the question (1-6)
 *           example: 3
 *         tag_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tag IDs associated with this question
 *           example: ["60d21b4667d0d8992e610c85"]
 *         type:
 *           type: string
 *           enum: [multiple_choice, open_question]
 *           description: The type of question
 *           example: multiple_choice
 *         choices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Choice'
 *           description: Array of choices for multiple choice questions
 *         answer_explanation:
 *           type: string
 *           description: Explanation of the correct answer
 *           example: The statement "Some roses might fade quickly" must be true because if all roses are flowers and some flowers fade quickly, then it's possible that some of those quickly fading flowers are roses.
 *
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 50
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 5
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Status of the response
 *           example: error
 *         message:
 *           type: string
 *           description: Error message
 *           example: Failed to create logic tag.
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of error messages
 *           example: ["Tag name is required", "Invalid tag ID format"]
 */

/**
 * @swagger
 * tags:
 *   - name: Logic Tags
 *     description: API endpoints for managing logic tags
 *   - name: Logic Questions
 *     description: API endpoints for managing logic questions
 */

module.exports = {};
