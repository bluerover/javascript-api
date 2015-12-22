# BlueRover Web API for JavaScript

## Components

This library contains interfaces for the BlueRover web API and the BlueRover stream API.

## Usage

### Stream API Usage

#### Step 1: Create an instance of the API

```
var BlueRoverApi = require('bluerover');
var api = new BlueRoverApi(<your_key>, <your_token>, <URL>);
```

#### Step 2: Create a stream instance
```
var stream = api.createStream();
```

#### Step 3: Assign event callbacks
```
stream.on('data', function(data) {
  console.log(data);
});
```

#### Step 4: Start the stream
```
stream.start();
```