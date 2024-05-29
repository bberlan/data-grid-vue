# data-grid-vue

Customized Data Grid Vue component with CRUD functions for rapid app development using AG Grid.

## Prerequisite

### Run data-grid-api

```sh
npm start
```

## Project Setup

### Run data-grid-vue

```sh
npm run dev
```

## To generate new sample for demo:

use [POST] http://localhost:5001/generates/:tablename

where _tablename_ is the filename for your json file to be created in the api data folder:

> _addresses.json_

and put this request body for data

```sh
{
    "street": "1234 Street",
    "city": "Alhambra",
    "stateCode": "CA",
    "zipCode": 12345,
    "countyCode": "LA",
    "countryCode": "US"
}
```

click the brand name (upper left corner) to refresh.

# data-grid-vue
