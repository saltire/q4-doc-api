# Q4 Document API

This is a Node.js app for accessing Q4Web client documents.
It accesses data stored in MongoDB and returns it through JSONP.

## Configuration

The `config.js` file offers the following options:

- **baseroute**: the base URL for accessing the API. The default is `api/`.
- **port**: The port the app runs on. Default is 8888.
- **db**: Settings for accessing the MongoDB database.
    - **name**: The name of the database.
    - **username**: The MongoDB user.
    - **password**: The user's password.
    - **host**: The hostname where the DB is running. Default is `localhost`.
    - **port**: The port the DB is running on. Default is 27017.
- **clients**: A hash of client IDs to use in the API route,
  with their corresponding site names as they appear
  in the `SiteName` field in each document in the database.
- **defaultLimit**: The maximum number of documents to return,
  if no limit is specified in the request. Default is 20.

## API methods

The API is accessed using URLs of the following form:

`<base_route>/<client>/<content_type>/<action>`

- *base_route*: The base URL as configured in `config.js`.
- *client*: A client ID from the `clients` object in `config.js`.
- *content_type*: One of the following content types to retrieve:
    - **contentAssets** (Download List documents)
    - **events**
    - **financialReports**
    - **presentations**
    - **pressReleases**
- *action* *(optional)*: An action for further processing the results.
  If omitted, the raw document data will be returned. Valid actions are:
    - **count**: Returns the total number of documents.
    - **years**: Returns a hash of years, with the number of documents
      found for each year.

## Query parameters

The following query parameters can be added to the URL:

- **year**: Returns only documents dated within this year.
- **tag**: Returns only documents with this tag. If this argument is passed
  more than once, returns documents with at least one of the specified tags.
- **type**: Applies only to the *contentAssets* content type.
  Returns only documents of this download type.
- **limit**: The maximum number of documents to return.
  The default is set in `config.js`.
- **skip**: The number of documents to skip. Useful for pagination.
