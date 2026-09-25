# CPU Tycoon - Embed Code Guide

## How to Embed the Game on Your Website

CPU Tycoon can be easily embedded into any website using an iframe. Choose the option that works best for your site!

### Option 1: Simple Embed (Recommended)
Just copy and paste this into your HTML:

```html
<iframe 
    src="https://Carlin23-stack.github.io/game/embed.html" 
    width="100%" 
    height="800" 
    style="border: none; border-radius: 10px; box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);"
    allow="localStorage"
    title="CPU Tycoon Game">
</iframe>
```

### Option 2: Responsive Container
For a container with max-width:

```html
<div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px;">
    <iframe 
        src="https://Carlin23-stack.github.io/game/embed.html" 
        width="100%" 
        height="900" 
        style="border: none; border-radius: 15px; box-shadow: 0 12px 48px rgba(0, 212, 255, 0.2);"
        allow="localStorage"
        title="CPU Tycoon Game">
    </iframe>
</div>
```

### Option 3: Fullscreen Embed
Makes the game take up the entire screen:

```html
<iframe 
    src="https://Carlin23-stack.github.io/game/embed.html" 
    style="width: 100vw; height: 100vh; border: none; position: fixed; top: 0; left: 0;"
    allow="localStorage"
    title="CPU Tycoon Game">
</iframe>
```

## Important Notes

⚠️ **Do NOT remove the `allow="localStorage"` attribute** — the game needs this to save your progress!

### Customization Options

**Adjust Height:**
- `height="600"` — Compact (mobile-friendly)
- `height="800"` — Standard
- `height="1000"` — Large (full content visible)

**Adjust Border Style:**
```css
style="border: 2px solid #00d4ff; border-radius: 15px; box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);"
```

**Adjust Max Width:**
```css
style="width: 100%; max-width: 1400px;" /* Wider */ 
style="width: 100%; max-width: 800px;" /* Narrower */
```

## Direct Game URLs

- **Full Game:** `https://Carlin23-stack.github.io/game/index.html`
- **Embed Version:** `https://Carlin23-stack.github.io/game/embed.html`
- **Landing Page:** `https://Carlin23-stack.github.io/game/start.html`

## Troubleshooting

**Game won't save:**
- Make sure `allow="localStorage"` is in your iframe tag

**Game looks small/cut off:**
- Increase the `height` value
- Use a container div with `max-width`

**Game controls not working:**
- Check browser console for JavaScript errors
- Make sure you're using HTTPS (not HTTP)

## Support

For issues or questions, check the GitHub repo:
https://github.com/Carlin23-stack/game
