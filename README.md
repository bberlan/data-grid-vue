# data-grid-vue

Customized Data Grid Vue component using AG Grid with CRUD functions for rapid app development.

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

where _tablename_ is the filename (e.g. _addresses_) for your json file to be created in the api data folder:

> _addresses.json_
>
> _addresses.template.json_

and include your data in the request body:

```sh
# sample data
{
    "street": "1234 Street",
    "city": "Alhambra",
    "stateCode": "CA",
    "zipCode": 12345,
    "countyCode": "LA",
    "countryCode": "US",
    "exists": false,
    "incorporated": "1903-07-11"
}
```

click the brand name (upper left corner) to refresh.

# data-grid-vue
