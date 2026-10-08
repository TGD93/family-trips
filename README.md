# family-trips

家族旅遊行程網站，透過 GitHub Pages 發布。

每趟旅行是一個獨立的小網站。行程內容全部加密，需要輸入家族密碼才能在瀏覽器裡解開閱讀；
這個 repo 只放加密後的檔案，明文行程與建置工具不在這裡。

## 資料夾結構

```
family-trips/
├─ index.html              入口頁（加密的旅程列表）
├─ robots.txt              禁止搜尋引擎索引
├─ .nojekyll               關閉 GitHub Pages 的 Jekyll 處理
├─ README.md
├─ CLAUDE.md               維護規則（給 Claude session 看）
└─ YYYY-MM-<地點>/         每趟旅程一個資料夾，地點用英文小寫
   ├─ index.html           解鎖頁
   ├─ app.bin              加密的行程內容
   ├─ sw.js                Service worker（離線瀏覽）
   ├─ manifest.webmanifest
   └─ 圖示檔
```

每趟旅程的網址：`https://tgd93.github.io/family-trips/<資料夾名稱>/`
