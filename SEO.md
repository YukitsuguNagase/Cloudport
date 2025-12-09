---
title: "S3 + CloudFront 静的サイトSEO（AI取り込み用）"
audience: ["engineers", "ops", "marketers"]
scope: ["S3", "CloudFront", "static-site", "SPA"]
goal: "Googleにクロール・インデックスされやすくし、重複/Soft404などの事故を防ぐ"
last_updated: "2025-12-08"
placeholders:
  site_origin: "S3 (static hosting or REST)"
  site_url: "https://example.com"
  canonical_host: "example.com (wwwなし/ありはどちらかに統一)"
---

# 1. TL;DR（最短で効く順）

1) **Google Search Console 登録** → **サイトマップ送信**  
2) **正規URLを1つに統一**（https / www有無 / 末尾スラッシュ / index.html）→ **301で寄せる**  
3) **robots.txt と sitemap.xml をルートに配置**  
4) **Soft 404 を作らない**（存在しないURLが200で返る事故を潰す）  
5) **キャッシュ戦略**（robots/sitemap更新がCloudFrontに残って反映遅延しないように）  

---

# 2. 前提・用語（AIが誤解しないための定義）

- **正規URL（canonical URL）**: 検索評価を集約したい「正」とするURL。  
- **重複コンテンツ**: 同じ内容が複数URLで見える状態（例: http/https, www有無, / と /index.html）。  
- **Soft 404**: 実質404なのに **HTTP 200** を返す状態（SPAでよく起きる）。  
- **301 / 302**:
  - 301: 恒久的な移転（評価を寄せたい）
  - 302: 一時的な移転（恒久用途に使うと事故りやすい）

---

# 3. 実装タスク一覧（チェックリスト）

## 3.1 インデックス導線（必須）
- [ ] Search Console で `site_url` を登録（推奨: Domainプロパティ）
- [ ] `site_url/sitemap.xml` を送信
- [ ] 「URL検査」で主要ページを検査し、必要ならインデックス登録をリクエスト

## 3.2 URL正規化（必須）
- [ ] `http → https` を統一
- [ ] `wwwあり/なし` を統一（どちらかに固定）
- [ ] `index.html` の有無を統一
- [ ] `末尾スラッシュ` の有無を統一
- [ ] 非正規URL → 正規URLへ **301**（恒久）

## 3.3 robots / sitemap（必須）
- [ ] `site_url/robots.txt` を配置
- [ ] `site_url/sitemap.xml` を配置
- [ ] robots.txt に sitemap のURLを明記
- [ ] sitemap.xml は **正規URLのみ** を列挙（404/リダイレクト先は入れない）

## 3.4 CloudFront特有の事故防止（必須）
- [ ] Soft 404（存在しないURLが200）を潰す
- [ ] 404/403/500の **ステータスコード設計** を決める（200に潰さない）
- [ ] robots.txt / sitemap.xml の **キャッシュ方針**（TTL/Invalidation）を決める

## 3.5 ページ側の基本（推奨）
- [ ] 各ページに固有の `title`
- [ ] `meta description`
- [ ] 見出し構造（H1/H2/H3）
- [ ] 必要に応じて `rel=canonical`
- [ ] 内部リンク（孤立ページを作らない）
- [ ] 画像に `alt`

---

# 4. robots.txt（テンプレ）

**配置場所**: `site_url/robots.txt`

```txt
User-agent: *
Disallow:
Sitemap: https://example.com/sitemap.xml
```

注意（重要）:
- robots.txt は **クロール制御**。検索結果から除外したい場合は **noindex** を検討（HTML meta / HTTP header）。

---

# 5. sitemap.xml（ルール + 最小例）

## 5.1 ルール（AI向けに明文化）
- `loc` は **正規URLのみ**  
- 404になるURL、301で別URLに飛ぶURLは入れない  
- SPAでも「実在ページ（=意味のあるURL）」だけを入れる  
- 更新が多いサイトはビルド時に自動生成が安全  

## 5.2 最小例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-12-08</lastmod>
  </url>
  <url>
    <loc>https://example.com/docs/</loc>
    <lastmod>2025-12-01</lastmod>
  </url>
