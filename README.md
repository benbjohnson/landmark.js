landmark.js
===========

## Overview

The JavaScript tracking code for the Landmark analytics service.


## Installation

To load the library, simply add the following to your web page:

```html
<script>window.landmark=[];</script>
<script src="https://landmark.io/landmark.js"></script>
```

The Landmark JavaScript API works by using the `push()` method to execute methods.
This is to prevent errors in the unlikely event that the `landmark.js` file is unable to load.


## Identification

If you know the identity of the current user on your web page, you can track them across sessions by using the `identify()` function.
Let's say you have a user with an id of `123` in your system.
You can use the `identify` function like this:

```html
<script>
  landmark.push("identify", 123);
</script>
```

You can also track traits of the user within the `identify` function:

```html
<script>
  landmark.push("identify", 123, {"name":"Bob Smith", "latitude":39.7392, "longitude":104.9842})
</script>
```

You must setup traits in the Landmark admin first before tracking them.


## Tracking

In addition to identifying users you can also track individual actions that a user performs using the `track` function.

```html
<script>
  landmark.push("track", "/index.html")
</script>
```

The `track` function also allows you to track properties about the event:

```html
<script>
  landmark.push("track", "/checkout.html", {"purchasePrice":102.32, "numItems":3})
</script>
```
