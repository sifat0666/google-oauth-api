import {Express, Request, Response} from 'express'
import { createProductHandler, deleteProductHandler, getProductHandler, updateProductHandler } from './controller/product.controller'
import { createUserSessionHandler, deleteSessionHandler, getUserSessionHandler, googleOauthHandler } from './controller/session.controller'
import { createUserHandler, getCurrentUser } from './controller/user.controller'
import deserializeUser from './middleware/deseializeUser'
import requireUser from './middleware/requireUser'
import validateResource from './middleware/validateResource'
import { createProductSchema, deleteProductSchema, getProductSchema, updateProductSchema } from './schema/product.schema'
import { createSessionSchema } from './schema/session.schema'
import { createUserSchema } from './schema/user.schema'

function routes(app: Express){

    app.get('/healthcheck', (req: Request, res: Response)=> {
        res.status(200).send('ok')
    })

    app.get('/', (req,res) => res.send('hello'))

    app.post('/api/users',validateResource(createUserSchema), createUserHandler)
    app.get('/api/me',requireUser, getCurrentUser)
    app.get('/api/sessions/oauth/google', googleOauthHandler )

    app.post('/api/sessions',validateResource(createSessionSchema) , createUserSessionHandler)

    app.get('/api/sessions', deserializeUser ,requireUser,  getUserSessionHandler)

    app.delete('/api/sessions',deserializeUser,requireUser,  deleteSessionHandler)

      app.post(
        "/api/products",
        [requireUser, validateResource(createProductSchema)],
        createProductHandler
    );

    /**
     * @openapi
     * '/api/products/{productId}':
     *  get:
     *     tags:
     *     - Products
     *     summary: Get a single product by the productId
     *     parameters:
     *      - name: productId
     *        in: path
     *        description: The id of the product
     *        required: true
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *          application/json:
     *           schema:
     *              $ref: '#/components/schema/Product'
     *       404:
     *         description: Product not found
     */
    app.put(
        "/api/products/:productId",
        [requireUser, validateResource(updateProductSchema)],
        updateProductHandler
    );

    app.get(
        "/api/products/:productId",
        validateResource(getProductSchema),
        getProductHandler
    );

    app.delete(
        "/api/products/:productId",
        [requireUser, validateResource(deleteProductSchema)],
        deleteProductHandler
    );
    
}

export default routes