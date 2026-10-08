# family-trips：Claude 工作規則

這個 repo 是 **public** 的（為了用免費的 GitHub Pages）。任何人都看得到所有檔案和完整的 commit 歷史，
所以這裡只能放「加密後」的東西。一旦明文被 push，就算之後刪掉，歷史裡還是找得到。

## 網站結構

- 根目錄 `index.html`：入口頁，內容是加密的旅程列表。
- 每趟旅程是根目錄下一個資料夾，命名 `YYYY-MM-<地點>`，地點用英文小寫（例如 `2030-04-kyoto`，僅為示意）。
- 旅程網址：`https://tgd93.github.io/family-trips/<資料夾名稱>/`

## 可以 commit 的檔案（白名單）

只允許以下檔案，根目錄的加密旅程列表也適用同一份清單：

- `app.bin`：加密後的內容
- `index.html`：解鎖頁（只含解鎖 UI 與解密程式，不含任何行程資訊）
- `sw.js`
- `manifest.webmanifest`
- 圖示（png / svg / ico）
- `robots.txt`
- 另外根目錄既有的 `.nojekyll`、`README.md`、`CLAUDE.md`

## 絕對不能 commit

- 明文行程：HTML、JSON、Markdown、文字檔、截圖、PDF，或任何解密後的內容
- 建置／加密腳本、設定檔、`node_modules/`
- 密碼、推導出的金鑰、`.env` 或任何存放密碼／金鑰的檔案

commit 前一定要跑 `git status` 和 `git diff --cached --stat`，確認只有白名單裡的檔案。
如果發現明文已經 commit：還沒 push 就 reset 掉；已經 push 的話，立刻停下來告訴使用者
（需要改寫歷史、換密碼，預約號碼等資料可能需要視為已外洩）。

## 加密方式

- AES-GCM；金鑰用 PBKDF2-SHA256、600000 次迭代，從密碼推導。
- **全家共用同一組密碼和同一組 salt**，所以每趟旅程推導出的金鑰都一樣。
  解鎖成功後把金鑰存在 localStorage 的 `family-trips-key`，
  因此同一台裝置只要解鎖過任何一趟，其他趟（和根目錄的旅程列表）都會自動解開。
- 新增旅程時必須沿用同一組密碼和 salt，否則自動解鎖會失效。
- 因為所有旅程共用同一把金鑰，**每次加密都必須產生新的隨機 IV（12 bytes）**，絕對不能重複使用 IV。

## 共用 origin 的注意事項

`tgd93.github.io` 底下所有 GitHub Pages 網站（不只這個 repo）共用同一個 origin，
localStorage、IndexedDB、Cache Storage、service worker 都是共用的。

- localStorage key、Cache Storage 名稱、IndexedDB 名稱一律加 `family-trips` 前綴，
  例如 `family-trips-key`、`family-trips-<資料夾名稱>-v3`。
- 不要呼叫 `localStorage.clear()`，也不要刪除不是自己前綴的 cache 或資料。

## Service worker

- 每趟旅程的 `sw.js` 放在自己的資料夾裡，scope 就是那個資料夾（`register('./sw.js', { scope: './' })`），只管自己的檔案。
- cache 名稱用 `family-trips-<資料夾名稱>-v<版本>`；activate 時只清除同一前綴的舊版 cache。
- 更新 `app.bin` 時要同時更新 `sw.js` 的 cache 版本，已安裝的裝置才會拿到新內容。
- 根目錄如果要加 service worker，要注意它的 scope `/family-trips/` 會涵蓋所有旅程資料夾；
  它只能處理根目錄自己的檔案，不能攔截或快取旅程資料夾的請求。

## 新增或更新旅程

1. 旅程資料夾放入加密後的 `app.bin`、解鎖頁 `index.html`、`sw.js`、`manifest.webmanifest`、圖示。
2. **同步更新根目錄 `index.html` 的加密旅程列表**（用同一組密碼和 salt 加密）。
3. 每個 HTML 頁都要有 `<meta name="robots" content="noindex, nofollow">`。
   （`robots.txt` 只有放在網域根目錄才有效，這裡的 `/family-trips/robots.txt` 搜尋引擎不會讀。）
4. 解鎖頁的 `<title>`、meta / og 標籤，以及 manifest 的 `name`、`description`，
   最多只能出現資料夾層級的資訊（地點），不能有日期、住宿、人名等細節。

## Commit 訊息

- 不能包含行程細節：除了資料夾名稱（年月與地點）以外，不能寫日期、住宿、航班、人名、預約號碼。
- 好的例子：`Add encrypted trip <資料夾名稱>`、`Update encrypted bundle for <資料夾名稱>`
- 同樣的規則也適用於分支名稱、PR 標題與說明、issue。
