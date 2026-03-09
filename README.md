ScrollStuff
===========

In the great tradition of reinventing the wheel, here is SmartScroll, a bookmarklet to scroll around a web page, in a continuous manner. It detects the words per lines and, knowing your reading speed, will scroll accordingly.


Usage
-----

See the setup instructions on the [homepage](http://trochr.github.io/ScrollStuff/) 


CDN / Bookmarklet URL
---------------------

The bookmarklets on the homepage use jsDelivr to load `smartscroll.js`:

```
https://cdn.jsdelivr.net/gh/trochr/ScrollStuff@gh-pages/smartscroll.js
```

This is the recommended URL for bookmarklet and userscript use because:
- jsDelivr serves `.js` files with `Content-Type: application/javascript`, which browsers require for `<script>` tags.
- jsDelivr is on the CSP allowlist of security-conscious sites (e.g. Wikipedia allows `*.jsdelivr.net`).
- **Avoid** using `raw.githubusercontent.com` as a `<script src>` — it serves files as `text/plain`, which Chrome's ORB/CORB logic may block.
- **Avoid** using `trochr.github.io` directly on sites with strict CSP, as GitHub Pages domains are not on most allowlists.


Caveats
------

- Some sites (such as github) block modifications of the DOM by externally loaded script. See more info on [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)

Testing page 
-----

http://trochr.github.io/ScrollStuff/tests/autoscroll.html
