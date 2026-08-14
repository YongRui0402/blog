# blog

[blog.羊.tw](https://blog.xn--ht0a.tw) 的原始碼 —— BDGG 的韌體、嵌入式與自架服務筆記。

Hugo 靜態站,自製版型,無外部佈景主題依賴。

## 這個 repo 是唯讀的鏡像

內容由一個私有的 staging repo 同步過來,**不要直接在這裡寫文章** ——
下次同步會被覆蓋掉。

錯字、事實錯誤、失效連結歡迎開 issue。

## 本機建置

```bash
hugo server        # http://localhost:1313
hugo --minify      # 產出到 public/
```

需要 Hugo **v0.165.0** extended。版本寫死在
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 裡。

## 授權

文章內容 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant),
版型與設定檔 MIT。
