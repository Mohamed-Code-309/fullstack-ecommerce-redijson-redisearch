# fullstack-ecommerce-redijson-redisearch
a simple fullstack ecommerce app that demonstrate using redis modules __*redisearch*__ and __*redijson*__ to filter and sort products.

### App Photo
![Untitled](https://github.com/Mohamed-Code-309/fullstack-ecommerce-redijson-redisearch/assets/76752257/a5ed96fc-3847-4f9d-8155-e28bb08c7730)

#
### App Summary
- a full-stack ECommerce application demonstrating filtering, sorting and searching for products using __redisearch__
- data is inserted in redis database in json format using __redijson__ 
#
### How to run: 
1. make sure you have an instance of redis installed that contain both modules __redisearch__ and __redijson__.
    - you can have it using docker:
    ```docker run -d --name redis-search -p 6379:6379 redislabs/redisearch:latest``` 
2. inside each folder `client` and `server`, run the command `npm i`
3. in the root of the project,  run in terminal `npm start` to launch both the frontend and the backend servers.
   - Backend server will run on port `3001`
   - Frontend server will run on port `3000`

4. to test Backend APIs seperately without the frontend:
- APIs:
  * GET => `/items` => list all items, support different filter and sort options (check the front end)
  * GET => `/items/grouping` => count number of items in each different category
  
