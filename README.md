# ProjectFrontendOne (Next.js eCommerce + Admin)

Frontend cho hệ thống bán hàng, gồm storefront (client) và admin. Ứng dụng chạy trên Next.js 15, React 19, TailwindCSS, Redux Toolkit (redux-persist) và gọi backend qua API Gateway.

## Tech stack
- Next.js (App Router), TypeScript, TailwindCSS
- Redux Toolkit + redux-persist để quản lý state (auth, cart, brand, category, order)
- Native Fetch với wrapper `fetchWithAuth` (tự động gắn/refresh token) và helper `apiFetch`
- UI: lucide-react, framer-motion, react-toastify, swiper

## Tính năng chính
- Storefront: duyệt sản phẩm, chi tiết, giỏ hàng, checkout, áp dụng voucher
- Auth + token refresh (wrapper `fetchWithAuth`)
- Admin: dashboard, quản lý đơn hàng/sản phẩm/voucher (Next.js server components cho admin)
- Tích hợp API Gateway: `http://103.90.225.90:8080` (xem `src/utils/apiConfig.ts`)

## Cấu trúc thư mục chính
- `src/app/(client-app)/(pages)`: trang client (App Router)
- `src/app/admin-app`: trang admin
- `src/components/client` / `src/components/server` / `src/components/admin`: UI thành phần
- `src/redux`: store, slice, persist config
- `src/services`: lớp gọi API (voucher, order, product, review, revenue, user, …) dùng `fetchWithAuth`
- `src/utils`: `refreshToken.ts`, `apiConfig.ts`, helpers, cookies

## Thiết lập & chạy
Yêu cầu: Node.js 18+.

```bash
npm install           # cài dependencies
npm run dev           # chạy dev với Turbopack
npm run build         # build production
npm start             # chạy production sau khi build
npm run lint          # kiểm tra lint
```

## Cấu hình API
- Gateway mặc định: `API_CONFIG.GATEWAY_URL = http://103.90.225.90:8080` (xem `src/utils/apiConfig.ts`)
- Các service dùng `fetchWithAuth` để tự động đính kèm Bearer token và refresh khi hết hạn (`src/utils/refreshToken.ts`)
- Khi cần đổi endpoint/gateway, chỉnh tại `src/utils/apiConfig.ts`

## Lưu ý bảo mật
- Không commit token thật/secret vào repo.
- `fetchWithAuth` ưu tiên token từ header/cookie; cần cấu hình backend CORS + `credentials: include` như trong `apiFetch`.

## Build/Deploy nhanh
- Dev: `npm run dev`
- Prod: `npm run build && npm start`
- Có Dockerfile/docker-compose để triển khai container (cần cấu hình env tương ứng gateway/token nếu bổ sung).

### Script .sh kèm Docker Compose
- `./build.sh`: dừng container cũ, build image không cache, prune image thừa.
- `./start.sh`: kiểm tra Docker, bật container (`docker compose up -d`), chờ và kiểm tra trạng thái.
- `./stop.sh`: dừng stack `nextjs-commerce`, in trạng thái container.
- `./logs.sh`: theo dõi log `docker compose` (tail 100, follow).
- `./clean.sh`: hỏi xác nhận, prune container dừng, image, cache build (tùy chọn volume).

## Liên quan khác
- Ảnh/tài nguyên tĩnh: nằm trong `public/`
- Custom hooks preload/hydration: `src/hooks/useOptimizedHydration.ts`, `usePreloadImportantPages.ts`
- Middleware Next.js: `middleware.ts` (các chặn/redirect nếu có)
