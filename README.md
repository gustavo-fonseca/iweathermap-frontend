# IWeatherMap - Frontend

## Development Installation

```bash

# Clone de repository
git clone https://github.com/gustavo-fonseca/iweathermap-frontend

# Go to project`s folder and copy env-example.json to env.json
cd ./iweathermap-frontend
cp env-example.json env.json

# Change api url and default city info in env.json file
{
    "forecast_api_url": "http://localhost:8000/",
    "city_default_data": {
        "code": "3451328",
        "name": "Ribeirão Preto",
        "state": "",
        "country": "BR"
    }
}

```


## Features

- [x] Get next five days forecast with every 3 hour data
- [x] Get next few days forecast with rain changes