</urlset>
```

---

# 6. CloudFront / S3 で一番多い失敗: Soft 404

## 6.1 症状
- 存在しないURL（例: `/aaa/bbb`）にアクセスしても **HTTP 200** が返る  
- 中身は `index.html`（または薄いNot Found UI）  
- Search Console で「クロール済み - インデックス未登録」や Soft 404 が増えることがある

## 6.2 原因（典型）
- SPAのために「どんなパスでも index.html を返す」設定にしている  
- CloudFrontのカスタムエラーで 404/403 を index.html にマッピングし、**レスポンスコードも200にしている**

## 6.3 対策（推奨の順）
1) **存在しないパスは 404 を返す**（可能ならこれが最善）  
2) SPAが必須で index.html 返しが必要なら:
   - Not Found を明確に表示
   - サイトマップに存在しないURLを入れない
   - noindex を付ける/付けないを運用方針として決める（ケースバイケース）

---

# 7. ステータスコード設計（AIが判断しやすいルール）

## 7.1 望ましい基本方針
- **正規ページ**: 200  
- **恒久移転**: 301  
- **一時移転**: 302（恒久用途に使わない）  
- **存在しない**: 404  
- **メンテ/一時停止（可能なら）**: 503  

## 7.2 CloudFrontカスタムエラーの注意
- 「エラーを別ページに差し替える」場合でも、**レスポンスコードを200に潰すとSEO事故**になりやすい  
- 404相当は404で返すのが安全（できる範囲で）

---

# 8. キャッシュ戦略（robots/sitemapの反映遅延を防ぐ）

## 8.1 よくある事故
- robots.txt / sitemap.xml を更新したのに、CloudFrontキャッシュが残ってGoogleが古い版を取得し続ける

## 8.2 対策
- `robots.txt` と `sitemap.xml` は **TTL短め**（例: 数分〜数時間）にする  
- 更新時に **Invalidation**（必要に応じて）  
- デプロイ手順に「robots/sitemap更新 → Invalidation」を組み込むと運用が安定する

---

# 9. ページ側（HTML/コンテンツ）: 最低限の仕様

## 9.1 head（推奨セット）
- `title`: ページ固有、短すぎず長すぎず
- `meta name="description"`: 内容を要約
- `link rel="canonical"`: 重複URLの可能性がある場合に付与
- 構造化データ（JSON-LD）: 対象コンテンツが明確なら追加

## 9.2 body（推奨セット）
- H1は主題（推奨: 1ページ1つ）
- H2/H3で論理構造
- 内部リンク（重要ページへ辿れる導線）
- 画像は意味がある場合 `alt` を書く

---

# 10. 監視・運用（Search Consoleで見る場所）

- **サイトマップ**: 取得成功/失敗、送信URL数と検出URL数  
- **ページのインデックス**:
  - 除外理由（404、ソフト404、重複、クロール済み - インデックス未登録、など）
- **Core Web Vitals / ページエクスペリエンス**: 速度とUXの問題検出  
- **手動による対策**: 重大な問題があればここに出る

運用ルール（推奨）:
- URL構造を変えるときは **301** を必ずセット  
- 大改修後は:
  - sitemap更新
  - 主要ページのURL検査
  - 必要ならInvalidation

---

# 11. SPA vs 静的HTML（判断フロー）

## 11.1 判断フロー（簡易）
- 主要ページが **HTMLとして意味ある内容を返している**（title/description/本文が初回から出る）
  - YES → 通常SEO施策で戦える可能性が高い
  - NO → SSG/プリレンダ導入の検討価値が高い

## 11.2 メモ
- GoogleはJSをレンダリングできるが、速度・メタの動的生成・Soft404などで不利になりやすい  
- 可能なら主要ページだけでもSSG/プリレンダを検討

---

# 12. コピペ用テンプレ集

## 12.1 robots.txt
```txt
User-agent: *
Disallow:
Sitemap: https://example.com/sitemap.xml
```

## 12.2 “正規URL統一”のメモ（置換用）
- 正: `https://example.com/`
- 非正規:
  - `http://example.com/` → 301 → `https://example.com/`
  - `https://www.example.com/` → 301 → `https://example.com/`
  - `https://example.com/index.html` → 301 → `https://example.com/`（設計により）

---

# 13. 追加情報があれば最適化できる入力項目（任意）

- 独自ドメインの有無 / `www` の方針
- SPAかSSGか（例: React/Vue/Next/Astroなど）
- 末尾スラッシュ方針
- CloudFrontのカスタムエラー設定（404/403の扱い）
- ページ数・更新頻度・コンテンツ種別（ブログ/LP/Docs）
