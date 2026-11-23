# 室內配線丙級學習網站｜開發紀錄與 GitHub 使用教學

最後更新：2026 年 11 月 23 日  
專案位置：`C:\Users\User\Tool-Robot\indoor-wiring-learning`

## 一、專案簡介

這是一套使用筆電瀏覽器操作的「室內配線丙級學術科互動練習網站」，目前包含：

- 術科第一題：液位控制配線練習。
- 術科第二題：單相感應電動機正反轉控制配線練習。
- 元件端子點選、接線、刪線與接線檢查。
- 固定線槽與直角走線，讓配線比較容易追蹤。
- 正轉、停止、反轉、互鎖、過載等虛擬通電測試。
- 8 題電動機入門學科練習。
- 80 題、100 分鐘、60 分及格的學科模擬考。
- 學習成果紀錄與 CSV 匯出。

> 這是教學模擬網站，不可取代正式術科圖面、現場器材說明、安全檢驗或教師指導，也不會控制真實電源。

## 二、遇到的問題與修改紀錄

| 問題 | 原因 | 修改方式 | 結果 |
| --- | --- | --- | --- |
| `node`、`npm`、`pnpm` 無法辨識 | 電腦尚未安裝 Node.js，或安裝路徑還沒有加入環境變數 | 安裝 Node.js，使用 `npm.cmd install --global pnpm` 安裝 pnpm | 可正常執行 Vite 開發網站 |
| PowerShell 顯示「系統已停用指令碼執行」 | PowerShell 阻擋 `npm.ps1` | 在 Windows 改用 `npm.cmd` 與 `pnpm.cmd` | 不必修改整台電腦的執行原則也能使用 |
| 瀏覽器顯示 `ERR_CONNECTION_REFUSED` | Vite 終端機被關閉，或按下 `Ctrl+C` 停止了網站 | 重新執行 `pnpm.cmd dev`，並保持終端機開啟 | 本機網站恢復連線 |
| 接線太多，看不清楚線從哪裡到哪裡 | 電線直接穿過元件，路徑彼此重疊 | 改為直角走線、固定線槽、選取單條電線時醒目顯示，並在下方顯示接線清單 | 配線比較容易閱讀與刪除 |
| 接完線後出現多餘的一小段 | 線路折點超過終點，端點座標沒有正確收尾 | 修正路由終點與線段合併邏輯 | 電線會停在所選端子，不再多出一節 |
| 元件只有文字方塊，不容易辨認 | 初版只做功能原型 | 加入電源、開關、按鈕、接觸器、積熱電驛、燈號、蜂鳴器、端子台、馬達等圖形 | 元件更接近配線盤的視覺配置 |
| 網路找到的配線盤照片不適合放進網站 | 圖片來源與使用權不確定，而且照片模糊 | 移除該照片，改用自行製作的元件圖形與官方圖面資料 | 避免把來源不明圖片上傳至 GitHub |
| 第二題端子與接線規則不完整 | 初版元件端子數量與官方圖面不一致 | 依官方 B11 圖面補齊接觸器、積熱電驛、端子台、馬達與保護接地端子 | 可進行完整接線檢查與模擬測試 |
| 線色是否可以隨便選 | 不同用途的導線應有清楚區分，保護接地不可當成一般控制線 | 網站提供紅、白、黑、綠等線色，並限制綠線只用於保護接地 | 線色使用更符合教學目的 |
| 學科只有少量題目，無法模擬正式考試 | 最初只有 8 題入門練習 | 加入固定 80 題模擬考、100 分鐘計時、每題 1.25 分與 60 分及格規則 | 可進行完整題數的模擬作答 |
| 錯題重練後需要保留學習紀錄 | 原本只顯示當次結果 | 加入最近完成紀錄、錯題重練與成果儀表板 | 可查看學科與術科完成狀況 |
| CSV 的 `8 / 8` 在 Excel 被顯示成 `8月8日` | Excel 自動把斜線格式判定為日期 | 匯出內容改成「答對 8 題（共 8 題）」 | Excel 不會再把答對題數改成日期 |
| 重新整理後進度消失 | 瀏覽器頁面狀態沒有保存 | 使用瀏覽器本機儲存保存接線、作答與完成紀錄 | 同一台電腦重新整理後可繼續操作 |

## 三、目前完成的主要功能

### 術科配線

- 可切換第一題與第二題。
- 可點選兩個端子完成接線，也可拖曳接線。
- 可選擇紅、白、黑、綠色導線。
- 可顯示單條電線、全部電線或刪除指定電線。
- 電線會依固定線槽以直角路徑排列。
- 可檢查缺線、錯接、多餘接線及接地錯誤。
- 接線通過後可執行正轉、停止、反轉、互鎖與過載測試。

### 學科練習

- 8 題入門練習與錯題重練。
- 80 題模擬考。
- 顯示得分、答對題數、是否及格及作答時間。
- 未作答題目可快速定位。

### 成果紀錄

- 顯示學科與術科的完成時間和結果。
- 術科記錄檢查次數、錯誤次數與提示次數。
- 可匯出 CSV，使用 Excel 開啟。

## 四、目前測試結果

最近一次完整檢查結果：

- 自動測試：25 個測試檔，共 104 項測試通過。
- 正式建置：成功。
- 瀏覽器主控台錯誤：0。
- 第一題與第二題參考接線可通過接線檢查。
- 學科 8 題練習、80 題模擬考、成果紀錄與 CSV 匯出可正常使用。

如有修改程式，請重新執行：

```powershell
pnpm.cmd test
pnpm.cmd build
```

