# Script loader (Cloudflare Pages)

Static site. No backend, so nobody can upload except you.

## Add a script
Put a file in the `script/` folder. The filename (no extension) is the URL:

    script/mygame      ->  https://YOURSITE.pages.dev/script/mygame

Roblox loader line:

    loadstring(game:HttpGet("https://YOURSITE.pages.dev/script/mygame"))()

## Deploy
- Easiest: Cloudflare dashboard > Workers & Pages > Create > Pages > Upload assets, drop this folder.
- Or push to a private GitHub repo and connect it (build command: none, output dir: `/`).
- To add/update a script, re-upload or push. Only people with your Cloudflare/GitHub login can change anything.
