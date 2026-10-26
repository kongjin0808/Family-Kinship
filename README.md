# Chinese Family Kinship App – Setup Guide

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app (HTML + CSS + JS). Open in a browser or host anywhere. |
| `Code.gs` | Google Apps Script backend: checks the passcode, returns your Sheet as JSON. |
| `sample-data.csv` | 6 example people (3 generations) to import into your Sheet. |

The current `index.html` is connected to the family's Apps Script URL and prompts for the family passcode. If you want to run the built-in demo instead, change `APPS_SCRIPT_URL` back to `YOUR_APPS_SCRIPT_URL_HERE`.

## Step 1: Create the Google Sheet

1. Create a new Google Sheet. Rename the first tab to exactly `People`.
2. Import `sample-data.csv` (File > Import > Upload > "Replace current sheet"), or type your own family with this header row:

   `ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank`

Rules for the data:
- `ID` is any unique value (1, 2, 3 ...). `Father_ID`, `Mother_ID`, `Spouse_ID` point to another row's `ID`. Leave blank if unknown.
- `Gender` is `M` or `F`. It decides 儿子/女儿, 哥哥/姐姐 and so on, so fill it for everyone.
- `Sibling_Rank`: 1 = eldest among full siblings. If blank, `Birth_Year` is used to decide older or younger.
- People who marry in (no parents listed) are placed in their spouse's generation row automatically.
- Siblings are detected when two people share a Father_ID or Mother_ID.

## Step 2: Add the backend

1. In the Sheet: **Extensions > Apps Script**.
2. Delete the default code, paste in `Code.gs`, and save.
3. Click the gear icon (**Project Settings**) > **Script Properties** > **Add script property**:
   - Property: `FAMILY_PASSCODE`
   - Value: the passcode your family will type (for example `jiating2026`)
4. **Deploy > New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when asked, then copy the **Web app URL** (ends with `/exec`).
6. Test it: open `YOUR_URL?key=YOUR_PASSCODE` in a browser. A successful response should contain `data` as an array. The frontend accepts either `{"status":"ok","data":[...]}` or `{"status":"success","data":[...]}`. A wrong key should return `{"status":"error",...}`.

Whenever you change `Code.gs`, use **Deploy > Manage deployments > Edit > New version**, or the old code keeps running. Editing Sheet rows needs no redeploy.

## Step 3: Connect the app

Open `index.html` in a text editor and change the line near the top of the script:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
```

## Step 4: Share it

- Quick test: double-click `index.html`.
- For family: host it free on GitHub Pages, Netlify Drop or Cloudflare Pages (upload the single file), then send the link and the passcode.

## How it behaves

- First visit asks for **Enter Family Passcode / 输入家族密码**. The passcode is saved in the browser's `localStorage`.
- A wrong passcode (`status: "error"`) clears the saved value and shows the prompt again.
- **Change Passcode / 退出** (top right) clears the saved passcode.
- Rows without a name are omitted. Tap a card for Person A (me), then a card for Person B. The banner shows both titles.
- Use **Clear selections / 清除选择** to reset both people. Male and female cards have distinct background colors, and spouses are arranged male-left/female-right.
- Drag to pan; pinch or use + / − / ⤢ to zoom.

## Good to know

- The passcode is a light family gate, not strong security. It travels in the URL, and anyone who knows it can read the whole sheet. Don't put sensitive details (ID numbers, addresses) in the Sheet.
- The Apps Script URL is visible in the page source. That's fine, since the passcode protects the data.
- Titles come from `relationship.js`, loaded from jsDelivr. For stability, pin an exact version in the script tag (for example `relationship.js@x.y.z`) after you confirm the version you tested works. If the library fails to load, the banner shows the Chinese relation chain (like 爸爸的哥哥) plus an error.
- Titles can differ by region (for example 舅舅 versus 娘舅). The library picks its standard Mandarin title.
- Very large families (50+ people in one generation) will need zooming out; the layout is one row per generation.