## 五、如何在自己的電腦開啟網站

### 方法 A：使用快速啟動檔

在檔案總管雙擊：

```text
C:\Users\User\Tool-Robot\開啟室內配線網站.cmd
```

啟動後不要關閉命令提示字元視窗。關閉視窗後，本機網站也會停止。

### 方法 B：使用 VS Code 終端機

1. 用 VS Code 開啟 `C:\Users\User\Tool-Robot`。
2. 按上方「終端機」→「新增終端機」。
3. 依序執行：

```powershell
cd C:\Users\User\Tool-Robot\indoor-wiring-learning
pnpm.cmd install
pnpm.cmd dev
```

4. 終端機會顯示類似以下網址：

```text
http://127.0.0.1:5173/
```

5. 按住 `Ctrl` 再點網址，或將網址貼到瀏覽器。
6. 使用完畢後，在終端機按 `Ctrl+C` 停止網站；若出現確認問題，輸入 `Y` 再按 Enter。

### 常見啟動問題

- 顯示「無法連上這個網站」：先確認執行 `pnpm.cmd dev` 的終端機還開著。
- 顯示連接埠不是 `5173`：Vite 可能改用 `5174` 或其他號碼，請開啟終端機當次顯示的網址。
- 顯示找不到 `pnpm.cmd`：執行 `npm.cmd install --global pnpm`，再關閉並重新開啟 VS Code。

## 六、第一次上傳到 GitHub

目前專案已經有 Git 紀錄，但尚未設定 GitHub 遠端網址。以下步驟只需要做一次。

### 步驟 1：建立 GitHub 儲存庫

1. 登入 [GitHub](https://github.com/)。
2. 右上角按 `+`，選擇 `New repository`。
3. Repository name 可輸入：

```text
indoor-wiring-learning
```

4. 論文尚未公開前，建議先選擇 `Private`。
5. **不要勾選**新增 README、`.gitignore` 或 License，避免第一次上傳發生衝突。
6. 按 `Create repository`。
7. 複製 GitHub 顯示的 HTTPS 網址，例如：

```text
https://github.com/你的帳號/indoor-wiring-learning.git
```

### 步驟 2：確認不要上傳的檔案

專案的 `.gitignore` 已排除：

- `node_modules/`：可重新安裝的套件，檔案很多。
- `dist/`：可重新產生的建置結果。
- `tmp/`：瀏覽器測試與圖片處理暫存檔。
- `*.tsbuildinfo`：TypeScript 暫存資料。
- `.superpowers/`：本機工作流程資料。

執行以下指令確認待上傳內容：

```powershell
cd C:\Users\User\Tool-Robot\indoor-wiring-learning
git status
```

不要上傳帳號密碼、存取權杖、私人照片或包含個人資料的檔案。

### 步驟 3：建立第一次版本

在 VS Code 終端機執行：

```powershell
cd C:\Users\User\Tool-Robot\indoor-wiring-learning
git add .
git commit -m "完成室內配線學習網站初版"
git branch -M main
```

### 步驟 4：連接 GitHub 並上傳

將下面的網址換成你剛才複製的 GitHub 網址：

```powershell
git remote add origin https://github.com/你的帳號/indoor-wiring-learning.git
git push -u origin main
```

第一次上傳時，Windows 可能開啟瀏覽器要求登入 GitHub。完成授權後回到 VS Code 等待上傳結束。

如果輸入 `git remote add origin` 後顯示 `remote origin already exists`，改用：

```powershell
git remote set-url origin https://github.com/你的帳號/indoor-wiring-learning.git
git push -u origin main
```

### 步驟 5：到 GitHub 檢查

重新整理 GitHub 儲存庫頁面，應該可以看到：

- `src/`
- `public/`
- `docs/`
- `README.md`
- `PROJECT_LOG.md`
- `package.json`

不應該看到 `node_modules/`、`dist/` 或 `tmp/`。

## 七、以後修改後如何更新 GitHub

每次修改完成後，在專案資料夾執行：

```powershell
git status
git add .
git commit -m "簡短說明這次修改了什麼"
git push
```

提交訊息範例：

```text
修正接線多餘線段
改善第二題線槽走線
新增第一題液位控制
新增80題學科模擬考
新增學習成果CSV匯出
修正Excel將答對題數顯示成日期
```

建議一次修改一個功能並提交一次。這樣如果之後出現問題，比較容易找到是哪一次修改造成的。

## 八、從 GitHub 下載後如何使用

另一台電腦先安裝 Git 與 Node.js，再執行：

```powershell
git clone https://github.com/你的帳號/indoor-wiring-learning.git
cd indoor-wiring-learning
npm.cmd install --global pnpm
pnpm.cmd install
pnpm.cmd dev
```

之後開啟終端機顯示的本機網址即可。

## 九、目前限制與後續建議

- 術科目前主要完成第一題與第二題，其他題目尚未加入。
- 80 題模擬考是目前整理的固定題組，不代表正式考試一定會出現相同題目。
- 學習紀錄儲存在目前瀏覽器，清除網站資料後紀錄會消失。
- 尚未加入帳號、雲端同步、教師後台與資料庫。
- 目前最適合的下一步是先完成 GitHub 備份，再決定新增下一題或改善既有配線畫面。

## 十、下一步

完成本文件後，依序進行：

1. 執行 `git status`，確認待上傳檔案。
2. 到 GitHub 建立空白的 Private 儲存庫。
3. 依「第六節」指令完成第一次上傳。
4. 上傳後打開 GitHub 的 `PROJECT_LOG.md`，確認中文與表格顯示正常。

